const path = require('path');

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
            transpileOnly: true,
          },
        },
      },
    ],
  },

  target: 'node',
  mode: 'production',
};
