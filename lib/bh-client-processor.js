var File = require('enb-source-map/lib/file');

module.exports = {
    /**
     * Adapts single BH file content to client-side.
     * @param {String} input
     * @returns {String}
     */
    process: function (input) {
        return input
            .replace(/module\.exports\s*=\s*function\s*\([^\)]*\)\s*{/, '')
            .replace(/}\s*(?:;)?\s*$/, '');
    },

    /**
     * Builds module (see npm package "ym").
     * @param {String} bhEngineSource
     * @param {String} inputSources
     * @param {Object} dependencies example: {libName: "dependencyName"}
     * @param {String} jsAttrName
     * @param {String} jsAttrScheme
     * @returns {string}
     */
    buildModule: function (targetPath, bhEngine, inputSources, dependencies, jsAttrName, jsAttrScheme, useSourceMap) {
        var file = new File(targetPath, useSourceMap),
            libNames,
            depNames,
            libPrepares;

        if (dependencies) {
            libNames = Object.keys(dependencies);
            libPrepares = this._buildLibPrepares(dependencies);
            depNames = libNames.map(function (libName) {
                return dependencies[libName];
            });
        }
        file.writeLine('modules.define(\'bh\'' +
            (depNames ? ', ' + JSON.stringify(depNames) : '') +
            ', function(provide' + (libNames && libNames.length ? ', ' + libNames.join(', ') : '') + ') {'
        );

        this._concatFile(file, bhEngine, inputSources, libPrepares, jsAttrName, jsAttrScheme);
        file.writeLine('provide(bh);');
        file.writeLine('});');

        return file;
    },

    /**
     * Builds client js.
     * @param {String} bhEngineSource
     * @param {String} inputSources
     * @param {Object} dependencies example: {libName: "dependencyName"}
     * @param {String} jsAttrName
     * @param {String} jsAttrScheme
     * @param {Boolean} useSourceMap
     * @returns {string}
     */
    build: function (targetPath, bhEngine, inputSources, dependencies, jsAttrName, jsAttrScheme, useSourceMap) {
        var file = new File(targetPath, useSourceMap),
            libPrepares = this._buildLibPrepares(dependencies);

        return this._concatFile(file, bhEngine, inputSources, libPrepares, jsAttrName, jsAttrScheme);
    },

    _buildLibPrepares: function (dependencies) {
        var libNames = Object.keys(dependencies);

        return libNames.map(function (libName) {
            return 'bh.lib.' + libName + ' = ' + dependencies[libName] + ';';
        });
    },

    _concatFile: function (file, bhEngine, inputSources, libPrepares, jsAttrName, jsAttrScheme) {
        file.writeFileContent(bhEngine.filename, bhEngine.content);
        file.writeLine('var bh = new BH();');
        file.writeLine('bh.setOptions({');
        file.writeLine('    jsAttrName: \'' + jsAttrName + '\',');
        file.writeLine('    jsAttrScheme: \'' + jsAttrScheme + '\'');
        file.writeLine('});');

        if (libPrepares) {
            libPrepares.forEach(function (libPrepare) {
                file.writeLine(libPrepare);
            });
        }

        inputSources.forEach(function (inputSource) {
            file.writeLine('// begin: ' + inputSource.relPath);
            file.writeFileContent(inputSource.filename, inputSource.content);
            file.writeLine('// end: ' + inputSource.relPath);
        });

        return file;
    }
};
