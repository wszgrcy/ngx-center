import {
  apply,
  chain,
  mergeWith,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { RunSchematics } from '../../types';
import { strings } from "@angular-devkit/core";
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { relative } from "path";
export class AddWebpackConfig implements RunSchematics {
  constructor(private options: MainInitSchematics) {}
  run(): Rule {
    return (tree: Tree, context: SchematicContext) => {
      let workspace: WorkspaceSchema = JSON.parse(
        tree.read('angular.json')!.toString()
      );
      let projectName = this.options.projectName! || workspace.defaultProject!||
      Object.keys(workspace.projects).length == 1
        ? Object.keys(workspace.projects)[0]
        : '';;
      let sourceRoot = workspace.projects[projectName].sourceRoot;

      return mergeWith(
        apply(url('./template/webpack-config'), [
          template({
            dllName: this.options.dllName,
            ...strings,
            sourceRoot,
          }),
          renameTemplateFiles(),
        ])
      );
    };
  }
}
