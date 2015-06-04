var requireOrEval = require('enb/lib/fs/require-or-eval'),
    asyncRequire = require('enb/lib/fs/async-require'),
    dropRequireCache = require('enb/lib/fs/drop-require-cache');

/**
 * @class BemjsonToHtmlTech
 * @augments {BaseTech}
 * @classdesc
 *
 * Build HTML file.<br/><br/>
 *
 * This tech uses `BH.apply(bemjson)` to build HTML.
 *
 * @param {Object}  [options]                            Options
 * @param {String}  [options.target='?.html']            Path to target with HTML file.
 * @param {String}  [options.bhFile='?.bh.js']           Path to file with compiled BH module.
 * @param {String}  [options.bemjsonFile='?.bemjson.js'] Path to file with BEMJSON file.
 *
 * @example
 * var BemjsonToHtmlTech = require('enb-bh/techs/bemjson-to-html'),
 *     BHCommonJSTech = require('enb-bh/techs/bh-commonjs'),
 *     FileProvideTech = require('enb/techs/file-provider'),
 *     bem = require('enb-bem-techs');
 *
 * module.exports = function(config) {
 *     config.node('bundle', function(node) {
 *         // get BEMJSON file
 *         node.addTech([FileProvideTech, { target: '?.bemjson.js' }]);
 *
 *         // get FileList
 *         node.addTechs([
 *             [bem.levels, levels: ['blocks']],
 *             bem.bemjsonToBemdecl,
 *             bem.deps,
 *             bem.files
 *         ]);
 *
 *         // build BH file
 *         node.addTech(BHCommonJSTech);
 *         node.addTarget('?.bh.js');
 *
 *         // build HTML file
 *         node.addTech(BemjsonToHtmlTech);
 *         node.addTarget('?.html');
 *     });
 * };
 */
module.exports = require('enb/lib/build-flow').create()
    .name('bemjson-to-html')
    .target('target', '?.html')
    .useSourceFilename('bhFile', '?.bh.js')
    .useSourceFilename('bemjsonFile', '?.bemjson.js')
    .builder(function (bhFilename, bemjsonFilename) {
        dropRequireCache(require, bemjsonFilename);

        return requireOrEval(bemjsonFilename)
            .then(function (json) {
                dropRequireCache(require, bhFilename);

                return asyncRequire(bhFilename)
                    .then(function (BH) {
                        return BH.apply(json);
                    });
        });
    })
    .createTech();
