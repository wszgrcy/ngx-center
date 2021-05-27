import { strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  SchematicContext,
  Tree,
  url,
  template,
  renameTemplateFiles,
  move,
} from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { RunSchematics } from '../../types';
import { findNodeAtLocation, parseTree } from 'jsonc-parser';
export class ChangeApplication implements RunSchematics {
  constructor(private options: SubSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let workspace: any = JSON.parse(tree.read('angular.json')!.toString());

      tree.delete(
        `${workspace.newProjectRoot}/${this.options.name}/src/main.ts`
      );
      tree.delete(
        `${workspace.newProjectRoot}/${this.options.name}/src/app/app.module.ts`
      );
      tree.overwrite(
        `${workspace.newProjectRoot}/${this.options.name}/src/app/app.component.html`,
        `<p>${strings.dasherize(this.options.name)} works!</p>`
      );
      tree.delete(
        `${workspace.newProjectRoot}/${this.options.name}/src/favicon.ico`
      );
      tree.delete(
        `${workspace.newProjectRoot}/${this.options.name}/src/index.html`
      );
      this.changeTsconfig(tree, workspace);
      return mergeWith(
        apply(url('./template/application'), [
          template({}),
          renameTemplateFiles(),
          move(
            './app.module.ts',
            `${workspace.newProjectRoot}/${this.options.name}/src/app/app.module.ts`
          ),
          move(
            './main.ts',
            `${workspace.newProjectRoot}/${this.options.name}/src/main.ts`
          ),
        ])
      );
    };
  }
  changeTsconfig(tree: Tree, workspace: any) {
    let tsconfigPath = `${workspace.newProjectRoot}/${this.options.name}/tsconfig.app.json`;
    let content = tree.read(tsconfigPath)?.toString()!;
    let node = parseTree(content)!;
    let filesNode = findNodeAtLocation(node, ['files']);
    let preNodeIndex = 0;
    let polyFillsNode = filesNode?.children?.find((item, i) => {
      preNodeIndex = i - 1;
      return item.value.includes('polyfills');
    });
    let recorder = tree.beginUpdate(tsconfigPath);
    let start =
      preNodeIndex > 0
        ? filesNode!.children![preNodeIndex].offset +
          filesNode!.children![preNodeIndex].length
        : polyFillsNode?.offset!;
    let length =
      preNodeIndex > 0
        ? polyFillsNode?.length! +
          polyFillsNode?.offset! -
          filesNode!.children![preNodeIndex].offset -
          filesNode!.children![preNodeIndex].length
        : polyFillsNode?.length!;
    recorder.remove(start, length);
    tree.commitUpdate(recorder);
    content = tree.read(tsconfigPath)?.toString()!;
  }
}
