import {
  apply,
  mergeWith,
  SchematicContext,
  Tree,
  url,
  template,
  renameTemplateFiles,
  move,
} from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { RunSchematics } from '../../types';

export class ChangeApplication implements RunSchematics {
  constructor(private options: SubSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let workspace: any = JSON.parse(tree.read('angular.json')!.toString());

      tree.delete(
        `${workspace.newProjectRoot}/${this.options.name}/src/main.ts`
      );
      tree.delete(
        `${workspace.newProjectRoot}/${this.options.name}/src/app/app.module.ts`
      );

      tree.delete(
        `${workspace.newProjectRoot}/${this.options.name}/src/favicon.ico`
      );
      tree.delete(
        `${workspace.newProjectRoot}/${this.options.name}/src/index.html`
      );

      return mergeWith(
        apply(url('./template'), [
          template({}),
          renameTemplateFiles(),
          move(
            './app.module.ts',
            `${workspace.newProjectRoot}/${this.options.name}/src/app/app.module.ts`
          ),
          move(
            './main.ts',
            `${workspace.newProjectRoot}/${this.options.name}/src/main.ts`
          ),
        ])
      );
    };
  }
}
