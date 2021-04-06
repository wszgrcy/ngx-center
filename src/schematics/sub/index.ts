import { chain, SchematicContext, Tree } from '@angular-devkit/schematics';
import { useClass } from '../../util/rule';
import { ChangeApplication } from './change-application';
import { RunNgGenerateApplication } from './run-ng-generate-application';

export default function (options: SubSchematics) {
  return (tree: Tree, context: SchematicContext) => {
    return chain([
      useClass(RunNgGenerateApplication, options),
      useClass(ChangeApplication, options),
    ]);
  };
}
