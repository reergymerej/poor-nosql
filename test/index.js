/* jshint node: true */
/* global describe, it, will */

'use strict';

var mocha = require('mocha'),
    willy = require('willy');

describe('sanity', function () {
    it('should be sane', function () {
        willy.will(true).be(true);
    });
});
