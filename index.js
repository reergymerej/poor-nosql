/* jshint node: true */

'use strict';

var fs = require('fs');
var path = require('path');

var dbFile = path.join(__dirname, 'db.json');
var ID_FIELD = '_id';

/**
* Returns the db as an object.
* @param {Function} done - err, {Object}
* @private
*/
var openDb = function (done) {
    fs.readFile(dbFile, { encoding: 'utf8' }, function (err, data) {
        if (err) {
            throw new Error('unable to open db');
        }

        done(err, JSON.parse(data));
    });
};

/**
* Close the db, converting to JSON.
* @param {Object} db
* @param {Function} done - err
* @private
*/
var closeDb = function (db, done) {
    db = JSON.stringify(db);

    fs.writeFile(dbFile, db, function (err) {
        if (err) {
            throw new Error('unable to save db');
        }

        done(err);
    });
};

/**
* Get a fresh, unique, id for a record added to the db.
* @private
* @return Number
*/
var getId = function (db) {
    var keys = Object.keys(db);
    var id = keys.length;

    while (db.hasOwnProperty(id)) {
        id++;
    }

    return id;
};

/**
* Adds the id to a record.
* @param {Object} record
* @param {Number} id
* @private
* @return {Object}
*/
var insertId = function (record, id) {
    record[ID_FIELD] = id;
    return record;
};

/**
* Add a record to the db.
* @param {Object} data
* @param {Function} done - err
*/
var create = function (data, done) {
    // TODO: Add support for inserting multiple rows.

    // open db
    openDb(function (err, db) {
        var id = getId(db);

        data = insertId(data, id);

        // insert record
        db[id] = data;
        
        // close db
        closeDb(db, function (err) {
            if (typeof done === 'function') {
                done(err);
            }
        });
    });
};

/**
* Read a record from the db.
* @param {Number} id
* @param {Function} done - err, record
*/
var read = function (id, done) {
    openDb(function (err, db) {
        if (!err) {

            // TODO: Add support for queries.
            done(err, db[id]);
        }
    });
};

/**
* Update a record by id.
* @param {Number} id
* @param {Object} data
* @param {Function} done
*/
var update = function (id, data, done) {
    // TODO: Rework this so we don't have to open
    // the db for read and then again.
    read(id, function (err, record) {
        if (record) {
            data = insertId(data, id);
            record = data;
            openDb(function (err, db) {
                db[id] = record;
                closeDb(db, function (err) {
                    if (typeof done === 'function') {
                        done(err);
                    }
                });
            });
        }
    });
};

// =======================================
exports.create = create;
exports.read = read;
exports.update = update;

// =======================================
// TOOD: Add locking mechanism to prevent commits breaking each other.