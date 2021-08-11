import { SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  ProjectType,
  WorkspaceSchema,
  WorkspaceTargets,
} from '@schematics/angular/utility/workspace-models';
import { RunSchematics } from '../../types';
import { strings } from '@angular-devkit/core';

export class ChangeAngularJson implements RunSchematics {
  constructor(private options: SubSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let workspace: WorkspaceSchema = JSON.parse(
        tree.read('angular.json')!.toString()
      );
      let architect: WorkspaceTargets<ProjectType.Application> | undefined =
        workspace?.projects[this.options.name]?.architect;
      if (this.options.webpackMode === '@angular-builders/custom-webpack') {
        this['@angular-builders/custom-webpack'](architect);
      }
      if (architect?.build) {
        (architect.build as any).defaultConfiguration = 'development';
        (
          architect.build.configurations?.production as any
        ).deployUrl = `${this.options.name}/`;
      }
      if (architect?.build?.options) {
        architect.build.options.extractLicenses = false;
        architect!.build!.options.vendorChunk = false;
        (
          architect!.build!.options as any
        ).deployUrl = `http://127.0.0.1:${this.options.port}/`;
      }
      if (architect?.serve?.options) {
        let serveConfig = {
          port: +this.options.port,
          servePath: `/`,
          disableHostCheck: true,
        };
        architect.serve.options = {
          ...architect.serve.options,
          ...serveConfig,
        };
      }
      architect!.build!.options.index = '';
      architect!.build!.options.polyfills = '';
      architect!.build!.options.styles = [];

      tree.overwrite('angular.json', JSON.stringify(workspace, undefined, 2));
    };
  }

  '@angular-builders/custom-webpack'(
    architect: WorkspaceTargets<ProjectType.Application> | undefined
  ) {
    let projectName: string = this.options.name;
    if (architect?.build) {
      architect!.build!.builder =
        '@angular-builders/custom-webpack:browser' as any;
    }
    if (architect?.build?.configurations) {
      (architect!.build!.options as any).customWebpackConfig = {
        path: `./webpack.config.${strings.dasherize(this.options.name)}.ts`,
      };
    }
    architect!.serve!.builder =
      '@angular-builders/custom-webpack:dev-server' as any;
    architect!.serve!.options! = architect?.serve?.options || ({} as any);
    (
      architect?.serve?.options as any
    ).publicHost = `0.0.0.0:${this.options.port}`;
  }
}
