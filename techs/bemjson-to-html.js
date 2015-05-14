/**
 * bemjson-to-html
 * =================
 *
 * Собирает *html*-файл с помощью *bemjson* и *bh*.
 *
 * **Опции**
 *
 * * *String* **bhFile** — Исходный BH-файл. По умолчанию — `?.bh.js`.
 * * *String* **bemjsonFile** — Исходный BEMJSON-файл. По умолчанию — `?.bemjson.js`.
 * * *String* **target** — Результирующий HTML-файл. По умолчанию — `?.html`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('enb-bh/techs/bemjson-to-html'));
 * ```
 */
var requireOrEval = require('enb/lib/fs/require-or-eval'),
    asyncRequire = require('enb/lib/fs/async-require'),
    dropRequireCache = require('enb/lib/fs/drop-require-cache');

module.exports = require('enb/lib/build-flow').create()
    .name('bemjson-to-html')
    .target('target', '?.html')
    .useSourceFilename('bhFile', '?.bh.js')
    .useSourceFilename('bemjsonFile', '?.bemjson.js')
    .optionAlias('bhFile', 'bhTarget')
    .optionAlias('bemjsonFile', 'bemjsonTarget')
    .optionAlias('target', 'destTarget')
    .builder(function (bhFilename, bemjsonFilename) {
        dropRequireCache(require, bemjsonFilename);

        return requireOrEval(bemjsonFilename)
            .then(function (json) {
                dropRequireCache(require, bhFilename);

                return asyncRequire(bhFilename)
                    .then(function (bh) {
                        return bh.apply(json);
                    });
        });
    })
    .createTech();
