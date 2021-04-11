import { SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  ProjectType,
  WorkspaceProject,
  WorkspaceSchema,
  WorkspaceTargets,
} from '@schematics/angular/utility/workspace-models';
import { RunSchematics } from '../../types';
import { createCssSelectorForHtml } from 'cyia-code-util';
import * as path from 'path';
import { strings } from '@angular-devkit/core';

export class AddIndexCenterDllHtml implements RunSchematics {
  constructor(private options: MainInitSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let workspace: WorkspaceSchema = JSON.parse(
        tree.read('angular.json')!.toString()
      );
      let architect: WorkspaceTargets<ProjectType.Application> = workspace
        .projects[this.options.projectName || workspace.defaultProject!]
        .architect!;
      let indexPath = architect.build?.options.index!;
      let html = tree.read(indexPath)?.toString()!;
      let selector = createCssSelectorForHtml(html);
      let headNode = selector.queryOne('html head');
      headNode.endSourceSpan?.start.offset;
      tree.create(
        path.posix.join(path.dirname(indexPath), 'index.center-dll.html'),
        `${html.substr(0, headNode.endSourceSpan?.start.offset! - 1)}
  <script src="./${strings.dasherize(this.options.dllName!)}.js"></script>
${html.substr( headNode.endSourceSpan?.start.offset!)}`
      );
    };
  }
}
