import { SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  ProjectType,
  WorkspaceSchema,
  WorkspaceTargets,
} from '@schematics/angular/utility/workspace-models';
import { findNodeAtLocation, parseTree } from 'jsonc-parser';
import { RunSchematics } from '../../types';
import * as path from 'path';
export class AddTsconfigDllFile implements RunSchematics {
  readonly CENTER_DLL = 'center-dll';

  constructor(private options: MainInitSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let workspace: WorkspaceSchema = JSON.parse(
        tree.read('angular.json')!.toString()
      );
      let projectName = this.options.projectName! || workspace.defaultProject!;
      let tsconfigPath =
        workspace.projects[projectName].architect?.build?.options.tsConfig!;
      let dllTsconfigPath = path.join(
        path.dirname(tsconfigPath),
        'tsconfig.dll.json'
      );
      let architect: WorkspaceTargets<ProjectType.Application> =
        workspace.projects[projectName].architect!;
      let projectBuildConfig = architect?.build?.configurations!;
      projectBuildConfig[this.CENTER_DLL].tsConfig = dllTsconfigPath;
      projectBuildConfig[`${this.CENTER_DLL}-prod`].tsConfig = dllTsconfigPath;
      tree.overwrite('angular.json', JSON.stringify(workspace, undefined, 2));
      tree.create(dllTsconfigPath, tree.read(tsconfigPath)!);
      let node = parseTree(tree.read(dllTsconfigPath)!.toString())!;
      let filesNode = findNodeAtLocation(node, ['files']);
      if (filesNode?.children?.length! > 1) {
        let recorder = tree.beginUpdate(dllTsconfigPath);
        let lastChildrenNode =
          filesNode!.children![filesNode?.children?.length! - 1];
        let removeStart =
          filesNode?.children![0].offset! + filesNode?.children![0].length!;
        recorder.remove(
          removeStart,
          lastChildrenNode.offset + lastChildrenNode.length - removeStart
        );
        tree.commitUpdate(recorder);
      }
    };
  }
}
