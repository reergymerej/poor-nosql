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
* @param {Object/Object[]} data
* @param {Function} done - err, {Object[]} records
*/
var create = function (data, done) {

    if (!Array.isArray(data)) {
        data = [data];
    }

    // open db
    openDb(function (err, db) {
        data.forEach(function (record) {
            var id = getId(db);

            record = insertId(record, id);

            // insert record
            db[id] = record;
        });
        
        // close db
        closeDb(db, function (err) {
            if (typeof done === 'function') {
                done(err, data);
            }
        });

    });
};

/**
* Read a record from the db.
* @param {Number/Object} query _id number of record or query object
* @param {Function} done - err, record
*/
var read = function (query, done) {
    
    openDb(function (err, db) {
        if (!err) {
            if (typeof query === 'number') {
                done(null, db[query]);
            } else {
                query = new Query(query);
                done(null, query.getMatches(db));
            }
        }
    });
};

/**
* Update a record by id.
* @param {Number} id
* @param {Object} data
* @param {Function} done - err
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

/**
* Delete a record by id.
* @param {Number} id
* @param {Function} done - err, {Boolean} deleted 
*/
var del = function (id, done) {
    openDb(function (err, db) {
        var deleted;

        if (!err) {
            deleted = delete db[id];

            closeDb(db, function (err) {
                if (typeof done === 'function') {
                    done(err ? 'unable to delete' : null, deleted);
                }
            });
        }
    });
};

/**
* @private
* @param {Object} config
* The config object's properties should be field names.
* The properties' values should be Conditions.
*/
var Query = function (config) {
    var that = this;
    var conditions = [];

    Object.keys(config).forEach(function (field) {
        conditions.push(new Condition(config[field], field));
    });
    
    this.conditions = conditions;
};

/**
* @private
* Get matches from a collection.
* @param {Object} collection
* @return {Object[]}
*/
Query.prototype.getMatches = function (collection) {
    var that = this;
    var matches = [];

    Object.keys(collection).forEach(function (id) {
        var record = collection[id];
        var matchesConditions = true;

        that.conditions.forEach(function (condition) {
            // TODO: Use an iterator we can break out of.
            if (matchesConditions) {
                matchesConditions = condition.isMatch(record);
            }
        });

        if (matchesConditions) {
            matches.push(record);
        }
    });

    return matches;
};

/**
* @private
* @param {Object} config
* @param {String} field
* properties should be operators ($in, $lt, $gt, etc.)
*/
var Condition = function (config, field) {
    this.config = config;
    this.field = field;
    this.operators = Object.keys(config);
};

/**
* @private
* Does a record match this condition?
* @param {Object} record
* @return {Boolean}
*/
Condition.prototype.isMatch = function (record) {
    var that = this;
    var match = true;
    var fieldValue = record[this.field];

    this.operators.forEach(function (operator) {
        if (match) {
            
            switch (operator) {
                case '$in':
                    match = that.config[operator].indexOf(fieldValue) > -1;
                    break;
                default:
                    // TODO: Do we need one?
            }
        }
    });

    return match;
};

// =======================================
exports.create = create;
exports.read = read;
exports.update = update;
exports.delete = del;

// =======================================
// TOOD: Add locking mechanism to prevent commits breaking each other.