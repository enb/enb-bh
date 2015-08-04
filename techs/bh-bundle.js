var vow = require('vow'),
    vfs = require('enb/lib/fs/async-fs'),
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
 * @param {Object}      [options.requires]                  Names for dependencies to `BH.lib.name`.
 * @param {String[]}    [options.mimic]                     Names for export.
 * @param {String}      [options.scope='template']          Scope of template execution.
 * @param {Boolean}     [options.sourcemap=false]           Includes inline source maps.
 * @param {String}      [options.jsAttrName='data-bem']     Sets `jsAttrName` option for BH core.
 * @param {String}      [options.jsAttrScheme='json']       Sets `jsAttrScheme` option for BH core.
 * @param {String}      [options.jsCls='i-bem']             Sets `jsCls` option for BH core.
 * @param {Boolean}     [options.jsElem=true]               Sets `jsElem` option for BH core.
 * @param {Boolean}     [options.escapeContent=false]       Sets `escapeContent` option for BH core.
 * @param {Boolean}     [options.clsNobaseMods=false]       Sets `clsNobaseMods` option for BH core.
 *
 * @example
 * var BHBundleTech = require('enb-bh/techs/bh-bundle'),
 *     FileProvideTech = require('enb/techs/file-provider'),
 *     bem = require('enb-bem-techs');
 *
 * module.exports = function(config) {
 *     config.node('bundle', function(node) {
 *         // get FileList
 *         node.addTechs([
 *             [FileProvideTech, { target: '?.bemdecl.js' }],
 *             [bem.levels, levels: ['blocks']],
 *             bem.deps,
 *             bem.files
 *         ]);
 *
 *         // build BH file
 *         node.addTech(BHBundleTech);
 *         node.addTarget('?.bh.js');
 *     });
 * };
 */
module.exports = require('enb/lib/build-flow').create()
    .name('bh-bundle')
    .target('target', '?.bh.js')
    .defineOption('requires', {})
    .defineOption('mimic', ['bh'])
    .defineOption('jsAttrName', 'data-bem')
    .defineOption('jsAttrScheme', 'json')
    .defineOption('jsCls', 'i-bem')
    .defineOption('jsElem', true)
    .defineOption('escapeContent', false)
    .defineOption('clsNobaseMods', false)
    .defineOption('sourcemap', false)
    .defineOption('scope', 'template')
    .useFileList(['bh.js'])
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
                sourcemap: this._sourcemap,
                jsAttrName: this._jsAttrName,
                jsAttrScheme: this._jsAttrScheme,
                jsCls: this._jsCls,
                jsElem: this._jsElem,
                escapeContent: this._escapeContent,
                clsNobaseMods: this._clsNobaseMods,
                scope: this._scope,
                mimic: [].concat(this._mimic),
                requires: this._requires
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
