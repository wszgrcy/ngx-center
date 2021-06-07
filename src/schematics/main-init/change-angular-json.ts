import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematics } from '../../types';
import {
  ProjectType,
  WorkspaceSchema,
  WorkspaceTargets,
} from '@schematics/angular/utility/workspace-models';
import * as path from 'path';
import { strings } from '@angular-devkit/core';

export class ChangeAngularJson implements RunSchematics {
  readonly CENTER_MAIN = 'center-main';
  readonly CENTER_DLL = 'center-dll';

  constructor(private options: MainInitSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let workspace!: WorkspaceSchema;
      if (tree.exists('angular.json')) {
        workspace = JSON.parse(tree.read('angular.json')!.toString());
      }
      let projectName: string =
        this.options.projectName || workspace.defaultProject!;
      let architect: WorkspaceTargets<ProjectType.Application> =
        workspace.projects[projectName].architect!;
      if (this.options.webpackMode === '@angular-builders/custom-webpack') {
        this['@angular-builders/custom-webpack'](architect);
      }
      let projectBuildConfig = architect?.build?.configurations;
      if (projectBuildConfig) {
        projectBuildConfig[this.CENTER_DLL] = {
          outputPath: `dist/${this.CENTER_DLL}`,
          vendorChunk: false,
          assets: [],
          styles: [],
          scripts: [],
          ...projectBuildConfig[this.CENTER_DLL],
        };
        projectBuildConfig[`${this.CENTER_DLL}-prod`] = {
          ...projectBuildConfig[this.CENTER_DLL],
          optimization: true,
          outputHashing: 'all',
          sourceMap: false,
          namedChunks: false,
          extractLicenses: true,
          buildOptimizer: true,
        };
        projectBuildConfig[this.CENTER_MAIN] = {
          vendorChunk: false,
          index: {
            input: path.posix.join(
              path.dirname(architect?.build?.options.index!),
              `index.${this.CENTER_DLL}.html`
            ),
            output: path.basename(architect?.build?.options.index!),
          } as any,
          assets: [
            ...(architect?.build?.options.assets || []),
            {
              glob: `${strings.dasherize(this.options.dllName!)}.js`,
              input: `./dist/${this.CENTER_DLL}`,
              output: './',
            },
          ],
          ...projectBuildConfig[this.CENTER_MAIN],
        };
        projectBuildConfig[`${this.CENTER_MAIN}-prod`] = {
          ...projectBuildConfig['production'],
          ...projectBuildConfig[this.CENTER_MAIN],
        };
      }
      if (architect?.serve) {
        let browserTarget = architect.serve.options
          ? architect.serve.options.browserTarget
          : Object.values(architect.serve.configurations!)[0].browserTarget!;
        architect.serve.configurations![this.CENTER_MAIN] = {
          browserTarget: `${browserTarget.split(':').slice(0, 2).join(':')}:${
            this.CENTER_MAIN
          }`,
        };
      }
      tree.overwrite('angular.json', JSON.stringify(workspace, undefined, 2));
    };
  }
  '@angular-builders/custom-webpack'(
    architect: WorkspaceTargets<ProjectType.Application>
  ) {
    if (architect?.build) {
      architect!.build!.builder =
        '@angular-builders/custom-webpack:browser' as any;
    }
    if (architect?.build?.configurations) {
      architect!.build!.configurations![this.CENTER_DLL] = {
        customWebpackConfig: { path: `./webpack.config.${this.CENTER_DLL}.ts` },
      } as any;
      architect!.build!.configurations![this.CENTER_MAIN] = {
        customWebpackConfig: {
          path: `./webpack.config.${this.CENTER_MAIN}.ts`,
        },
      } as any;
    }
    if (architect.serve) {
      architect.serve.builder =
        '@angular-builders/custom-webpack:dev-server' as any;
    }
  }
}
