const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load environment variables from .env
const env = dotenv.config().parsed;

// Get additional allowed hosts from environment
const additionalHosts = env.ALLOWED_HOSTS ? env.ALLOWED_HOSTS.split(',').map(host => host.trim()) : [];

// Default allowed hosts
const defaultHosts = [
  'localhost',
  '.local',
  '.local.net',
  '127.0.0.1',
  '[::1]'
];

// Create a new object with VITE_ prefix removed
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  entry: './src/client/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin(envKeys)
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    proxy: [{
      context: ['/api'],
      target: 'http://localhost:3001',
      changeOrigin: true
    }],
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [...defaultHosts, ...additionalHosts],
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
}; 