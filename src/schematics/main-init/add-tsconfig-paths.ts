import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { findNodeAtLocation, parseTree } from 'jsonc-parser';
import { RunSchematics } from '../../types';

export class AddTsconfigPaths implements RunSchematics {
  constructor(private options: MainInitSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let content: string;
      let tsconfigPath = 'tsconfig.json';
      if (tree.exists(tsconfigPath)) {
        content = tree.read(tsconfigPath)?.toString()!;
      } else {
        return console.warn('no tsconfig.json');
      }
      let workspace: WorkspaceSchema = JSON.parse(
        tree.read('angular.json')?.toString()!
      );
      let projectName = this.options.projectName! || workspace.defaultProject!||
      Object.keys(workspace.projects).length == 1
        ? Object.keys(workspace.projects)[0]
        : '';;
      let sourceRoot = workspace.projects[projectName].sourceRoot!;
      let pathsReMap = `"@center-main/*":["${sourceRoot}/*"]`;
      let node = parseTree(content)!;
      let pathsNode = findNodeAtLocation(node, ['compilerOptions', 'paths']);
      let recorder = tree.beginUpdate(tsconfigPath);

      if (pathsNode) {
        let addComma = pathsNode.children && pathsNode.children.length;
        recorder.insertRight(
          pathsNode.offset! + pathsNode.length - 1,
          `${addComma ? ',' : ''}${pathsReMap}`
        );
      } else {
        let compilerOptionsNode = findNodeAtLocation(node, [
          'compilerOptions',
        ])!;
        let addComma =
          compilerOptionsNode.children && compilerOptionsNode.children.length;
        let insertPosition =
          compilerOptionsNode?.offset! + compilerOptionsNode?.length! - 1;
        recorder.insertRight(
          insertPosition,
          `${addComma ? ',' : ''}"paths":{${pathsReMap}}`
        );
      }
      tree.commitUpdate(recorder);
    };
  }
}
