import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { RunSchematics } from '../../types';
import { strings } from '@angular-devkit/core';

export class ChangeAngularJson implements RunSchematics {
  constructor(private options: SubSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let workspace: WorkspaceSchema = JSON.parse(
        tree.read('angular.json')!.toString()
      );
      if (this.options.webpackMode === '@angular-builders/custom-webpack') {
        this['@angular-builders/custom-webpack'](workspace);
      }
      if (workspace?.projects[this.options.name]?.architect?.build?.options) {
        (workspace!.projects![this.options.name]!.architect!
          .build!.options as any).vendorChunk = false;
      }
      tree.overwrite('angular.json', JSON.stringify(workspace, undefined, 2));
    };
  }

  '@angular-builders/custom-webpack'(workspace: WorkspaceSchema) {
    let projectName: string = this.options.name;
    if (workspace?.projects[projectName]?.architect?.build) {
      workspace!.projects![
        projectName
      ]!.architect!.build!.builder = '@angular-builders/custom-webpack:browser' as any;
    }
    if (workspace?.projects[projectName]?.architect?.build?.configurations) {
      (workspace!.projects![projectName]!.architect!.build!
        .options as any).customWebpackConfig = {
        path: `./webpack.config.${strings.dasherize(this.options.name)}.ts`,
      };
    }
  }
}
