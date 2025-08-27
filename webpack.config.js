import { dirname, resolve } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export default {
  context: resolve(currentDirectory, 'src/ui'),
  entry: './main.jsx',
  output: {
    filename: 'bundle.js',
    path: resolve(currentDirectory, 'src/ui/dist'),
    publicPath: '/',
    clean: true
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(currentDirectory, 'src/ui/index.html'),
      scriptLoading: 'blocking'
    })
  ]
};

