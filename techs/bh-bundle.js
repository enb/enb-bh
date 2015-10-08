var vow = require('vow'),
    enb = require('enb'),
    vfs = enb.asyncFS || require('enb/lib/fs/async-fs'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow'),
    compile = require('../lib/compiler').compile;

/**
 * @class BHBundleTech
 * @augments {BaseTech}
 * @classdesc
 *
 * Build file with CommonJS requires for core and each BH template (`bh.js` files).<br/><br/>
 *
 * Use in browsers and on server side (Node.js).<br/><br/>
 *
 * The compiled BH module supports CommonJS and YModules. If there is no any modular system in the runtime,
 * the module will be provided as global variable `BH`.<br/><br/>
 *
 * Important: do not use `require` in templates.
 *
 * @param {Object}      [options]                           Options
 * @param {String}      [options.target='?.bh.js']          Path to a target with compiled file.
 * @param {String}      [options.filesTarget='?.files']     Path to a target with FileList.
 * @param {String[]}    [options.sourceSuffixes='bh.js']    Files with specified suffixes involved in the assembly.
 * @param {String}      [options.bhFilename]                Path to file with BH core.
 * @param {Object}      [options.requires]                  Names for dependencies to `BH.lib.name`.
 * @param {String[]}    [options.mimic]                     Names for export.
 * @param {String}      [options.scope='template']          Scope of template execution.
 * @param {Boolean}     [options.sourcemap=false]           Includes inline source maps.
 * @param {Object}      [options.bhOptions={}]              Sets option for BH core.
 *
 * @example
 * var BHBundleTech = require('enb-bh/techs/bh-bundle'),
 *     FileProvideTech = require('enb/techs/file-provider'),
 *     bemTechs = require('enb-bem-techs');
 *
 * module.exports = function(config) {
 *     config.node('bundle', function(node) {
 *         // get FileList
 *         node.addTechs([
 *             [FileProvideTech, { target: '?.bemdecl.js' }],
 *             [bemTechs.levels, { levels: ['blocks'] }],
 *             [bemTechs.deps],
 *             [bemTechs.files]
 *         ]);
 *
 *         // build BH file
 *         node.addTech(BHBundleTech);
 *         node.addTarget('?.bh.js');
 *     });
 * };
 */
module.exports = buildFlow.create()
    .name('bh-bundle')
    .target('target', '?.bh.js')
    .defineOption('bhFilename', require.resolve('bh/lib/bh.js'))
    .defineOption('requires', {})
    .defineOption('mimic', ['bh'])
    .defineOption('bhOptions', {})
    .defineOption('sourcemap', false)
    .defineOption('scope', 'template')
    .useFileList(['bh.js'])
    .needRebuild(function (cache) {
        return cache.needRebuildFile('bh-file', this._bhFilename);
    })
    .saveCache(function (cache) {
        cache.cacheFileInfo('bh-file', this._bhFilename);
    })
    .builder(function (files) {
        return this._readTemplates(files)
            .then(function (sources) {
                return this._compile(sources);
            }, this);
    })
    .methods(/** @lends BHBundleTech.prototype */{
        /**
         * Compiles code of BH module with core and source templates.
         *
         * @see BHCompiler.compile
         * @protected
         * @param {Array.<{path: String, contents: String}>} sources — Files with source templates.
         * @returns {String} compiled code of bh module
         */
        _compile: function (sources) {
            var opts = {
                filename: this.node.resolvePath(this._target),
                dirname: this.node.getDir(),
                bhFilename: this._bhFilename,
                sourcemap: this._sourcemap,
                scope: this._scope,
                mimic: [].concat(this._mimic),
                requires: this._requires,
                bhOptions: this._bhOptions
            };

            return compile(sources, opts);
        },
        /**
         * Reads files with source templates.
         *
         * @protected
         * @param {FileList} files
         * @returns {Array.<{path: String, relPath: String, contents: String}>}
         */
        _readTemplates: function (files) {
            var node = this.node,
                process = this._processTemplate;

            return vow.all(files.map(function (file) {
                return vfs.read(file.fullname, 'utf8')
                    .then(function (contents) {
                        return {
                            path: file.fullname,
                            relPath: node.relativePath(file.fullname),
                            contents: process(contents)
                        };
                    });
            }));
        },
        /**
         * Adapts single BH file content to client side.
         *
         * @protected
         * @param {String} contents — Contents of a source file.
         * @returns {String}
         */
        _processTemplate: function (contents) {
            return contents
                .replace(/module\.exports\s*=\s*function\s*\([^\)]*\)\s*\{/, '')
                .replace(/}\s*(?:;)?\s*$/, '');
        }
    })
    .createTech();
