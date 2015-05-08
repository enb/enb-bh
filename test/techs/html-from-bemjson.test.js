var mock = require('mock-fs'),
    TestNode = require('enb/lib/test/mocks/test-node'),
    htmlFromBemjson = require('../../techs/html-from-bemjson'),
    writeFile = require('../lib/write-file');

describe('html-from-bemjson', function () {
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

        return bundle.runTechAndGetContent(htmlFromBemjson)
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

            return bundle.runTech(htmlFromBemjson)
                .spread(function () {
                    return writeFile(
                        'bundle/bundle.bemjson.js',
                        '({ block: "anotherBlock" })'
                    );
                })
                .then(function () {
                    return bundle.runTechAndGetContent(htmlFromBemjson);
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

            return bundle.runTech(htmlFromBemjson)
                .then(function () {
                    return writeFile(
                        'bundle/bundle.bh.js',
                        'exports.apply = function(bemjson) { return "<html>o_o</html>"; };'
                    );
                })
                .then(function () {
                    return bundle.runTechAndGetContent(htmlFromBemjson);
                })
                .spread(function (html) {
                    html.toString().must.be('<html>o_o</html>');
                });
        });
    });
});
