import {
  createTestWorkspaceFactory,
  TestWorkspaceFactory,
} from '../../test-util';
import { strings } from '@angular-devkit/core';
import { createCssSelectorForHtml } from 'cyia-code-util';
describe('main-init', () => {
  let factory: TestWorkspaceFactory;
  beforeEach(async () => {
    factory = createTestWorkspaceFactory();
    await factory.create();
    await factory.addApplication({ name: 'mainProject' });
  });

  it('应该修改package.json命令', async () => {
    let tree = await factory.runSchematic('main-init');
    let config = tree.read('package.json')!.toString();
    expect(config).toContain('build:center-main');
    expect(config).toContain('start:center-main');
    expect(config).toContain('ng serve --configuration center-main');
  });
  it('应该修改package.json依赖', async () => {
    let tree = await factory.runSchematic('main-init');
    let config = tree.read('package.json')!.toString();
    expect(config).toContain('webpack-ng-dll-plugin');
  });
  it(`应该在package.json中不存在'@angular-builders/custom-webpack',当'webpackMode'为空时`, async () => {
    let tree = await factory.runSchematic('main-init', { webpackMode: '' });
    let config = tree.read('package.json')!.toString();
    expect(config).not.toContain('@angular-builders/custom-webpack');
  });
  it('应该存在webpack配置文件', async () => {
    let tree = await factory.runSchematic('main-init');
    let dll = tree.exists('webpack.config.center-dll.ts');
    let main = tree.exists('webpack.config.center-main.ts');
    let dllContent = tree.read('webpack.config.center-dll.ts')?.toString();
    expect(dllContent).toContain('dll.js');
    expect(dllContent).toContain('Dll');
    expect(dll).toBeTruthy();
    expect(main).toBeTruthy();
  });
  it('应该修改angularJson', async () => {
    let tree = await factory.runSchematic('main-init');
    let config = tree.read('angular.json')!.toString();
    expect(config).toContain('center-dll');
    expect(config).toContain('@angular-builders/custom-webpack:browser');
    expect(config).toContain('@angular-builders/custom-webpack:dev-server');
  });
  it(`应该在angular.json不存在'@angular-builders/custom-webpack:browser',当'webpackMode'为空`, async () => {
    let tree = await factory.runSchematic('main-init', { webpackMode: '' });
    let config = tree.read('angular.json')!.toString();
    expect(config).toContain('center-dll');
    expect(config).not.toContain('@angular-builders/custom-webpack:browser');
  });
  it(`应该在package.json不存在时报异常`, async () => {
    await factory.removeFile('package.json');
    let toThrow = false;
    try {
      await factory.runSchematic('main-init', { webpackMode: '' });
    } catch (error) {
      if (error === 'package.json not exist!') {
        toThrow = true;
      }
    }
    expect(toThrow).toBeTruthy();
  });
  it('应该添加类型定义', async () => {
    let tree = await factory.runSchematic('main-init');
    expect(tree.exists('projects/main-project/src/typings.d.ts')).toBe(true);
    expect(
      tree.read('projects/main-project/src/typings.d.ts')?.toString()
    ).toContain('loadRemoteModule');
  });
  it('应该添加主项目重映射', async () => {
    let tree = await factory.runSchematic('main-init');
    let content = tree.read('tsconfig.json')?.toString();
    expect(content).toContain('@center-main/*');
    expect(content).toContain('projects/main-project/src/*');
  });
  it('应该添加主项目重映射,如果存在paths配置', async () => {
    factory
      .getTree()
      .overwrite('tsconfig.json', `{"compilerOptions":{"paths":{"a":[""]}}}`);
    let tree = await factory.runSchematic('main-init');
    let content = tree.read('tsconfig.json')?.toString();
    expect(content).toContain('@center-main/*');
    expect(content).toContain('projects/main-project/src/*');
  });
  it('应该添加index.center-dll.html', async () => {
    let dllName = 'mainTest';
    let tree = await factory.runSchematic('main-init', { dllName });
    let angularJsonContent = tree.read('angular.json')?.toString();
    expect(angularJsonContent).toContain(`${strings.dasherize(dllName)}.js`);
    let htmlContent = tree
      .read('projects/main-project/src/index.center-dll.html')
      ?.toString()!;
    expect(htmlContent).toContain(`./${strings.dasherize(dllName)}.js`);
    let selector = createCssSelectorForHtml(htmlContent);
    expect(selector.queryOne('head')).toBeTruthy();
    expect(selector.queryOne('script')).toBeTruthy();
  });
  it('应该支持export-module', async () => {
    let dllName = 'mainTest';
    let tree = await factory.runSchematic('main-init', { dllName });
    let content = tree
      .read('/projects/main-project/tsconfig.app.json')
      ?.toString();
    expect(content).toContain('src/export-module.ts');
    expect(tree.exists('/projects/main-project/src/export-module.ts')).toBe(
      true
    );
  });
  it('应该生成tsconfig.dll.json', async () => {
    let dllName = 'mainTest';
    let tree = await factory.runSchematic('main-init', { dllName });
    let content = tree
      .read('/projects/main-project/tsconfig.dll.json')
      ?.toString();
    expect(content).not.toContain('polyfills');
    expect(content).not.toContain('export-module');
  });
});
