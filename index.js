/* jshint node: true */

'use strict';

var fs = require('fs');
var path = require('path');

var db = path.join(__dirname, 'db.json');



var write = function (data, done) {
    var buffer = new Buffer(JSON.stringify(data));

    fs.open(db, 'r+', function (err, fd) {
        if (!err) {
            fs.write(fd, buffer, 0, buffer.length, null, function (err, written, buffer) {
                if (!err) {
                    fs.close(fd, function (err) {
                        done(err);
                    });
                } else {
                    done(err);
                }
            });
        } else {
            done(err);
        }
    });
};

var add = function (data) {
    write(data, function (err) {
        console.log(err);
    });
};

add({foo: 'bar'});