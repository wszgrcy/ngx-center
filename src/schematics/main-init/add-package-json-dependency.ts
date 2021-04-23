import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematics } from '../../types';
import {
  addPackageJsonDependency,
  NodeDependencyType,
  removePackageJsonDependency,
} from '@schematics/angular/utility/dependencies';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as fs from 'fs';
import * as path from 'path';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
async function addWebpackDependency(tree: Tree, context: SchematicContext) {
  let workspace: WorkspaceSchema = JSON.parse(
    tree.read('angular.json')!.toString()
  );
  let isYarn = false;
  if (workspace.cli && (workspace.cli as any).packageManager) {
    isYarn = (workspace.cli as any).packageManager === 'yarn';
  }
  let existPackageLockJson = fs.existsSync(
    path.resolve(process.cwd(), 'package-lock.json')
  );
  let webpackVersion: string;
  let existWebpack: boolean = false;
  if (existPackageLockJson) {
    let config = JSON.parse(
      fs
        .readFileSync(path.resolve(process.cwd(), 'package-lock.json'))
        .toString()
    );
    if (config.dependencies['webpack']) {
      existWebpack = true;
    }
    if (config.dependencies['@angular-devkit/build-angular']) {
      webpackVersion =
        config.dependencies['@angular-devkit/build-angular'].requires[
          'webpack'
        ];
    }
  }
  if (isYarn) {
    return;
  }
  if (existWebpack) {
    return;
  }
  if (webpackVersion!) {
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Dev,
      name: 'webpack',
      version: webpackVersion,
    });
  } else {
    context.logger.warn(
      '未找到`@angular-devkit/build-angular`依赖的`webpack`版本,请自行安装'
    );
  }
}
export class AddPackageJsonDependency implements RunSchematics {
  constructor(private config: MainInitSchematics) {}
  run(): Rule {
    return async (tree: Tree, context: SchematicContext) => {
      [
        {
          type: NodeDependencyType.Dev,
          name: 'webpack-ng-dll-plugin',
          version: '2.0.9',
        },
        {
          type: NodeDependencyType.Dev,
          name: 'webpack-bootstrap-assets-plugin',
          version: '1.0.8',
        },
      ].forEach((dependency) => addPackageJsonDependency(tree, dependency));
      if (this.config.webpackMode === '@angular-builders/custom-webpack') {
        addPackageJsonDependency(tree, {
          type: NodeDependencyType.Dev,
          name: '@angular-builders/custom-webpack',
          version: '^11.1.1',
        });
      }
      await addWebpackDependency(tree, context);
      context.addTask(new NodePackageInstallTask());
    };
  }
}
