import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { useClass } from '../../util/rule';
import { AddPackageJsonCommand } from './add-package-json-command';
import { AddPackageJsonDependency } from './add-package-json-dependency';
import { AddTypings } from './add-typings';
import { AddWebpackConfig } from './add-webpack-config';
import { ChangeAngularJson } from './change-angular-json';

export default function (options: MainInitSchematics): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return chain([
      useClass(AddPackageJsonCommand, options),
      useClass(AddPackageJsonDependency, options),
      useClass(ChangeAngularJson, options),
      useClass(AddWebpackConfig, options),
      useClass(AddTypings, options),
    ]);
  };
}
