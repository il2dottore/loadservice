const path = require('path');

// Must be executed with `scripts/build.js`
const appName = process.env.APP_NAME || 'common';

const root = (...parts) => path.resolve(__dirname, ...parts);

module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@app/auth': root('libs/auth/src'),
      '@app/common': root('libs/common/src'),
      '@app/config': root('libs/config/src'),
      '@app/database': root('libs/database/src'),
      '@app/rabbitmq': root('libs/rabbitmq/src'),
      '@app/redis': root('libs/redis/src'),
    },
  },

  // Avoid breaking Swagger
  optimization: {
    minimize: false,
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(
              __dirname,
              `apps/${appName}/tsconfig.app.json`,
            ),
            transpileOnly: true,
          },
        },
      },
    ],
  },

  target: 'node',
  mode: 'production',
};
