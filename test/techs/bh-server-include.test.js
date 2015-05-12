var fs = require('fs'),
    mock = require('mock-fs'),
    TestNode = require('enb/lib/test/mocks/test-node'),
    bhServerInclude = require('../../techs/bh-server-include'),
    FileList = require('enb/lib/file-list'),
    bhCoreFilename = require.resolve('bh/lib/bh.js'),
    writeFile = require('../lib/write-file');

describe('bh-server-include', function () {
    var mockBhCore = [
        'function BH () {}',
        'BH.prototype.apply = function() { return "^_^"; };',
        'BH.prototype.match = function() {};',
        'BH.prototype.setOptions = function() {};',
        'module.exports = BH;'
    ].join('\n');

    afterEach(function () {
        mock.restore();
    });

    it('must compile bh-file', function () {
        var templates = [
                'bh.match("block", function(ctx) {ctx.tag("a");});'
            ],
            bemjson = { block: 'block' },
            html = '<a class="block"></a>';

        return assert(bemjson, html, templates);
    });

    it('must compile bh-file with custom core', function () {
        var templates = [
                'bh.match("block", function(ctx) { return "Not custom core!"; });'
            ],
            bemjson = { block: 'block' },
            html = '^_^',
            options = {
                bhFile: mockBhCore
            };

        return assert(bemjson, html, templates, options);
    });

    describe('jsAttr params', function () {
        it('must apply default jsAttrName and jsAttrScheme params', function () {
            var bemjson = { block: 'block', js: true },
                html = '<div class="block i-bem" data-bem=\'return {"block":{}}\'></div>';

            return assert(bemjson, html);
        });

        it('must redefine jsAttrName', function () {
            var bemjson = { block: 'block', js: true },
                html = '<div class="block i-bem" onclick=\'return {"block":{}}\'></div>',
                options = { jsAttrName: 'onclick' };

            return assert(bemjson, html, null, options);
        });

        it('must redefine jsAttrScheme', function () {
            var bemjson = { block: 'block', js: true },
                html = '<div class="block i-bem" data-bem=\'{"block":{}}\'></div>',
                options = { jsAttrScheme: 'json' };

            return assert(bemjson, html, null, options);
        });
    });

    it('truly CommonJS', function () {
        var templates = [
                [
                    'bh.match("block", function(ctx) {',
                        'var url = require("url");',
                        'ctx.content(url.resolve("http://example.com/", "/pathname"));',
                    '});'].join('\n')
            ],
            bemjson = { block: 'block' },
            html = '<div class="block">http://example.com/pathname</div>';

        return assert(bemjson, html, templates);
    });

    describe('mimic', function () {
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

            return bundle.runTech(bhServerInclude)
                .then(function () {
                    return bundle.runTechAndRequire(bhServerInclude, { bhFile: 'mock.bh.js' });
                })
                .spread(function (bh) {
                    bh.apply({ block: 'block' }).must.be('<div class="block"></div>');
                });
        });

        it('must rewrite cached bhFile if the new bhFile exist', function () {
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
             * Если mtime разные, то должно использоваться кастомное ядро
             * (кэш должен перезаписаться)
             */
            scheme['mock.bh.js'] = mock.file({
                content: mockBhCore,
                mtime: new Date(2)
            });

            mock(scheme);

            bundle = new TestNode('bundle');
            fileList = new FileList();
            fileList.loadFromDirSync('blocks');
            bundle.provideTechData('?.files', fileList);

            return bundle.runTech(bhServerInclude)
                .then(function () {
                    return bundle.runTechAndRequire(bhServerInclude, { bhFile: 'mock.bh.js' });
                })
                .spread(function (bh) {
                    bh.apply({ block: 'block' }).must.be('^_^');
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

            return bundle.runTech(bhServerInclude)
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

                    return bundle.runTechAndRequire(bhServerInclude);
                })
                .spread(function (bh) {
                    bh.apply({ block: 'block' }).must.be('<b class="block"></b>');
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

        return bundle.runTechAndGetContent(bhServerInclude, options)
            .spread(function (bh) {
                bh.toString().must.include('sourceMappingURL');
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

    if (options && options.bhFile) {
        scheme['bh.js'] = options.bhFile;
        options.bhFile = 'bh.js';
    }

    templates && templates.forEach(function (item, i) {
        scheme.blocks['block-' + i + '.bh.js'] = bhWrap(item);
    });

    scheme[bhCoreFilename] = fs.readFileSync(bhCoreFilename, 'utf-8');

    mock(scheme);

    bundle = new TestNode('bundle');
    fileList = new FileList();
    fileList.loadFromDirSync('blocks');
    bundle.provideTechData('?.files', fileList);

    return bundle.runTechAndRequire(bhServerInclude, options)
        .spread(function (bh) {
            bh.apply(bemjson).must.be(html);

            options && options.mimic && [].concat(options.mimic).forEach(function (name) {
                bh[name].apply(bemjson).must.be(html);
            });
        });
}
