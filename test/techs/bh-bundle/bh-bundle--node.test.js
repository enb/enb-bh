var fs = require('fs'),
    mock = require('mock-fs'),
    TestNode = require('enb/lib/test/mocks/test-node'),
    Tech = require('../../../techs/bh-bundle'),
    FileList = require('enb/lib/file-list'),
    bhCoreFilename = require.resolve('bh/lib/bh.js');

describe('bh-bundle --node', function () {
    afterEach(function () {
        mock.restore();
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

    it('dependencies', function () {
        var templates = [
                'bh.match("block", function(ctx) { ctx.content(bh.lib.test); });'
            ],
            bemjson = { block: 'block' },
            html = '<div class="block">^_^</div>',
            options = {
                dependencies: { test: '"^_^"' }
            };

        return assert(bemjson, html, templates, options);
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

    return bundle.runTechAndRequire(Tech, options)
        .spread(function (bh) {
            bh.apply(bemjson).must.be(html);

            options && options.mimic && [].concat(options.mimic).forEach(function (name) {
                bh[name].apply(bemjson).must.be(html);
            });
        });
}
