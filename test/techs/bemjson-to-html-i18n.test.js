var mock = require('mock-fs'),
    TestNode = require('enb/lib/test/mocks/test-node'),
    bemjsonToHtmlI18N = require('../../techs/bemjson-to-html-i18n'),
    writeFile = require('../lib/write-file');

describe('bemjson-to-html-i18n', function () {
    var bundle, i18n;

    beforeEach(function () {
        i18n = [
            'var BEM = {',
            '    I18N: function () {',
            '        return "i18n-key";',
            '    }',
            '};'
        ].join('\n');
    });

    afterEach(function () {
        mock.restore();
    });

    it('must generate html with i18n', function () {
        var scheme = {
            blocks: {},
            bundle: {
                'bundle.bemjson.js': '({ block: "block" })',
                'bundle.bh.js': 'exports.apply = function(bemjson) { return "<html>" + BEM.I18N() + "</html>"; };',
                'bundle.lang.all.js': i18n,
                'bundle.lang.ru.js': ''
            }
        };

        mock(scheme);

        bundle = new TestNode('bundle');

        return bundle.runTechAndGetContent(
            bemjsonToHtmlI18N, { lang: 'ru' }
        ).spread(function (html) {
            html.toString().must.be('<html>i18n-key</html>');
        });
    });

    describe('caches', function () {
        it('must not use outdated BEMJSON', function () {
            var scheme = {
                blocks: {},
                bundle: {
                    'bundle.bemjson.js': '({ block: "block" })',
                    'bundle.bh.js': 'exports.apply = function(bemjson) { return "<html>" +bemjson.block+ "</html>"; };',
                    'bundle.lang.all.js': i18n,
                    'bundle.lang.ru.js': ''
                }
            };

            mock(scheme);

            bundle = new TestNode('bundle');

            return bundle.runTech(
                    bemjsonToHtmlI18N, { lang: 'ru' }
                ).then(function () {
                    return writeFile(
                        'bundle/bundle.bemjson.js',
                        '({ block: "anotherBlock" })'
                    );
                })
                .then(function () {
                    return bundle.runTechAndGetContent(bemjsonToHtmlI18N, { lang: 'ru' });
                })
                .spread(function (html) {
                    html.toString().must.be('<html>anotherBlock</html>');
                });
        });

        it('must not use outdated bh-bundle file', function () {
            var scheme = {
                blocks: {},
                bundle: {
                    'bundle.bemjson.js': '({ block: "block" })',
                    'bundle.bh.js': 'exports.apply = function(bemjson) { return "<html>^_^</html>"; };',
                    'bundle.lang.all.js': i18n,
                    'bundle.lang.ru.js': ''
                }
            };

            mock(scheme);

            bundle = new TestNode('bundle');

            return bundle.runTech(
                    bemjsonToHtmlI18N, { lang: 'ru' }
                ).then(function () {
                    return writeFile(
                        'bundle/bundle.bh.js',
                        'exports.apply = function(bemjson) { return "<html>o_o</html>"; };'
                    );
                })
                .then(function () {
                    return bundle.runTechAndGetContent(bemjsonToHtmlI18N, { lang: 'ru' });
                })
                .spread(function (html) {
                    html.toString().must.be('<html>o_o</html>');
                });
        });
    });
});
