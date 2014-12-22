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
     * @param {String} mimic
     * @returns {string}
     */
    buildModule: function (targetPath, bhEngine, inputSources, dependencies, jsAttrName, jsAttrScheme,
                           useSourceMap, mimic) {
        var file = new File(targetPath, useSourceMap);

        this._defineModule('bh', file, dependencies, bhEngine, inputSources, jsAttrName, jsAttrScheme, true);

        if (mimic) {
            this._defineModule(mimic, file, { bh: 'bh' });
        }

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
     * @param {String} mimic
     * @returns {string}
     */
    build: function (targetPath, bhEngine, inputSources, dependencies, jsAttrName, jsAttrScheme, useSourceMap, mimic) {
        var file = new File(targetPath, useSourceMap);
        return this._concatFile(file, bhEngine, inputSources, dependencies, jsAttrName, jsAttrScheme, mimic);
    },

    _buildLibPrepares: function (dependencies) {
        var libNames = Object.keys(dependencies);

        return libNames.map(function (libName) {
            return 'bh.lib.' + libName + ' = ' + dependencies[libName] + ';';
        });
    },

    /**
     * Builds standalone client code
     * @param {Object} file enb-source-map/lib/file instance
     * @param {Object} bhEngine
     * @param {Array} inputSources
     * @param {Object} dependencies example: {libName: "dependencyName"}
     * @param {String} jsAttrName
     * @param {String} jsAttrScheme
     * @param {String} [mimic]
     * @returns {Object} enb-source-map/lib/file instance
     */
    _concatFile: function (file, bhEngine, inputSources, dependencies, jsAttrName, jsAttrScheme, mimic) {
        var libPrepares = this._buildLibPrepares(dependencies);

        file.writeFileContent(bhEngine.filename, bhEngine.content);
        file.writeLine('var bh = new BH();');
        file.writeLine('bh.setOptions({');
        file.writeLine('    jsAttrName: \'' + jsAttrName + '\',');
        file.writeLine('    jsAttrScheme: \'' + jsAttrScheme + '\'');
        file.writeLine('});');

        if (mimic) {
            file.writeLine('if (typeof ' + mimic + ' === \'undefined\') {');
            file.writeLine('var ' + mimic + ' = bh;');
            file.writeLine('}');
        }

        libPrepares.forEach(function (libPrepare) {
            file.writeLine(libPrepare);
        });

        inputSources.forEach(function (inputSource) {
            file.writeLine('// begin: ' + inputSource.relPath);
            file.writeFileContent(inputSource.filename, inputSource.content);
            file.writeLine('// end: ' + inputSource.relPath);
        });

        return file;
    },

    /**
     * Builds ym client code
     * @param {String} name module name
     * @param {Object} file enb-source-map/lib/file instance
     * @param {Object} dependencies example: {libName: "dependencyName"}
     * @param {Object} bhEngine
     * @param {Array} inputSources
     * @param {String} jsAttrName
     * @param {String} jsAttrScheme
     * @param {Boolean} shouldConcatFile if set concat standalone module contents
     * @returns {Object} enb-source-map/lib/file instance
     */
    _defineModule: function (name, file, dependencies, bhEngine, inputSources, jsAttrName,
                                jsAttrScheme, shouldConcatFile) {
        var libNames,
            depNames;

        if (dependencies) {
            libNames = Object.keys(dependencies);
            depNames = libNames.map(function (libName) {
                return dependencies[libName];
            });
        }

        file.writeLine('modules.define(\'' + name + '\'' +
            (depNames ? ', ' + JSON.stringify(depNames) : '') +
            ', function(provide' + (libNames && libNames.length ? ', ' + libNames.join(', ') : '') + ') {'
        );

        if (shouldConcatFile) {
            this._concatFile(file, bhEngine, inputSources, dependencies, jsAttrName, jsAttrScheme);
        }

        file.writeLine('    provide(bh);');
        file.writeLine('});');
    }
};
