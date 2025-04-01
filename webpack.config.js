const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      polyfill: '@babel/polyfill',
      app: './src/index.tsx',
      commands: './src/commands/index.ts'
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@helpers': path.resolve(__dirname, 'src/helpers'),
        '@commands': path.resolve(__dirname, 'src/commands'),
        '@styles': path.resolve(__dirname, 'src/styles')
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: 'tsconfig.json'
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.(woff|woff2|eot|ttf)$/,
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './src/taskpane/taskpane.html',
        filename: 'taskpane.html',
        chunks: ['polyfill', 'app']
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'assets/**/*',
            to: 'assets/[name][ext]'
          },
          {
            from: 'manifest*.xml',
            to: '[name][ext]',
            transform(content) {
              if (isProduction) {
                return content.toString()
                  .replace(/localhost:3000/g, 'your-production-url.com');
              }
              return content;
            }
          }
        ]
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      server: {
        type: 'https',
        options: {
          key: './certs/localhost.key',
          cert: './certs/localhost.crt'
        }
      },
      port: 3000,
      hot: true
    },
    devtool: isProduction ? false : 'inline-source-map',
    stats: {
      warningsFilter: [
        'FilterWarningsPlugin', 
        /Critical dependency/
      ]
    }
  };
};