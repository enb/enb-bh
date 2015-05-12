/**
 * bh-client-module
 * ================
 *
 * Склеивает *bh*-файлы по deps'ам в виде `?.bh.client.js`. Предназначен для сборки клиентского BH-кода.
 * Использует модульную обертку.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.bh.client.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
 *   (его предоставляет технология `files`). По умолчанию — `?.files`.
 * * *String* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — ['bh'].
 * * *Boolean* **sourcemap** — строить карты кода.
 * * *String|Array* **mimic** — имена модулей для экспорта.
 * * *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `data-bem`.
 * * *String* **jsAttrScheme** — Cхема данных для параметров инициализации. По умолчанию — `json`.
 * *                             Форматы:
 * *                                `js` — Получаем `return { ... }`.
 * *                                `json` — JSON-формат. Получаем `{ ... }`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('enb-bh/techs/bh-client-module'));
 * ```
 */
var vow = require('vow'),
    path = require('path'),
    bhClientProcessor = require('../lib/bh-client-processor'),
    readFile = require('../lib/util').readFile;

module.exports = require('enb/lib/build-flow').create()
    .name('bh-client-module')
    .target('target', '?.bh.client.js')
    .defineOption('bhFile', '')
    .defineOption('dependencies', {})
    .defineOption('mimic', [])
    .defineOption('jsAttrName', 'data-bem')
    .defineOption('jsAttrScheme', 'json')
    .defineOption('sourcemap', false)
    .useFileList(['bh.js'])
    .needRebuild(function (cache) {
        this._bhFile = this._bhFile ? path.join(this.node._root, this._bhFile) : require.resolve('bh/lib/bh.js');

        return cache.needRebuildFile('bh-file', this._bhFile);
    })
    .saveCache(function (cache) {
        cache.cacheFileInfo('bh-file', this._bhFile);
    })
    .builder(function (bhFiles) {
        var node = this.node,
            dependencies = this._dependencies,
            jsAttrName = this._jsAttrName,
            jsAttrScheme = this._jsAttrScheme,
            sourcemap = this._sourcemap,
            mimic = this._mimic,
            targetPath = node.resolvePath(this._target);

        return vow.all([
            readFile(this._bhFile),
            vow.all(bhFiles.map(function (file) {
                return readFile(file.fullname).then(function (data) {
                    data.content = bhClientProcessor.process(data.content);
                    data.relPath = node.relativePath(file.fullname);

                    return data;
                });
            }))
        ]).spread(function (bhEngine, inputSources) {
            return bhClientProcessor.buildModule(
                targetPath,
                bhEngine,
                inputSources,
                dependencies,
                jsAttrName,
                jsAttrScheme,
                sourcemap,
                mimic
            ).render();
        });
    })
    .createTech();
