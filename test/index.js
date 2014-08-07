/* jshint node: true */
/* global describe, it, beforeEach, afterEach */

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
        poor.create(data, function (err, records) {
            will(err).be(null);

            dataId = records[0]._id;
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

describe('inserting multiple records', function () {
    var records;

    beforeEach(function () {
        records = [
            { multipleInsertTest: true },
            { multipleInsertTest: true }
        ];
    });

    afterEach(function (done) {
        poor.delete({ multipleInsertTest: { $in: [true] } }, function (err, deleted) {
            done();
        });
    });

    it('should work', function (done) {
        poor.create(records, function (err, added) {
            will(err).be(null);
            will(added.length).be(2);
            records = added;
            done();
        });
    });
});

describe('queries', function () {
    var records;

    beforeEach(function (done) {
        records = [
            { queriesTest: true },
            { queriesTest: true }
        ];

        poor.create(records, function (err, added) {
            done();
        });
    });

    afterEach(function (done) {
        poor.delete({ queriesTest: { $in: [true] } }, function () {
            done();
        });
    });

    describe('$in', function () {
        it('should match when the field value is in the array', function (done) {
            var ids = (function () {
                var ids = [];
                records.forEach(function (record) {
                    ids.push(record._id);
                });
                return ids;
            }());

            var criteria = {
                _id: {
                    $in: ids
                }
            };

            poor.read(criteria, function (err, records) {
                will(records.length).be(2);
                done();
            });
        });
    });
});

describe('deleting multiple records', function () {
    var records;

    beforeEach(function (done) {
        records = [
            { deleteTest: true },
            { deleteTest: true },
            { deleteTest: true }
        ];

        poor.create(records, function (err, added) {
            done();
        });
    });

    it('should work by queries', function (done) {
        var criteria = {
            deleteTest: {
                $in: [true]
            }
        };

        poor.delete(criteria, function (err, deleted) {
            will(err).be(null);

            poor.read(criteria, function (err, records) {
                will(records.length).be(0);
                done();
            });
        });
    });
});
