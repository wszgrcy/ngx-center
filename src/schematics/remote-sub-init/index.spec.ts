import {
  createTestWorkspaceFactory,
  TestWorkspaceFactory,
} from '../../test-util';
import { strings } from '@angular-devkit/core';
import { createCssSelectorForHtml } from 'cyia-code-util';
describe('remote-sub-init', () => {
  let factory: TestWorkspaceFactory;
  beforeEach(async () => {
    factory = createTestWorkspaceFactory();
    await factory.create();
    await factory.addApplication({ name: 'remoteSubInitProject' });
  });

  it('应该修改package.json依赖', async () => {
    let tree = await factory.runSchematic('remote-sub-init');
    let config = tree.read('package.json')!.toString();
    expect(config).toContain('webpack-ng-dll-plugin');
    expect(config).toContain('webpack-bootstrap-assets-plugin');
  });
  it(`应该在package.json中不存在'@angular-builders/custom-webpack',当'webpackMode'为空时`, async () => {
    let tree = await factory.runSchematic('remote-sub-init', {
      webpackMode: '',
    });
    let config = tree.read('package.json')!.toString();
    expect(config).not.toContain('@angular-builders/custom-webpack');
  });
});
