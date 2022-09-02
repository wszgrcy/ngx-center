import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematics } from '../types';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as fs from 'fs';
import * as path from 'path';
import { getConfiguredPackageManager } from '@angular/cli/src/utilities/config';
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
  constructor(
    private config: { webpackMode: string; webpackPromotion: boolean }
  ) {}
  run(): Rule {
    return async (tree: Tree, context: SchematicContext) => {
      [
        {
          type: NodeDependencyType.Dev,
          name: 'webpack-ng-dll-plugin',
          version: '2.3.1',
        },
        {
          type: NodeDependencyType.Dev,
          name: 'webpack-bootstrap-assets-plugin',
          version: '2.0.0',
        },
      ].forEach((dependency) => addPackageJsonDependency(tree, dependency));
      if (this.config.webpackMode === '@angular-builders/custom-webpack') {
        let dependency = getPackageJsonDependency(
          tree,
          '@angular-devkit/build-angular'
        );
        let version = '^11.1.1';
        if (/^(~|\^)?0.10/.test(dependency!.version)) {
          version = '^10.0.1';
        }
        if (/^(~|\^)?12/.test(dependency!.version)) {
          version = '^12.0.0';
        }
        if (/^(~|\^)?14/.test(dependency!.version)) {
          version = '^14.0.0';
        }
        addPackageJsonDependency(tree, {
          type: NodeDependencyType.Dev,
          name: '@angular-builders/custom-webpack',
          version: version,
        });
      }
      if (this.config.webpackPromotion) {
        await addWebpackDependency(tree, context);
      }
      context.addTask(new NodePackageInstallTask());
    };
  }
}
