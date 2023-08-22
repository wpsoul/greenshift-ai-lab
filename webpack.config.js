/**
 * External Dependencies
 */

 /**
  * WordPress Dependencies
  */
 const defaultConfig = require( '@wordpress/scripts/config/webpack.config.js' );
 const webpack = require( 'webpack' );
 
 module.exports = {
     ...defaultConfig,
     ...{
         entry: {
            index: './src/index.js',
            indexgs: './src/indexgs.js',
         },
         resolve: {
            fallback: {
                "http": false,
                "process/browser": require.resolve('process/browser')
            },
         },
         plugins: [
            ...defaultConfig.plugins,
            new webpack.ProvidePlugin({
                   process: 'process/browser',
            }),
        ],
     }
 }