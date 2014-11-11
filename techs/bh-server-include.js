/**
 * bh-server-include
 * =================
 *
 * Склеивает *bh*-файлы по deps'ам в виде `?.bh.js`. Предназначен для сборки серверного BH-кода.
 * Предполагается, что в *bh*-файлах не используется `require`.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.bh.js`.
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
 * nodeConfig.addTech(require('enb-bh/techs/bh-server-include'));
 * ```
 */

var vow = require('vow'),
    path = require('path'),
    bhClientProcessor = require('../lib/bh-client-processor'),
    readFile = require('../lib/util').readFile;

module.exports = require('enb/lib/build-flow').create()
    .name('bh-server-include')
    .target('target', '?.bh.js')
    .defineOption('bhFile', '')
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
            dependencies = {},
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
            var file = bhClientProcessor.build(
                targetPath,
                bhEngine,
                inputSources,
                dependencies,
                jsAttrName,
                jsAttrScheme,
                sourcemap
            );

            file.writeLine('module.exports = bh;');

            return file.render();
        });
    })
    .createTech();
