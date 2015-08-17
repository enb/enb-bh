var path = require('path'),
    fs = require('fs'),
    mock = require('mock-fs'),
    TestNode = require('mock-enb/lib/mock-node'),
    Tech = require('../../techs/bh-commonjs'),
    FileList = require('enb/lib/file-list'),
    bhCoreFilename = require.resolve('bh/lib/bh.js'),
    writeFile = require('../lib/write-file'),
    dropRequireCache = require('enb/lib/fs/drop-require-cache'),
    EOL = require('os').EOL;

describe('bh-commonjs', function () {
    afterEach(function () {
        mock.restore();
    });

    it('must compile BH file', function () {
        var templates = [
                'bh.match("block", function(ctx) {ctx.tag("a");});'
            ],
            bemjson = { block: 'block' },
            html = '<a class="block"></a>';

        return assert(bemjson, html, templates);
    });

    describe('custom BH', function () {
        it('must use custom BH', function () {
            var bemjson = { block: 'block' },
                html = '^_^',
                options = {
                    bhFilename: path.resolve('fake-bh.js')
                };

            return assert(bemjson, html, null, options);
        });

        it('must rebuild if bhFilename is changed', function () {
            var bemjson = { block: 'block' },
                html = '^_^',
                options = {
                    bhFilename: path.resolve('fake-bh.js')
                },
                bundle = prepare([]);

            return bundle.runTech(Tech)
                .then(function () {
                    return bundle.runTechAndRequire(Tech, options);
                })
                .spread(function (BH) {
                    BH.apply(bemjson).must.equal(html);
                });
        });

        it('must use cached bhFile', function () {
            var bemjson = { block: 'block' },
                html = '<div class="block"></div>',
                options = {
                    bhFilename: path.resolve('fake-bh.js')
                },
                bundle = prepare([], { replaceBHCore: true });

            return bundle.runTech(Tech)
                .then(function () {
                    return bundle.runTechAndRequire(Tech, options);
                })
                .spread(function (BH) {
                    BH.apply(bemjson).must.equal(html);
                });
        });
    });

    describe('mode', function () {
        it('must drop require cache in dev mode', function () {
            var opts = {
                    devMode: true
                },
                bemjson = { block: 'block' },
                html = '<a class="block"></a>';

            return build([], opts)
                .then(function () {
                    return build(['bh.match("block", function(ctx) {ctx.tag("a");});'], opts);
                })
                .then(function (BH) {
                    BH.apply(bemjson).must.equal(html);
                });
        });

        it('must not drop require cache in prod mode', function () {
            var opts = {
                    devMode: false
                },
                bemjson = { block: 'block' },
                html = '<div class="block"></div>';

            dropRequireCache(require, path.resolve('blocks', 'block-0.bh.js'));

            return build(['bh.match("block", function() {});'], opts)
                .then(function () {
                    return build(['bh.match("block", function(ctx) {ctx.tag("a");});'], opts);
                })
                .then(function (BH) {
                    BH.apply(bemjson).must.equal(html);
                });
        });
    });

    describe('jsAttr params', function () {
        it('must apply default jsAttrName and jsAttrScheme params', function () {
            var bemjson = { block: 'block', js: true },
                html = '<div class="block i-bem" data-bem=\'{"block":{}}\'></div>';

            return assert(bemjson, html);
        });

        it('must redefine jsAttrName', function () {
            var bemjson = { block: 'block', js: true },
                html = '<div class="block i-bem" onclick=\'{"block":{}}\'></div>',
                options = { jsAttrName: 'onclick' };

            return assert(bemjson, html, null, options);
        });

        it('must redefine jsAttrScheme', function () {
            var bemjson = { block: 'block', js: true },
                html = '<div class="block i-bem" data-bem=\'return {"block":{}}\'></div>',
                options = { jsAttrScheme: 'js' };

            return assert(bemjson, html, null, options);
        });
    });

    describe('jsCls', function () {
        it('must use dafault value', function () {
            var bemjson = { block: 'block', js: true },
                html = '<div class="block i-bem" data-bem=\'{"block":{}}\'></div>';

            return assert(bemjson, html);
        });

        it('must redefine jsCls value', function () {
            var bemjson = { block: 'block', js: true },
                html = '<div class="block js" data-bem=\'{"block":{}}\'></div>',
                options = { jsCls: 'js' };

            return assert(bemjson, html, null, options);
        });

        it('must remove i-bem CSS-class', function () {
            var bemjson = { block: 'block', js: true },
                html = '<div class="block" data-bem=\'{"block":{}}\'></div>',
                options = { jsCls: false };

            return assert(bemjson, html, null, options);
        });

        it('must remove i-bem CSS-class by empty value', function () {
            var bemjson = { block: 'block', js: true },
                html = '<div class="block" data-bem=\'{"block":{}}\'></div>',
                options = { jsCls: '' };

            return assert(bemjson, html, null, options);
        });
    });

    describe('jsElem', function () {
        it('must add `i-bem` to elem if jsElem enabled', function () {
            var bemjson = { block: 'block', elem: 'elem', js: true },
                html = '<div class="block__elem i-bem" data-bem=\'{"block__elem":{}}\'></div>',
                options = { jsElem: true };

            return assert(bemjson, html, null, options);
        });

        it('must not add `i-bem` to elem if jsElem disabled', function () {
            var bemjson = { block: 'block', elem: 'elem', js: true },
                html = '<div class="block__elem" data-bem=\'{"block__elem":{}}\'></div>',
                options = { jsElem: false };

            return assert(bemjson, html, null, options);
        });
    });

    describe('escapeContent', function () {
        it('false by default', function () {
            var templates = [
                    'bh.match("block", function(ctx) {ctx.content("<script>");});'
                ],
                bemjson = { block: 'block' },
                html = '<div class="block"><script></div>';

            return assert(bemjson, html, templates);
        });

        it('use escaping when escapeContent param is true', function () {
            var templates = [
                    'bh.match("block", function(ctx) {ctx.content("<script>");});'
                ],
                bemjson = { block: 'block' },
                html = '<div class="block">&lt;script&gt;</div>',
                options = { escapeContent: true };

            return assert(bemjson, html, templates, options);
        });
    });

    describe('clsNobaseMods', function () {
        it('false by default', function () {
            var bemjson = { block: 'block', mods: { disabled: true, type: 'submit' } },
                html = '<div class="block block_disabled block_type_submit"></div>';

            return assert(bemjson, html);
        });

        it('must not use block\'s name for CSS-classes when clsNobaseMods param is true', function () {
            var bemjson = { block: 'block', mods: { disabled: true, type: 'submit' } },
                html = '<div class="block _disabled _type_submit"></div>',
                options = { clsNobaseMods: true };

            return assert(bemjson, html, null, options);
        });
    });

    describe('CommonJS', function () {
        it('truly CommonJS', function () {
            var templates = [
                    [
                        'bh.match("block", function(ctx) {',
                            'var url = require("url");',
                            'ctx.content(url.resolve("http://example.com/", "/pathname"));',
                        '});'
                    ].join(EOL)
                ],
                bemjson = { block: 'block' },
                html = '<div class="block">http://example.com/pathname</div>';

            return assert(bemjson, html, templates);
        });

        it('must correctly resolve path', function () {
            var template = [
                        'bh.match("block", function(ctx) {',
                            'var someModule = require("./someModule");',
                            'ctx.content(someModule());',
                        '});'
                    ].join(EOL),
                scheme = {
                    blocks: {
                        'block.bh.js': bhWrap(template),
                        'someModule.js': 'module.exports = function () { return "^_^" };'
                    },
                    bundle: {}
                },
                bundle, fileList;

            scheme[bhCoreFilename] = fs.readFileSync(bhCoreFilename, 'utf-8');

            mock(scheme);

            bundle = new TestNode('bundle');
            fileList = new FileList();
            fileList.loadFromDirSync('blocks');
            bundle.provideTechData('?.files', fileList);

            return bundle.runTechAndRequire(Tech)
                .spread(function (BH) {
                    BH.apply({ block: 'block' }).must.be('<div class="block">^_^</div>');
                });
        });
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
            options = { mimic: ['BH', 'BEMHTML'] };

            return assert(bemjson, html, templates, options);
        });
    });

    describe('caches', function () {
        it('must ignore outdated cache of the templates', function () {
            var scheme = {
                    blocks: {
                        'block.bh.js': bhWrap('bh.match("block", function(ctx) {ctx.tag("a");});')
                    },
                    bundle: {}
                },
                bundle, fileList;

            scheme[bhCoreFilename] = fs.readFileSync(bhCoreFilename, 'utf-8');

            mock(scheme);

            bundle = new TestNode('bundle');
            fileList = new FileList();
            fileList.loadFromDirSync('blocks');
            bundle.provideTechData('?.files', fileList);

            return bundle.runTech(Tech)
                .then(function () {
                    return writeFile(
                        'blocks/block.bh.js',
                        bhWrap('bh.match("block", function(ctx) {ctx.tag("b");});')
                    );
                })
                .then(function () {
                    fileList = new FileList();
                    fileList.loadFromDirSync('blocks');
                    bundle.provideTechData('?.files', fileList);

                    return bundle.runTechAndRequire(Tech);
                })
                .spread(function (BH) {
                    BH.apply({ block: 'block' }).must.be('<b class="block"></b>');
                });
        });
    });
});

function bhWrap(str) {
    return 'module.exports = function(bh) {' + str + '};';
}

function prepare(templates, opts) {
    opts || (opts = {});

    var scheme = {
            blocks: {},
            bundle: {},
            'fake-bh.js': mock.file({
                content: [
                    'function BH () {};',
                    'BH.prototype.setOptions = function () {};',
                    'BH.prototype.apply = function () { return "^_^"; };',
                    'module.exports = BH;'
                ].join(EOL),
                mtime: new Date(opts.replaceBHCore ? 1 : 10)
            })
        },
        bundle, fileList;

    templates && templates.forEach(function (item, i) {
        scheme.blocks['block-' + i + '.bh.js'] = bhWrap(item);
    });

    scheme[bhCoreFilename] = mock.file({
        content: fs.readFileSync(bhCoreFilename, 'utf-8'),
        mtime: new Date(1)
    });

    mock(scheme);

    bundle = new TestNode('bundle');
    fileList = new FileList();
    fileList.loadFromDirSync('blocks');
    bundle.provideTechData('?.files', fileList);

    return bundle;
}

function build(templates, options) {
    var bundle = prepare(templates);

    return bundle.runTechAndRequire(Tech, options)
        .spread(function (BH) {
            return BH;
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
