var mock = require('mock-fs'),
    TestNode = require('enb/lib/test/mocks/test-node'),
    bemjsonToHtml = require('../../techs/bemjson-to-html'),
    writeFile = require('../lib/write-file');

describe('bemjson-to-html', function () {
    var bundle;

    afterEach(function () {
        mock.restore();
    });

    it('must generate html', function () {
        var scheme = {
            blocks: {},
            bundle: {
                'bundle.bemjson.js': '({ block: "block" })',
                'bundle.bh.js': 'exports.apply = function(bemjson) { return "<html>^_^</html>"; };'
            }
        };

        mock(scheme);

        bundle = new TestNode('bundle');

        return bundle.runTechAndGetContent(bemjsonToHtml)
            .spread(function (html) {
                html.toString().must.be('<html>^_^</html>');
            });
    });

    describe('caches', function () {
        it('must not use outdated BEMJSON', function () {
            var scheme = {
                blocks: {},
                bundle: {
                    'bundle.bemjson.js': '({ block: "block" })',
                    'bundle.bh.js': 'exports.apply = function(bemjson) { return "<html>" +bemjson.block+ "</html>"; };'
                }
            };

            mock(scheme);

            bundle = new TestNode('bundle');

            return bundle.runTech(bemjsonToHtml)
                .spread(function () {
                    return writeFile(
                        'bundle/bundle.bemjson.js',
                        '({ block: "anotherBlock" })'
                    );
                })
                .then(function () {
                    return bundle.runTechAndGetContent(bemjsonToHtml);
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
                    'bundle.bh.js': 'exports.apply = function(bemjson) { return "<html>^_^</html>"; };'
                }
            };

            mock(scheme);

            bundle = new TestNode('bundle');

            return bundle.runTech(bemjsonToHtml)
                .then(function () {
                    return writeFile(
                        'bundle/bundle.bh.js',
                        'exports.apply = function(bemjson) { return "<html>o_o</html>"; };'
                    );
                })
                .then(function () {
                    return bundle.runTechAndGetContent(bemjsonToHtml);
                })
                .spread(function (html) {
                    html.toString().must.be('<html>o_o</html>');
                });
        });
    });
});
