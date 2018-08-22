const ManifestPlugin = require('webpack-manifest-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const Generator = function (configDirname, filename, isProduction) {
    this.configDirname = configDirname;
    this.filename = filename;
    this.isProduction = isProduction;
    this.imageGenerator = require('gostatic-webpack-images')(configDirname, filename, isProduction);
    this.cssGenerator = require('gostatic-webpack-css')(configDirname, filename, isProduction);
};

Object.assign(Generator.prototype, {
    relativePath(p) { return require('path').resolve(this.configDirname, p); },

    entry() {
        return {
            main: this.relativePath('assets/js-extract/main.js'),
            vendor: this.relativePath('assets/js-extract/vendor.js'),
            browser: this.relativePath('assets/js/browser.js'),
        };
    },

    output() {
        return {
            path: this.relativePath('generated/assets'),
            filename: this.filename + '.js',
        };
    },

    allRules() {
        return this.cssGenerator.sassRules()
            .concat(this.imageGenerator.faviconRules('assets/favicon'))
            .concat(this.imageGenerator.responsiveRules(this.relativePath('assets/images'), 'images/'))
    },

    allPlugins() {
        return this.cssGenerator.extractPlugins()
            .concat(this.imageGenerator.optimizationPlugins())
            .concat([
                new ManifestPlugin(),
                new HardSourceWebpackPlugin(),
                new HardSourceWebpackPlugin.ExcludeModulePlugin([
                    // does not emit for repeated builds
                    { test: /mini-css-extract-plugin[\\/]dist[\\/]loader/ }
                ])
            ])
    }
});

module.exports = function (configDirname, filename, isProduction) {
    return new Generator(configDirname, filename, isProduction);
};