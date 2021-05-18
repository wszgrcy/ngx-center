import {
  createTestWorkspaceFactory,
  TestWorkspaceFactory,
} from '../../test-util';
import { strings } from '@angular-devkit/core';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';

describe('sub', () => {
  let factory: TestWorkspaceFactory;
  let port = 4201;
  beforeEach(async () => {
    factory = createTestWorkspaceFactory();
    await factory.create();
  });
  it('应该修改应用', async () => {
    let subName = 'sub1';
    let tree = await factory.runSchematic('sub', { name: subName, port });
    expect(tree.exists(`projects/${subName}/src/favicon.ico`)).toBeFalsy();
    expect(tree.read(`projects/${subName}/src/main.ts`)?.toString()).toContain(
      'as module'
    );
    expect(
      tree.read(`projects/${subName}/src/app/app.module.ts`)?.toString()
    ).toContain('RouterModule.forChild');
    expect(
      tree.read(`projects/${subName}/tsconfig.app.json`)?.toString()!
    ).not.toContain('polyfills');
  });
  it('应该添加webpack配置', async () => {
    let subName = 'sub1';
    let tree = await factory.runSchematic('sub', { name: subName, port });
    expect(tree.exists(`webpack.config.${subName}.ts`)).toBeTruthy();
    let webpackConfig = tree.read(`webpack.config.${subName}.ts`)?.toString()!;
    expect(webpackConfig).toContain(strings.dasherize(subName));
    expect(webpackConfig).toContain(`projects/${subName}/src`);
  });
  it('应该修改angularJson', async () => {
    let subName = 'sub1';
    let tree = await factory.runSchematic('sub', { name: subName, port });
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

    let tree = await factory.runSchematic('sub', { name: subName, port });
    let content = tree.read('package.json')?.toString();
    expect(content).toContain(`build:${subName}`);
    expect(content).toContain(`ng build ${subName}`);
    expect(content).toContain(`start:${subName}`);
    expect(content).toContain(`ng serve ${subName}`);
  });
  it('应该设置port', async () => {
    let subName = 'sub1';
    let tree = await factory.runSchematic('sub', { name: subName, port });
    let content = tree.read('angular.json')?.toString()!;
    let config: WorkspaceSchema = JSON.parse(content);
    expect(
      (config.projects[subName].architect?.serve?.options as any).publicHost
    ).toEqual(`0.0.0.0:${port}`);
    expect(
      (config.projects[subName].architect?.serve?.options as any).port
    ).toEqual(port);
    expect(config.projects[subName].architect?.serve?.builder).toEqual(
      `@angular-builders/custom-webpack:dev-server`
    );
  });
  it('应该在angular.json中置空index', async () => {
    let subName = 'sub1';
    let tree = await factory.runSchematic('sub', { name: subName, port });
    let content = tree.read('angular.json')?.toString()!;
    let config: WorkspaceSchema = JSON.parse(content);
    expect(
      (config.projects[subName].architect?.build?.options as any).index
    ).toEqual('');
  });
});
