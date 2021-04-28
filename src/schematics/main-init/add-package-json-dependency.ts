import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematics } from '../../types';
import {
  addPackageJsonDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as fs from 'fs';
import * as path from 'path';
import { getConfiguredPackageManager } from '@angular/cli/utilities/config';
async function addWebpackDependency(tree: Tree, context: SchematicContext) {
  let packageManager = await getConfiguredPackageManager();
  if (packageManager === 'yarn') {
    return;
  }
  let existPackageLockJson = fs.existsSync(
    path.resolve(process.cwd(), 'package-lock.json')
  );
  let webpackVersion: string;
  if (existPackageLockJson) {
    let config = JSON.parse(
      fs
        .readFileSync(path.resolve(process.cwd(), 'package-lock.json'))
        .toString()
    );
    if (config.dependencies['@angular-devkit/build-angular']) {
      webpackVersion =
        config.dependencies['@angular-devkit/build-angular'].requires[
          'webpack'
        ];
    }
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
          version: '2.1.1',
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
      if (this.config.webpackPromotion) {
        await addWebpackDependency(tree, context);
      }
      context.addTask(new NodePackageInstallTask());
    };
  }
}
