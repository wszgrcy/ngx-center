import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematics } from '../../types';
import { getMainProject } from '../../util/rule';

export class AddPackageJsonCommand implements RunSchematics {
  constructor(private options: MainInitSchematics) {}

  run(): Rule {
    return (tree: Tree, context: SchematicContext) => {
      let fileName = 'package.json';
      let content: any;
      if (tree.exists(fileName)) {
        content = JSON.parse(tree.read(fileName)?.toString()!);
      } else {
        throw `${fileName} not exist!`;
      }
      let projectName = getMainProject(tree, this.options.projectName!);
      content.scripts = content.scripts || {};
      content.scripts[
        'start:center-main'
      ] = `ng serve ${projectName} --configuration center-main`;
      content.scripts[
        'build:center-main'
      ] = `ng build ${projectName} --configuration center-main`;
      content.scripts[
        'build:center-main:prod'
      ] = `ng build ${projectName} --configuration center-main-prod`;
      content.scripts['build:center-dll'] =
        'ng build --configuration center-dll';
      content.scripts['build:center-dll:prod'] =
        'ng build --configuration center-dll-prod';
      tree.overwrite(fileName, JSON.stringify(content, undefined, 2));
    };
  }
}
