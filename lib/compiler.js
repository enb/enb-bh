var vow = require('vow'),
    enb = require('enb'),
    vfs = enb.asyncFS || require('enb/lib/fs/async-fs'),
    File = require('enb-source-map/lib/file'),
    EOL = require('os').EOL,
    browserify = require('browserify'),
    promisify = require('vow-node').promisify;

/**
 * @namespace BHCompiler
 */
module.exports = {
    compile: compile
};

/**
 * Compiles code of BH module with core and source templates.<br/><br/>
 *
 * The compiled BH module supports CommonJS and YModules. If there is no any modular system in the runtime,
 * the module will be provided as global variable `BH`.
 *
 * @memberof BHCompiler
 *
 * @param {Array.<{path: String, contents: String}>} sources Files with source templates.
 * @param {Object}   opts
 * @param {String}   opts.filename              Path to a compiled file.
 * @param {String}   opts.dirname               Path to a directory with compiled file.
 * @param {String}   opts.bhFilename            Path to file with BH core.
 * @param {Object}   [opts.requires]            Names for dependencies to `BH.lib.name`.
 * @param {String[]} [opts.mimic]               Names for export.
 * @param {String}   [opts.scope=template]      Scope of templates execution.
 * @param {Boolean}  [opts.sourcemap=false]     Includes inline source maps.
 * @param {String}   [opts.bhOptions]           Sets options for BH core.
 *
 * @returns {String} compiled code of BH module.
 */
function compile(sources, opts) {
    opts || (opts = {});

    /* istanbul ignore if */
    if (!opts.filename) {
        throw new Error('The `filename` option is not specified!');
    }

    var file = new File(opts.filename, opts.sourcemap),
        isTemplateScope = opts.hasOwnProperty('scope') ? opts.scope === 'template' : true,
        mimic = opts.mimic || [],
        requires = opts.requires || {};

    return vow.all([
        getBHCoreSource(opts.bhFilename),
        compileCommonJS(requires, opts.dirname)
    ]).spread(function (core, commonJSProvides) {
        // IIFE start
        file.writeLine('(function (global) {');

        // Core
        file.writeFileContent(core.path, core.contents);
        file.writeLine([
            'var bh = new BH();',
            'bh.setOptions(' + JSON.stringify(opts.bhOptions) + ');'
        ].join(EOL));

        // `init()` will be called after all the dependencies (bh.lib) will be provided
        // wrap in function scope not to pollute templates scope
        file.writeLine('var init = function (global, BH) {');
        sources.forEach(function (source) {
            var relPath = source.relPath || source.path;

            // wrap in IIFE to perform each template in its scope
            isTemplateScope && file.writeLine('(function () {');
            file.writeLine('// begin: ' + relPath);
            file.writeFileContent(source.path, source.contents);
            file.writeLine('// end: ' + relPath);
            isTemplateScope && file.writeLine('}());');
        });
        file.writeLine('};');

        // Export bh
        file.writeLine([
            commonJSProvides,
            'var defineAsGlobal = true;',
            // Provide to YModules
            'if (typeof modules === "object") {',
            compileYModule('BH', requires, true),
            mimic.map(function (name) {
                return name === 'BH' ? '' : compileYModule(name, 'BH');
            }).join(EOL),
            '    defineAsGlobal = false;',

            // Provide with CommonJS
            '} else if (typeof exports === "object") {',
            '    init();',
            mimic.map(function (name) {
                return '    bh["' + name + '"] = bh;';
            }).join(EOL),
            '    module.exports = bh;',
            '    defineAsGlobal = false;',
            '}',

            // Provide to Global Scope
            'if (defineAsGlobal) {',
            Object.keys(requires).map(function (name) {
                var item = requires[name];

                if (item.globals) {
                    return '    bh.lib.' + name + ' = global' + compileGlobalAccessor(item.globals) + ';';
                }
            }).join(EOL),
            '    init();',
            '    global.BH = bh;',
            mimic.map(function (name) {
                return '    global["' + name + '"] = bh;';
            }).join(EOL),
            '}'
        ].join(EOL));
        // IIFE finish
        file.writeLine('}(typeof window !== "undefined" ? window : global));');

        return file.render();
    });
}

/**
 * Reads code of BH core.
 *
 * @ignore
 * @param {String} filename — path to file with BH core.
 * @returns {{ path: String, contents: String }}
 */
function getBHCoreSource(filename) {
    return vfs.read(filename, 'utf-8')
        .then(function (contents) {
            return {
                path: filename,
                contents: contents
            };
        });
}

/**
 * Compiles code with YModule definition that exports BH module.
 *
 * @ignore
 * @param {String}   name        Module name.
 * @param {Object}   [requires]  Names for requires to `bh.lib.name`.
 * @returns {String}
 */
function compileYModule(name, requires) {
    var modules = [],
        deps = [],
        globals = {},
        needInit = true;

    if (requires === 'BH') {
        modules = ['BH'];
        needInit = false;
    } else {
        requires && Object.keys(requires).forEach(function (name) {
            var item = requires[name];

            if (item.ym) {
                modules.push(item.ym);
                deps.push(name);
            } else if (item.globals) {
                globals[name] = item.globals;
            }
        });
    }

    return [
        '    modules.define("' + name + '"' + (modules ? ', ' + JSON.stringify(modules) : '') +
            ', function(provide' + (deps && deps.length ? ', ' + deps.join(', ') : '') + ') {',
            deps.map(function (name) {
                return '        bh.lib.' + name + ' = ' + name + ';';
            }).join(EOL),
            Object.keys(globals).map(function (name) {
                return '        bh.lib.' + name + ' = global' + compileGlobalAccessor(globals[name]) + ';';
            }).join(EOL),
            needInit ? 'init();' : '',
        '        provide(bh);',
        '    });'
    ].join(EOL);
}

/**
 * Compiles with provide modules to CommonJS.
 *
 * @ignore
 * @param {Object}   [requires] Names for requires to `bh.lib.name`.
 * @param {String}   [dirname]  Path to a directory with compiled file.
 * @returns {String}
 */

function compileCommonJS(requires, dirname) {
    var browserifyOptions = {
            basedir: dirname
        },
        renderer = browserify(browserifyOptions),
        bundle = promisify(renderer.bundle.bind(renderer)),
        provides = [],
        hasCommonJSRequires = false;

    Object.keys(requires).map(function (name) {
        var item = requires[name];

        if (item.commonJS) {
            renderer.require(item.commonJS);
            provides.push('bh.lib.' + name + ' = require("' + item.commonJS + '");');
            hasCommonJSRequires = true;
        } else if (item.globals) {
            provides.push('bh.lib.' + name + ' = global' + compileGlobalAccessor(item.globals) + ';');
        }
    });

    if (!hasCommonJSRequires) {
        return vow.resolve(provides.join(EOL));
    }

    return bundle()
        .then(function (buf) {
            return [
                '(function () {',
                'var ' + buf.toString('utf-8'),
                provides.join(EOL),
                '}());'
            ].join(EOL);
        });
}

/**
 * Compiles accessor path of the `global` object.
 *
 * @ignore
 * @param {String} value  Dot delimited accessor path
 * @returns {String}
 */
function compileGlobalAccessor(value) {
    return '["' + value.split('.').join('"]["') + '"]';
}
