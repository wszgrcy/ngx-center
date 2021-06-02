import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { useClass } from '../../util/rule';
import { AddPackageJsonDependency } from '../../rule/add-package-json-dependency';

export default function (options: MainInitSchematics): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return chain([useClass(AddPackageJsonDependency, options)]);
  };
}
