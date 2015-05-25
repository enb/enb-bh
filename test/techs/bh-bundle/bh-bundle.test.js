var fs = require('fs'),
    mock = require('mock-fs'),
    TestNode = require('enb/lib/test/mocks/test-node'),
    Tech = require('../../../techs/bh-bundle'),
    FileList = require('enb/lib/file-list'),
    bhCoreFilename = require.resolve('bh/lib/bh.js'),
    writeFile = require('../../lib/write-file'),
    EOL = require('os').EOL;

describe('bh-bundle', function () {
    var mockBhCore = [
        'function BH () {}',
        'BH.prototype.apply = function() { return "^_^"; };',
        'BH.prototype.match = function() {};',
        'BH.prototype.setOptions = function() {};',
        'module.exports = BH;'
    ].join(EOL);

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

    describe('scope', function () {
        it('must perform each template in its scope', function () {
            var templates = [
                    'var text = "Hello world!";',
                    'bh.match("block", function(ctx) {ctx.content(typeof text === "undefined" ? "Hi!" : text);});'
                ],
                bemjson = { block: 'block' },
                html = '<div class="block">Hi!</div>';

            return assert(bemjson, html, templates);
        });

        it('must ignore utility variables', function () {
            var templates = [
                    'bh.match("global", function(ctx) {ctx.content(global);});',
                    'bh.match("BH", function(ctx) {ctx.content(BH);});'
                ],
                bemjson = [
                    { block: 'global' },
                    { block: 'BH' }
                ],
                html = '<div class="global"></div><div class="BH"></div>';

            return assert(bemjson, html, templates);
        });

        it('must perform each template in common scope if `scope: global`', function () {
            var templates = [
                    'var text = "Hello world!";',
                    'bh.match("block", function(ctx) {ctx.content(typeof text === "undefined" ? "Hi!" : text);});'
                ],
                bemjson = { block: 'block' },
                html = '<div class="block">Hello world!</div>',
                opts = { scope: 'global' };

            return assert(bemjson, html, templates, opts);
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

    describe('caches', function () {
        it('must use cached bhFile', function () {
            var scheme = {
                    blocks: {},
                    bundle: {}
                },
                bundle, fileList;

            scheme[bhCoreFilename] = mock.file({
                content: fs.readFileSync(bhCoreFilename, 'utf-8'),
                mtime: new Date(1)
            });

            /*
             * Добавляем кастомное ядро с mtime для проверки кэша.
             * Если mtime кастомного ядра совпадет с mtime родного ядра,
             * то должно быть использовано родное(закешированное).
             */
            scheme['mock.bh.js'] = mock.file({
                content: mockBhCore,
                mtime: new Date(1)
            });

            mock(scheme);

            bundle = new TestNode('bundle');
            fileList = new FileList();
            fileList.loadFromDirSync('blocks');
            bundle.provideTechData('?.files', fileList);

            return bundle.runTech(Tech)
                .then(function () {
                    return bundle.runTechAndRequire(Tech, { bhFile: 'mock.bh.js' });
                })
                .spread(function (bh) {
                    bh.apply({ block: 'block' }).must.be('<div class="block"></div>');
                });
        });

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

    it('must generate sourcemap', function () {
        var options = {
                sourcemap: true,
                bhFile: 'bh.js'
            },
            scheme = {
                blocks: {},
                bundle: {},
                'bh.js': 'module.exports = BH;'
            },
            bundle, fileList;

        mock(scheme);

        bundle = new TestNode('bundle');
        fileList = new FileList();
        fileList.loadFromDirSync('blocks');
        bundle.provideTechData('?.files', fileList);

        return bundle.runTechAndGetContent(Tech, options)
            .spread(function (BH) {
                BH.toString().must.include('sourceMappingURL');
            });
    });
});

function bhWrap(str) {
    return 'module.exports = function(bh) {' + str + '};';
}

function assert(bemjson, html, templates, options) {
    var scheme = {
            blocks: {},
            bundle: {}
        },
        bundle, fileList;

    templates && templates.forEach(function (item, i) {
        scheme.blocks['block-' + i + '.bh.js'] = bhWrap(item);
    });

    scheme[bhCoreFilename] = fs.readFileSync(bhCoreFilename, 'utf-8');

    mock(scheme);

    bundle = new TestNode('bundle');
    fileList = new FileList();
    fileList.loadFromDirSync('blocks');
    bundle.provideTechData('?.files', fileList);

    return bundle.runTechAndRequire(Tech, options)
        .spread(function (BH) {
            BH.apply(bemjson).must.be(html);

            options && options.mimic && [].concat(options.mimic).forEach(function (name) {
                BH[name].apply(bemjson).must.be(html);
            });
        });
}
