import { createScanner } from 'jsonc-parser';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematics } from '../../types';

export class AddPackageJsonCommand implements RunSchematics {
  constructor(private options: SubSchematics) {}
  run(): Rule {
    return (tree: Tree, context: SchematicContext) => {
      let fileName = 'package.json';
      let content: any;
      if (tree.exists(fileName)) {
        content = JSON.parse(tree.read(fileName)?.toString()!);
      } else {
        throw `${fileName} not exist!`;
      }
      content.scripts = content.scripts || {};
      content.scripts[
        `build:${this.options.name}`
      ] = `ng build ${this.options.name}`;
      content.scripts[
        `build:${this.options.name}:prod`
      ] = `ng build ${this.options.name} --prod`;
      content.scripts[
        `start:${this.options.name}`
      ]=`ng serve ${this.options.name}`
      tree.overwrite(fileName, JSON.stringify(content, undefined, 2));
    };
  }
}
