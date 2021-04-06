import {
  createTestWorkspaceFactory,
  TestWorkspaceFactory,
} from '../../test-util';

describe('sub', () => {
  let factory: TestWorkspaceFactory;

  beforeEach(async () => {
    factory = createTestWorkspaceFactory();
    factory.create();
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
});
