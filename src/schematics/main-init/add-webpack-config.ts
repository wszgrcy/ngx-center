import {
  apply,
  chain,
  mergeWith,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { RunSchematics } from '../../types';
import { strings } from "@angular-devkit/core";
export class AddWebpackConfig implements RunSchematics {
  constructor(private options: MainInitSchematics) {}
  run(): Rule {
    return (tree: Tree, context: SchematicContext) => {
      return mergeWith(
        apply(url('./template/webpack-config'), [
          template({
            dllName: this.options.dllName,
            ...strings
          }),
          renameTemplateFiles(),
        ])
      );
    };
  }
}
