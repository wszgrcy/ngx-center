import { Tree } from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';

export function getMainProject(
  tree: Tree,
  optionProjectName?: string | undefined
) {
  if (optionProjectName) {
    return optionProjectName;
  }
  if (tree.exists('angular.json')) {
    let workspace: WorkspaceSchema = JSON.parse(
      tree.read('angular.json')!.toString()
    );
    return workspace.defaultProject ||
      Object.keys(workspace.projects).length == 1
      ? Object.keys(workspace.projects)[0]
      : '';
  }
  throw new Error('no angular.json or no projectName');
}
