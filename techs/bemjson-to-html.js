var enb = require('enb'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow'),
    requireOrEval = require('enb-require-or-eval'),
    asyncRequire = require('enb-async-require'),
    clearRequire = require('clear-require');

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
 * @param {String}  [options.target='?.html']            Path to a target with HTML file.
 * @param {String}  [options.bhFile='?.bh.js']           Path to a file with compiled BH module.
 * @param {String}  [options.bemjsonFile='?.bemjson.js'] Path to a BEMJSON file.
 *
 * @example
 * var BemjsonToHtmlTech = require('enb-bh/techs/bemjson-to-html'),
 *     BHCommonJSTech = require('enb-bh/techs/bh-commonjs'),
 *     FileProvideTech = require('enb/techs/file-provider'),
 *     bemTechs = require('enb-bem-techs');
 *
 * module.exports = function(config) {
 *     config.node('bundle', function(node) {
 *         // get BEMJSON file
 *         node.addTech([FileProvideTech, { target: '?.bemjson.js' }]);
 *
 *         // get FileList
 *         node.addTechs([
 *             [bemTechs.levels, { levels: ['blocks'] }],
 *             [bemTechs.bemjsonToBemdecl],
 *             [bemTechs.deps],
 *             [bemTechs.files]
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
module.exports = buildFlow.create()
    .name('bemjson-to-html')
    .target('target', '?.html')
    .useSourceFilename('bhFile', '?.bh.js')
    .useSourceFilename('bemjsonFile', '?.bemjson.js')
    .builder(function (bhFilename, bemjsonFilename) {
        var _this = this;
        clearRequire(bemjsonFilename);

        return requireOrEval(bemjsonFilename)
            .then(function (json) {
                clearRequire(bhFilename);

                return asyncRequire(bhFilename)
                    .then(function (BH) {
                        return _this.render(BH, json);
                    });
        });
    })
    .methods({
        render: function (BH, bemjson) {
            return BH.apply(bemjson);
        }
    })
    .createTech();
