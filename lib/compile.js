var File = require('enb-source-map/lib/file'),
    EOL = require('os').EOL;

/**
 * Compile code of bh module with core and source templates.
 *
 * The compiled bh module supports CommonJS and YModules. If there is no any modular system in the runtime,
 * the module will be provided as global variable `bh`.
 *
 * @param {Object}   core          File with bh core
 * @param {String}   core.path     Path to file with bh core
 * @param {String}   core.contents Contents of file with bh core
 * @param {{path: String, contents: String}[]} sources Files with source templates
 * @param {Object}   opts
 * @param {String}   opts.filename          Path to compiled file
 * @param {Boolean}  [opts.sourcemap=false] Use inline source maps
 * @param {String}   [opts.jsAttrName]      Use `jsAttrName` option for bh core
 * @param {String}   [opts.jsAttrScheme]    Use `jsAttrScheme` option for bh core
 * @param {String}   [opts.jsCls]           Use `jsCls` option for bh core
 * @param {String[]} [opts.mimic]           Names for exports
 * @param {Object}   [opts.dependencies]    Names for requires to `bh.lib.name`
 * @returns {String} compiled code of bh module
 */
function compile(core, sources, opts) {
    opts || (opts = {});

    /* istanbul ignore if */
    if (!opts.filename) {
        throw new Error('The `filename` option is not specified!');
    }

    var file = new File(opts.filename, opts.sourcemap),
        mimic = opts.mimic || [],
        dependencies = opts.dependencies || {},
        depNames = Object.keys(dependencies);

    // IIFE start
    file.writeLine('(function (global) {');

    // Core
    file.writeFileContent(core.path, core.contents);
    file.writeLine([
        'var bh = new BH();',
        'bh.setOptions({',
        '    jsAttrName: "' + opts.jsAttrName + '",',
        '    jsAttrScheme: "' + opts.jsAttrScheme + '",',
        '    jsCls: ' + (opts.jsCls ? ('"' + opts.jsCls + '"') : 'false'),
        '});'
    ].join(EOL));

    // Source Templates
    sources.forEach(function (source) {
        var relPath = source.relPath || source.path;

        file.writeLine('// begin: ' + relPath);
        file.writeFileContent(source.path, source.contents);
        file.writeLine('// end: ' + relPath);
    });

    // Export bh
    file.writeLine([
        'var defineAsGlobal = true;',
        // Provide to YModules
        'if (typeof modules === "object") {',
        compileYModule('bh', dependencies),
        mimic.map(function (name) {
            return compileYModule(name);
        }).join(EOL),
        '    defineAsGlobal = false;',

        // Provide libs from global scope
        depNames.length ?
            [
                '} else {',
                depNames.map(function (name) {
                    return '    bh.lib.' + name + ' = ' + dependencies[name] + ';';
                }).join(EOL),
                '}'
            ].join(EOL) :
            '}',

        // Provide with CommonJS
        'if (typeof exports === "object") {',
        mimic.map(function (name) {
            return '    bh["' + name + '"] = bh;';
        }).join(EOL),
        '    module.exports = bh;',
        '    defineAsGlobal = false;',
        '}',

        // Provide to Global Scope
        'if (defineAsGlobal) {',
        '    global.bh = bh;',
        mimic.map(function (name) {
            return '    global["' + name + '"] = bh;';
        }).join(EOL),
        '}'
    ].join(EOL));

    // IIFE finish
    file.writeLine('}(this));');

    return file.render();
}

/**
 * Compile code with YModule definition that exports `bh` module.
 *
 * @param {String}   name            Module name
 * @param {Object}   [dependencies]  Names for requires to `bh.lib.name`.
 * @returns {String}
 */
function compileYModule(name, dependencies) {
    dependencies || (dependencies = {});

    var libs = Object.keys(dependencies),
        deps = libs.map(function (name) {
            return dependencies[name];
        });

    return [
        '    modules.define("' + name + '"' + (deps ? ', ' + JSON.stringify(deps) : '') +
            ', function(provide' + (libs && libs.length ? ', ' + libs.join(', ') : '') + ') {',
        libs.map(function (name) {
            return '        bh.lib.' + name + ' = ' + dependencies[name] + ';';
        }),
        '        provide(bh);',
        '    });'
    ].join(EOL);
}

module.exports = compile;
