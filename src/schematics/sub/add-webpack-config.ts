import { strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  renameTemplateFiles,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { RunSchematics } from '../../types';

export class AddWebpackConfig implements RunSchematics {
  constructor(private options: SubSchematics) {}

  run() {
    // todo 修改模板插件,隐藏全局变量
    return async (tree: Tree, context: SchematicContext) => {
      let workspace: WorkspaceSchema = JSON.parse(
        tree.read('angular.json')!.toString()
      );
      let mainProjectName =
        this.options!.mainProjectName! || workspace!.defaultProject!;
      return mergeWith(
        apply(url('./template/webpack-config'), [
          template({
            name: this.options.name,
            sourceRoot: workspace.projects[mainProjectName].sourceRoot,
            ...strings,
          }),
          renameTemplateFiles(),
        ])
      );
    };
  }
}
