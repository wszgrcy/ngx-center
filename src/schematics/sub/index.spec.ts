import {
  createTestWorkspaceFactory,
  TestWorkspaceFactory,
} from '../../test-util';
import { strings } from '@angular-devkit/core';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';

describe('sub', () => {
  let factory: TestWorkspaceFactory;

  beforeEach(async () => {
    factory = createTestWorkspaceFactory();
    await factory.create();
  });
  it('应该修改应用', async () => {
    let subName = 'sub1';
    let tree = await factory.runSchematic('sub', { name: subName });
    expect(tree.exists(`projects/${subName}/src/favicon.ico`)).toBeFalsy();
    expect(tree.read(`projects/${subName}/src/main.ts`)?.toString()).toContain(
      'as module'
    );
    expect(
      tree.read(`projects/${subName}/src/app/app.module.ts`)?.toString()
    ).toContain('RouterModule.forChild');
  });
  it('应该添加webpack配置', async () => {
    let subName = 'sub1';
    let tree = await factory.runSchematic('sub', { name: subName });
    expect(tree.exists(`webpack.config.${subName}.ts`)).toBeTruthy();
    let webpackConfig = tree.read(`webpack.config.${subName}.ts`)?.toString()!;
    expect(webpackConfig).toContain(strings.dasherize(subName));
    expect(webpackConfig).toContain(`projects/${subName}/src`);
  });
  it('应该修改angularJson', async () => {
    let subName = 'sub1';
    let tree = await factory.runSchematic('sub', { name: subName });
    let workspace: WorkspaceSchema = JSON.parse(
      tree.read('angular.json')!.toString()
    );
    expect(
      (workspace.projects[subName].architect?.build?.options as any).vendorChunk
    ).toBe(false);
    expect(workspace.projects[subName].architect?.build?.builder).toBe(
      '@angular-builders/custom-webpack:browser'
    );
    expect(
      (workspace.projects[subName].architect?.build?.options as any)
        .customWebpackConfig
    ).toBeTruthy();
  });
  it('应该存在package.json子项目命令', async () => {
    let subName = 'sub1';

    let tree = await factory.runSchematic('sub', { name: subName });
    let content = tree.read('package.json')?.toString();
    expect(content).toContain(`build:${subName}`);
    expect(content).toContain(`ng build ${subName}`);
  });
});
