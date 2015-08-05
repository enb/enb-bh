var path = require('path'),
    fs = require('fs'),
    mock = require('mock-fs'),
    TestNode = require('mock-enb/lib/mock-node'),
    Tech = require('../../../techs/bh-bundle'),
    FileList = require('enb/lib/file-list'),
    dropRequireCache = require('enb/lib/fs/drop-require-cache'),
    EOL = require('os').EOL;

describe('bh-bundle --node', function () {
    afterEach(function () {
        mock.restore();
    });

    describe('mimic', function () {
        it('mimic to bh by default', function () {
            var templates = [
                    'bh.match("block", function(ctx) {ctx.tag("a");});'
                ],
                bemjson = { block: 'block' },
                html = '<a class="block"></a>';

            return assert(bemjson, html, templates);
        });

        it('mimic to BEMHTML', function () {
            var templates = [
                    'bh.match("block", function(ctx) {ctx.tag("a");});'
                ],
                bemjson = { block: 'block' },
                html = '<a class="block"></a>',
                options = { mimic: 'BEMHTML' };

            return assert(bemjson, html, templates, options);
        });

        it('mimic as an array', function () {
            var templates = [
                    'bh.match("block", function(ctx) {ctx.tag("a");});'
                ],
                bemjson = { block: 'block' },
                html = '<a class="block"></a>',
                options = { mimic: ['bh', 'BEMHTML'] };

            return assert(bemjson, html, templates, options);
        });
    });

    describe('requires', function () {
        it('must get dependency from global scope using simple key', function () {
            var templates = [
                    'bh.match("block", function(ctx) { ctx.content(bh.lib.text); });'
                ],
                bemjson = { block: 'block' },
                html = '<div class="block">Hello world!</div>',
                options = {
                    requires: {
                        text: {
                            globals: 'text'
                        }
                    }
                },
                lib = 'this.text = "Hello world!";';

            return build(templates, options, lib)
                .then(function (BH) {
                    BH.apply(bemjson).must.equal(html);
                });
        });

        it('must get dependency from global scope using dot-delimited key', function () {
            var templates = [
                    'bh.match("block", function(ctx) { ctx.content(bh.lib.text); });'
                ],
                bemjson = { block: 'block' },
                html = '<div class="block">Hello world!</div>',
                options = {
                    requires: {
                        text: {
                            globals: 'text.value'
                        }
                    }
                },
                lib = 'this.text = {value: "Hello world!"};';

            return build(templates, options, lib)
                .then(function (BH) {
                    BH.apply(bemjson).must.equal(html);
                });
        });

        it('must require module from CommonJS', function () {
            var templates = [
                    [
                        'var fake = bh.lib.fake;',
                        'bh.match("block", function(ctx) {',
                        '    var text = fake.getText();',
                        '    ctx.content(text);',
                        '});'
                    ].join(EOL)
                ],
                bemjson = { block: 'block' },
                html = '<div class="block">^_^</div>',
                options = {
                    requires: {
                        fake: {
                            commonJS: 'fake'
                        }
                    }
                };

            return assert(bemjson, html, templates, options);
        });
    });
});

function bhWrap(str) {
    return 'module.exports = function(bh) {' + str + '};';
}

function build(templates, options, lib) {
    var scheme = {
            blocks: {},
            bundle: {},
            // jscs:disable
            node_modules: {
                fake: {
                    'index.js': 'module.exports = { getText: function () { return "^_^"; } };'
                }
            }
            // jscs:enable
        },
        bundle, fileList;

    templates && templates.forEach(function (item, i) {
        scheme.blocks['block-' + i + '.bh.js'] = bhWrap(item);
    });

    mock(scheme);

    bundle = new TestNode('bundle');
    fileList = new FileList();
    fileList.loadFromDirSync('blocks');
    bundle.provideTechData('?.files', fileList);

    return bundle.runTech(Tech, options)
        .spread(function () {
            var filename = path.resolve('bundle', 'bundle.bh.js'),
                contents = [
                    lib,
                    fs.readFileSync(filename, 'utf-8')
                ].join(EOL);

            fs.writeFileSync(filename, contents);

            dropRequireCache(require, filename);

            return require(filename);
        });
}

function assert(bemjson, html, templates, options) {
    return build(templates, options)
        .then(function (BH) {
            BH.apply(bemjson).must.be(html);

            options && options.mimic && [].concat(options.mimic).forEach(function (name) {
                BH[name].apply(bemjson).must.be(html);
            });
        });
}
