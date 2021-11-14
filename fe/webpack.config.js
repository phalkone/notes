const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const Dotenv = require('dotenv-webpack')

const config = {
  entry: './src/index.tsx',
  context: path.resolve(__dirname),
  resolve: {
    extensions: [
      '.jsx',
      '.js',
      '.ts',
      '.tsx',
      '.json',
      '.less'
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Notes'
    }),
    new ForkTsCheckerWebpackPlugin(),
    new MiniCssExtractPlugin({ ignoreOrder: true }),
    new Dotenv({ systemvars: true, silent: true })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.less$/i,
        use: [{
          loader: MiniCssExtractPlugin.loader
        }, {
          loader: 'css-loader'
        }, {
          loader: 'less-loader',
          options: {
            lessOptions: {
              javascriptEnabled: true
            }
          }
        }
        ]
      }
    ]
  }
}

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map'
    config.output = {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '',
      filename: '[name].bundle.js'
    }
    config.devServer = {
      port: 5050,
      hot: true
    }
    config.optimization = {
      runtimeChunk: 'single'
    }
  }

  if (argv.mode === 'production') {
    config.output = {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '',
      filename: '[name].bundle.js',
      clean: true
    }
    config.performance = {
      maxEntrypointSize: 400000,
      maxAssetSize: 400000
    }
    config.optimization = {
      minimize: true,
      minimizer: [
        // eslint-disable-next-line quotes
        `...`,
        new CssMinimizerPlugin()
      ],
      splitChunks: {
        chunks: 'all'
      }
    }
  }

  return config
}
