/**
 * bh-commonjs
 * ===========
 *
 * Склеивает *BH*-файлы по deps'ам с помощью набора `require` в виде `?.bh.js`.
 * Предназначен для сборки серверного BH-кода. После сборки требуется наличия всех файлов,
 * подключённых с помощью набора `require`.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.bh.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
 *   (его предоставляет технология `files`). По умолчанию — `?.files`.
 * * *String* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — ['bh.js'].
 * * *String|Array* **mimic** — имена модулей для экспорта.
 * * *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `data-bem`.
 * * *String* **jsAttrScheme** — Cхема данных для параметров инициализации. По умолчанию — `json`.
 * *                             Форматы:
 * *                                `js` — значение по умолчанию. Получаем `return { ... }`.
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
 * nodeConfig.addTech(require('enb-bh/techs/bh-commonjs'));
 * ```
 */

var coreFilename = require.resolve('bh/lib/bh.js'),
    EOL = require('os').EOL;

module.exports = require('enb/lib/build-flow').create()
    .name('bh-commonjs')
    .target('target', '?.bh.js')
    .defineOption('mimic', [])
    .defineOption('jsAttrName', 'data-bem')
    .defineOption('jsAttrScheme', 'json')
    .defineOption('jsCls', 'i-bem')
    .defineOption('jsElem', true)
    .defineOption('escapeContent', false)
    .useFileList(['bh.js'])
    .builder(function (bhFiles) {
        var node = this.node;

        /**
         * Генерирует `require`-строку для подключения исходных bh-файлов.
         *
         * @param {String} absPath
         * @param {String} pre
         * @param {String} post
         */
        function buildRequire(absPath, pre, post) {
            var relPath = node.relativePath(absPath);

            // Replace slashes with backslashes for windows paths for correct require work.
            /* istanbul ignore if */
            if (relPath.indexOf('\\') !== -1) {
                relPath = relPath.replace(/\\/g, '/');
            }

            return [
                'dropRequireCache(require, require.resolve("' + relPath + '"));',
                (pre || '') + 'require("' + relPath + '")' + (post || '') + ';'
            ].join(EOL);
        }

        var dropRequireCacheFunc = [
            'function dropRequireCache(requireFunc, filename) {',
            '    var module = requireFunc.cache[filename];',
            '    if (module) {',
            '        if (module.parent) {',
            '            if (module.parent.children) {',
            '                var moduleIndex = module.parent.children.indexOf(module);',
            '                if (moduleIndex !== -1) {',
            '                    module.parent.children.splice(moduleIndex, 1);',
            '                }',
            '            }',
            '            delete module.parent;',
            '        }',
            '        delete module.children;',
            '        delete requireFunc.cache[filename];',
            '    }',
            '};'
        ].join(EOL);

        return [
            dropRequireCacheFunc,
            buildRequire(coreFilename, 'var BH = '),
            'var bh = new BH();',
            'bh.setOptions({',
            '   jsAttrName: \'' + this._jsAttrName + '\',',
            '   jsAttrScheme: \'' + this._jsAttrScheme + '\',',
            '   jsCls: ' + (this._jsCls ? ('\'' + this._jsCls + '\'') : false) + ',',
            '   jsElem: ' + this._jsElem + ',',
            '   escapeContent: ' + this._escapeContent,
            '});',
            '',
            bhFiles.map(function (file) {
                return buildRequire(file.fullname, '', '(bh)');
            }).join(EOL),
            '',
            'module.exports = bh;',
            this._mimic ? [].concat(this._mimic).map(function (name) {
                return 'bh[\'' + name + '\'] = bh;';
            }).join(EOL) : ''
        ].join(EOL);
    })
    .createTech();
