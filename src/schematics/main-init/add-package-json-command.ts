import { createScanner } from 'jsonc-parser';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematics } from '../../types';

export class AddPackageJsonCommand implements RunSchematics {
  run(): Rule {
    return (tree: Tree, context: SchematicContext) => {
      let fileName = 'package.json';
      let content: any;
      if (tree.exists(fileName)) {
        content = JSON.parse(tree.read(fileName)?.toString()!);
      } else {
        throw `${fileName} not exist!`
      }
      content.scripts = content.scripts || {};
      content.scripts['build:center-main'] =
        'ng build --configuration center-main';
      content.scripts['build:center-dll'] =
        'ng build --configuration center-dll';
      tree.overwrite(fileName, JSON.stringify(content, undefined, 2));
    };
  }
}
