import { chain, SchematicContext, Tree } from '@angular-devkit/schematics';
import { useClass } from '../../util/rule';
import { ChangeAngularJson } from './change-angular-json';
import { AddWebpackConfig } from './add-webpack-config';
import { ChangeApplication } from './change-application';
import { RunNgGenerateApplication } from './run-ng-generate-application';
import { AddPackageJsonCommand } from './add-package-json-command';

export default function (options: SubSchematics) {
  return (tree: Tree, context: SchematicContext) => {
    return chain([
      useClass(RunNgGenerateApplication, options),
      useClass(ChangeApplication, options),
      useClass(AddWebpackConfig, options),
      useClass(ChangeAngularJson, options),
      useClass(AddPackageJsonCommand, options),
    ]);
  };
}
