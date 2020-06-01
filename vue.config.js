const path = require('path');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const PrerenderSPAPlugin = require('prerender-spa-plugin');

module.exports = {
  lintOnSave: false,
  css: {
    loaderOptions: {
      sass: {
        // Global includes - will be prepended in every scss file (including components)
        prependData: `
          @import "@/styles/_variables";
          @import "@/styles/_mixins";
        `,
      },
    },
  },
  chainWebpack: (config) => config
    .plugin('favicons')
    .use(FaviconsWebpackPlugin, [{
      logo: path.resolve(__dirname, 'src/assets/favicon.svg'),
      mode: 'webapp', // optional can be 'webapp' or 'light' - 'webapp' by default
      devMode: 'webapp', // optional can be 'webapp' or 'light' - 'light' by default
      publicPath: '/',
      favicons: {
        start_url: '/',
        appName: 'You Do Not Need A Cape To Be A Hero',
        appDescription: 'You Do Not Need A Cape To Be A Hero',
        developerName: 'Aeternity Developers',
        developerURL: 'https://github.com/kenodressel/aepp-boilerplate',
        background: '#ff0d6a',
        theme_color: '#ff0d6a',
        icons: {
          coast: false,
          yandex: false,
          windows: false,
        },
      },
    }],
    PrerenderSPAPlugin[{
      staticDir: path.join(__dirname, 'dist'),
      routes: [
        '/',
        '/tip/:id',
      ],
    }])
    .end()
    .plugin('copy')
    .tap((args) => {
      args[0].push({
        from: './node_modules/@aeternity/superhero-button/dist',
        to: './buttons',
        toType: 'dir',
      });
      return args;
    })
    .end()
    .module
    .rule('aes')
    .test(/\.aes$/)
    .use('raw-loader')
    .loader('raw-loader')
    .end(),
};
