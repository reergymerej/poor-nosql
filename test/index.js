/* jshint node: true */
/* global describe, it */

'use strict';

var mocha = require('mocha'),
    will = require('willy').will,
    poor = require('../index.js');

describe('sanity', function () {
    it('should be able to load the module', function () {
        will(poor).exist();
    });
});

describe('crud operations', function () {
    var data = {
        foo: 'bar',
        test: 'best'
    };
    var dataId;

    // TODO: Clean this up so the tests can be run in any order.

    it('should be able to create', function (done) {
        poor.create(data, function (err, id) {
            will(err).be(null);

            dataId = id;
            done();
        });
    });

    it('should be able to read', function (done) {
        poor.read(dataId, function (err, record) {
            will(record).have(Object.keys(data));
            done();
        });
    });

    it('should be able to update', function (done) {
        poor.update(dataId, { donkey: 'face' }, function (err) {
            will(err).be(null);

            poor.read(dataId, function (err, record) {
                will(record).have(['donkey']);
                done();
            });
        });
    });

    it('should be able to delete', function (done) {
        poor.delete(dataId, function (err) {
            will(err).be(null);

            poor.read(dataId, function (err, record) {
                will(record).not.exist();
                done();
            });
        });
    });
});
