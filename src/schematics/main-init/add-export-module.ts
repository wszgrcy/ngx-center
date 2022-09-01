import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { findNodeAtLocation, parseTree } from 'jsonc-parser';
import { RunSchematics } from '../../types';
import * as path from 'path';
export class AddExportModule implements RunSchematics {
  constructor(private options: MainInitSchematics) {}
  run() {
    return (tree: Tree, context: SchematicContext) => {
      let workspace: WorkspaceSchema = JSON.parse(
        tree.read('angular.json')!.toString()
      );
      let projectName =
        this.options.projectName! ||
        workspace.defaultProject! ||
        Object.keys(workspace.projects).length == 1
          ? Object.keys(workspace.projects)[0]
          : '';
      let tsconfigPath =
        workspace.projects[projectName].architect?.build?.options.tsConfig!;
      let sourceRoot = workspace.projects[projectName].sourceRoot;
      let content = tree.read(tsconfigPath)!.toString();
      let node = parseTree(content)!;
      let filesNode = findNodeAtLocation(node, ['files']);
      let recorder = tree.beginUpdate(tsconfigPath);
      let lastFileNode = filesNode?.children?.pop();
      let tsconfigDir = path.dirname(tsconfigPath);
      let filePath = path.posix.join(
        path.posix.relative(tsconfigDir, sourceRoot),
        'export-module.ts'
      );
      recorder.insertRight(
        lastFileNode?.offset! + lastFileNode?.length!,
        `,"${filePath}"`
      );
      tree.commitUpdate(recorder);
      tree.create(
        path.posix.join(sourceRoot, 'export-module.ts'),
        `/** 添加要被使用的依赖到此 导出的路径可被子项目直接引用,不支持间接导出即export的文件内存在export,然后使用文件内的export路径,不使用导出共享主项目的命名情况下,请移除所有相关 */`
      );
    };
  }
}
