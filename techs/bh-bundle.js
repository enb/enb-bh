/**
 * bh-bundle
 * =========
 *
 * Склеивает *BH*-файлы по deps'ам в виде `?.bh.js` бандла.
 *
 * Предназначен для сборки как клиентского, так и серверного BH-кода.
 * Предполагается, что в *BH*-файлах не используется `require`.
 *
 * Поддерживает CommonJS и YModules. Если в исполняемой среде нет ни одной модульной системы, то модуль будет
 * предоставлен в глобальную переменную `bh`.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.bh.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
 *   (его предоставляет технология `files`). По умолчанию — `?.files`.
 * * *String* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — ['bh.js'].
 * * *Boolean* **sourcemap** — строить карты кода.
 * * *String|Array* **mimic** — имена переменных/модулей для экспорта.
 * * *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `data-bem`.
 * * *String* **jsAttrScheme** — Cхема данных для параметров инициализации. По умолчанию — `json`.
 * *                             Форматы:
 * *                                `js` — Получаем `return { ... }`.
 * *                                `json` — JSON-формат. Получаем `{ ... }`.
 *
 * * *String|Boolean* **jsCls** — имя `i-bem` CSS-класса. По умолчанию - `i-bem`. Для того, чтобы класс
 *    не добавлялся, следует указать значение `false` или пустую строку.
 *
 * * *Boolean* **escapeContent** — экранирование содержимого. По умолчанию - `false`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('enb-bh/techs/bh-bundle'));
 * ```
 */
var vow = require('vow'),
    path = require('path'),
    vfs = require('enb/lib/fs/async-fs'),
    compile = require('../lib/compile');

module.exports = require('enb/lib/build-flow').create()
    .name('bh-bundle')
    .target('target', '?.bh.js')
    .defineOption('bhFile', '')
    .defineOption('dependencies', {})
    .defineOption('mimic', [])
    .defineOption('jsAttrName', 'data-bem')
    .defineOption('jsAttrScheme', 'json')
    .defineOption('jsCls', 'i-bem')
    .defineOption('escapeContent', false)
    .defineOption('sourcemap', false)
    .useFileList(['bh.js'])
    .needRebuild(function (cache) {
        this._bhFile = this._bhFile ? path.join(this.node._root, this._bhFile) : require.resolve('bh/lib/bh.js');
        return cache.needRebuildFile('bh-file', this._bhFile);
    })
    .saveCache(function (cache) {
        cache.cacheFileInfo('bh-file', this._bhFile);
    })
    .builder(function (files) {
        return vow.all([
                this._readCore(),
                this._readTemplates(files)
            ], this)
            .spread(function (core, sources) {
                return this._compile(core, sources);
            }, this);
    })
    .methods({
        /**
         * Read file with BH core.
         *
         * @returns {{ path: String, contents: String }}
         * @protected
         */
        _readCore: function () {
            var filename = this._bhFile;

            return vfs.read(filename, 'utf8')
                .then(function (contents) {
                    return {
                        path: filename,
                        contents: contents
                    };
                });
        },
        /**
         * Read files with source templates.
         *
         * @param {FileList} files
         * @returns {{ path: String, relPath: String, contents: String }[]}
         * @protected
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
         * Compile code of bh module with core and source templates.
         *
         * @param {Object}   core          File with bh core
         * @param {String}   core.path     Path to file with BH core
         * @param {String}   core.contents Contents of file with BH core
         * @param {{path: String, contents: String}[]} sources Files with source templates
         * @returns {String} compiled code of bh module
         * @protected
         */
        _compile: function (core, sources) {
            var opts = {
                filename: this.node.resolvePath(this._target),
                sourcemap: this._sourcemap,
                jsAttrName: this._jsAttrName,
                jsAttrScheme: this._jsAttrScheme,
                jsCls: this._jsCls,
                escapeContent: this._escapeContent,
                mimic: [].concat(this._mimic),
                dependencies: this._dependencies
            };

            return compile(core, sources, opts);
        },
        /**
         * Adapts single BH file content to client-side.
         *
         * @param {String} contents
         * @returns {String}
         * @protected
         */
        _processTemplate: function (contents) {
            return contents
                .replace(/module\.exports\s*=\s*function\s*\([^\)]*\)\s*\{/, '')
                .replace(/}\s*(?:;)?\s*$/, '');
        }
    })
    .createTech();
