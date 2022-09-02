import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { RunSchematics } from '../../types';
import { getMainProject } from '../../util/rule';

export class AddTypings implements RunSchematics {
  readonly declaration = `
 declare interface AttrGroup {
    nomodule?: string;
    integrity?: string;
    crossOrigin?: string;
    defer?: string;
    type?: string;
    src?: string;
    href?: string;
    name: string;
    fileName: string;
  }
  /** 仅仅为加载js文件*/
declare function loadRemoteModule(
  url: string,
  moduleName?: string
): Promise<any>; 
/**加载资源清单*/
declare function loadRemoteModuleManifest(config: {
  scripts: AttrGroup[];
  stylesheets: AttrGroup[];
}): Promise<any>
`;
  constructor(private options: MainInitSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let workspace: WorkspaceSchema = JSON.parse(
        tree.read('angular.json')!.toString()
      );
      let projectName = getMainProject(tree, this.options.projectName!);

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
