import {
  createTestWorkspaceFactory,
  TestWorkspaceFactory,
} from '../../../test-util';
describe('update-12', () => {
  let factory: TestWorkspaceFactory;
  beforeEach(async () => {
    factory = createTestWorkspaceFactory(
      require.resolve('../../migration-collection.json')
    );
    await factory.create();
    await factory.addNewFile(
      `webpack.config.test.ts`,
      `import * as webpack from "webpack";
    import * as path from "path";
    import { LoadRemoteModulePlugin, NgNamedImportCheckPlugin } from "webpack-ng-dll-plugin";
    import { BootstrapAssetsPlugin } from "webpack-bootstrap-assets-plugin";
    
    export default (config: webpack.Configuration, options) => {
        config.plugins.push(
            new webpack.DllReferencePlugin({
                context: path.resolve(__dirname),
                manifest: require("./dist/main-manifest.json")
            })
        );
        config.plugins.push(new NgNamedImportCheckPlugin([path.resolve(__dirname, "src")]));
        const entry: any = config.entry;
        config.entry = { main: entry.main };
        config.plugins.push(
            new webpack.DllReferencePlugin({
                context: path.resolve(__dirname),
                manifest: require("./dist/manifest.json")
            })
        );
        config.output.jsonpFunction = "toolsJsonp";
        config.output.filename = "tools.[name].js";
        config.plugins.push(new LoadRemoteModulePlugin());
        // 不同环境需要不同的部署地址,或者获取到资源清单后手动加部署地址,使加载生效
        config.plugins.push(
            new BootstrapAssetsPlugin({
                deployUrl: options.deployUrl
            })
        );
        return config;
    };
    `
    );
  });

  it('应该移除jsonpFunction', async () => {
    let tree = await factory.runSchematic('migration-v12');
    let webpackContent = tree.read('webpack.config.test.ts')!.toString();
    expect(webpackContent).not.toContain('config.output.jsonpFunction = "toolsJsonp";');
  });
});
