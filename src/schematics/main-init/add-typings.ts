import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { RunSchematics } from '../../types';

export class AddTypings implements RunSchematics {
  readonly declaration = `
declare function loadRemoteModule(
  url: string,
  moduleName?: string
): Promise<any>; 
    `;
  constructor(private options: MainInitSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let workspace: WorkspaceSchema = JSON.parse(
        tree.read('angular.json')!.toString()
      );
      let projectName = this.options.projectName || workspace.defaultProject!;
      
      let sourceRoot: string;
      if (workspace.projects[projectName].sourceRoot) {
        sourceRoot = workspace.projects[projectName].sourceRoot;
      } else {
        throw `${projectName} no exist sourceRoot`;
      }
      let typingsPath = `${sourceRoot}/typings.d.ts`;
      if (tree.exists(typingsPath)) {
        let config = tree.read(typingsPath)?.toString();
        if (config?.includes('loadRemoteModule')) {
          return;
        } else {
          let recorder = tree.beginUpdate(typingsPath);
          recorder.insertRight(config!.length, this.declaration);
          tree.commitUpdate(recorder);
        }
      } else {
        tree.create(typingsPath, this.declaration);
      }
    };
  }
}
