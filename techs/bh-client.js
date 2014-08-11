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

var vow = require('vow');
var vfs = require('enb/lib/fs/async-fs');
var path = require('path');
var bhClientProcessor = require('../lib/bh-client-processor');

module.exports = require('enb/lib/build-flow').create()
    .name('bh-client')
    .target('target', '?.bh.client.js')
    .defineOption('bhFile', '')
    .defineOption('dependencies', {})
    .defineOption('jsAttrName', 'onclick')
    .defineOption('jsAttrScheme', 'js')
    .useFileList(['bh.js'])
    .needRebuild(function (cache) {
        this._bhFile = this._bhFile ? path.join(this.node._root, this._bhFile) : require.resolve('bh/lib/bh.js');
        return cache.needRebuildFile('bh-file', this._bhFile);
    })
    .saveCache(function (cache) {
        cache.cacheFileInfo('bh-file', this._bhFile);
    })
    .builder(function (bhFiles) {
        var node = this.node;
        var dependencies = this._dependencies;
        var jsAttrName = this._jsAttrName;
        var jsAttrScheme = this._jsAttrScheme;
        return vow.all([
            vfs.read(this._bhFile, 'utf8').then(function (data) {
                return data;
            }),
            vow.all(bhFiles.map(function (file) {
                return vfs.read(file.fullname, 'utf8').then(function (data) {
                    var relPath = node.relativePath(file.fullname);
                    /**
                     * Выставляем комментарии о склеенных файлах.
                     */
                    return '// begin: ' + relPath + '\n' +
                        bhClientProcessor.process(data) + '\n' +
                        '// end: ' + relPath + '\n';
                });
            })).then(function (sr) {
                return sr.join('\n');
            })
        ]).spread(function (bhEngineSource, inputSources) {
            return bhClientProcessor.build(bhEngineSource, inputSources, dependencies, jsAttrName, jsAttrScheme);
        });
    })
    .createTech();
