import * as webpack from 'webpack';
import * as path from 'path';
export default (config: webpack.Configuration) => {
  config.plugins.push(
    new webpack.DllReferencePlugin({
      context: path.resolve(__dirname),
      manifest: require('./dist/manifest.json'),
    })
  );
  return config;
};
