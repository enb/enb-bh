/**
 * bh-client
 * =========
 *
 * Склеивает *bh*-файлы по deps'ам в виде `?.bh.client.js`. Предназначен для сборки клиентского BH-кода.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.bh.client.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
 *   (его предоставляет технология `files`). По умолчанию — `?.files`.
 * * *String* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — ['bh'].
 * * *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `onclick`.
 * * *String* **jsAttrScheme** — Cхема данных для параметров инициализации. По умолчанию — `js`.
 * *                             Форматы:
 * *                                `js` — Получаем `return { ... }`.
 * *                                `json` — JSON-формат. Получаем `{ ... }`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('enb-bh/techs/bh-client'));
 * ```
 */

var vow = require('vow'),
    path = require('path'),
    bhClientProcessor = require('../lib/bh-client-processor'),
    readFile = require('../lib/util').readFile;

module.exports = require('enb/lib/build-flow').create()
    .name('bh-client')
    .target('target', '?.bh.client.js')
    .defineOption('bhFile', '')
    .defineOption('dependencies', {})
    .defineOption('jsAttrName', 'onclick')
    .defineOption('jsAttrScheme', 'js')
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
            return bhClientProcessor.build(
                targetPath,
                bhEngine,
                inputSources,
                dependencies,
                jsAttrName,
                jsAttrScheme,
                sourcemap
            ).render();
        });
    })
    .createTech();
