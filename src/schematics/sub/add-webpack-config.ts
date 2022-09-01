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
      // 官方废弃了默认项目,所以需要手动指定主项目
      let mainProjectName = this.options!.mainProjectName!;
      return mergeWith(
        apply(url('./template/webpack-config'), [
          template({
            port: this.options.port,
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
