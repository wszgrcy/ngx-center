import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematics } from '../../types';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
export class ChangeAngularJson implements RunSchematics {
  constructor(private options: MainInitSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let workspace!: WorkspaceSchema;
      if (tree.exists('angular.json')) {
        workspace = JSON.parse(tree.read('angular.json')!.toString());
      }
      let projectName: string =
        this.options.projectName || workspace.defaultProject!;
      if (this.options.webpackMode === '@angular-builders/custom-webpack') {
        this['@angular-builders/custom-webpack'](workspace);
      }

      if (workspace?.projects[projectName]?.architect?.build?.configurations) {
        workspace!.projects![projectName]!.architect!.build!.configurations![
          'center-dll'
        ] = {
          outputPath: 'dist/center-dll',
          vendorChunk: false,
          ...workspace!.projects![projectName]!.architect!.build!
            .configurations!['center-dll'],
        } as any;
        workspace!.projects![projectName]!.architect!.build!.configurations![
          'center-main'
        ] = {
          vendorChunk: false,
          ...workspace!.projects![projectName]!.architect!.build!
            .configurations!['center-main'],
        } as any;
      }
      tree.overwrite('angular.json', JSON.stringify(workspace,undefined,2));
    };
  }
  '@angular-builders/custom-webpack'(workspace: WorkspaceSchema) {
    let projectName: string =
      this.options.projectName || workspace.defaultProject!;
    if (workspace?.projects[projectName]?.architect?.build) {
      workspace!.projects![
        projectName
      ]!.architect!.build!.builder = '@angular-builders/custom-webpack:browser' as any;
    }
    if (workspace?.projects[projectName]?.architect?.build?.configurations) {
      workspace!.projects![projectName]!.architect!.build!.configurations![
        'center-dll'
      ] = {
        customWebpackConfig: { path: './webpack.config.center-dll.ts' },
      } as any;
      workspace!.projects![projectName]!.architect!.build!.configurations![
        'center-main'
      ] = {
        customWebpackConfig: { path: './webpack.config.center-main.ts' },
      } as any;
    }
  }
}
