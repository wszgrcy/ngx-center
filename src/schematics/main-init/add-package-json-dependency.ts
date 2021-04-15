import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematics } from '../../types';
import {
  addPackageJsonDependency,
  NodeDependencyType,
  removePackageJsonDependency,
} from '@schematics/angular/utility/dependencies';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export class AddPackageJsonDependency implements RunSchematics {
  constructor(private config: MainInitSchematics) {}
  run(): Rule {
    return (tree: Tree, context: SchematicContext) => {
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
      context.addTask(new NodePackageInstallTask());
    };
  }
}
