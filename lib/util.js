var vfs = require('enb/lib/fs/async-fs');

exports.readFile = function readFile(filename) {
    return vfs.read(filename, 'utf8')
        .then(function (content) {
            return {
                filename: filename,
                content: content
            };
        });
};
