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
 * * *String* **scope** — скоуп выполнения кода шаблонов. По умолчанию — `template`. Если значение равно `template`,
 *    то каждый шаблон будет выполнен в своём отдельном скоупе. Если значение равно `global`,
 *    то все шаблоны будут выполнены в общем скоупе.
 * * *String|Array* **mimic** — имена переменных/модулей для экспорта.
 * * *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `data-bem`.
 * * *String* **jsAttrScheme** — Cхема данных для параметров инициализации. По умолчанию — `json`.
 * *                             Форматы:
 * *                                `js` — Получаем `return { ... }`.
 * *                                `json` — JSON-формат. Получаем `{ ... }`.
 *
 * * *String|Boolean* **jsCls** — имя `i-bem` CSS-класса. По умолчанию - `i-bem`. Для того, чтобы класс
 *    не добавлялся, следует указать значение `false` или пустую строку.
 * * *Boolean* **jsElem** — следует ли добавлять `i-bem` класс для элементов. По умолчанию - `true`.
 *    Для того, чтобы класс не добавлялся, следует указать значение `false`.
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
    vfs = require('enb/lib/fs/async-fs'),
    compile = require('../lib/compile');

module.exports = require('enb/lib/build-flow').create()
    .name('bh-bundle')
    .target('target', '?.bh.js')
    .defineOption('requires', {})
    .defineOption('mimic', [])
    .defineOption('jsAttrName', 'data-bem')
    .defineOption('jsAttrScheme', 'json')
    .defineOption('jsCls', 'i-bem')
    .defineOption('jsElem', true)
    .defineOption('escapeContent', false)
    .defineOption('sourcemap', false)
    .defineOption('scope', 'template')
    .useFileList(['bh.js'])
    .builder(function (files) {
        return this._readTemplates(files)
            .then(function (sources) {
                return this._compile(sources);
            }, this);
    })
    .methods({
        /**
         * Compile code of bh module with core and source templates.
         *
         * @param {{path: String, contents: String}[]} sources Files with source templates
         * @returns {String} compiled code of bh module
         * @protected
         */
        _compile: function (sources) {
            var opts = {
                filename: this.node.resolvePath(this._target),
                sourcemap: this._sourcemap,
                jsAttrName: this._jsAttrName,
                jsAttrScheme: this._jsAttrScheme,
                jsCls: this._jsCls,
                jsElem: this._jsElem,
                escapeContent: this._escapeContent,
                scope: this._scope,
                mimic: [].concat(this._mimic),
                requires: this._requires
            };

            return compile(sources, opts);
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
