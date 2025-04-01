const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Get certificate paths for Windows
const certsDir = path.join(process.env.USERPROFILE, '.office-addin-dev-certs');
const keyPath = path.join(certsDir, 'localhost.key');
const certPath = path.join(certsDir, 'localhost.crt');

// Verify certificates exist
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('SSL certificates missing. Run: npx office-addin-dev-certs install');
  process.exit(1);
}

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const port = process.env.PORT || 3000;

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: '/'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './src/taskpane/taskpane.html',
        filename: 'taskpane.html',
        chunks: ['main']
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      server: {
        type: 'https',
        options: {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
          passphrase: '' // Remove if you set a passphrase during cert creation
        }
      },
      port,
      hot: true,
      client: {
        overlay: {
          errors: true,
          warnings: false
        }
      },
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  };
};