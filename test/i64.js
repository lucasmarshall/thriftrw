// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');
var Long = require('long');
var testRW = require('bufrw/test_rw');
var testThrift = require('./thrift-test');
var thriftrw = require('../index');
var ThriftI64 = thriftrw.ThriftI64;
var TYPE = require('../TYPE');
var Buffer = require('buffer').Buffer;

var thrift = new thriftrw.Thrift({
    source: fs.readFileSync(path.join(__dirname, 'i64.thrift'), 'ascii')
});

var bufferRW = thrift.getType('bufnum').rw;
var longRW = thrift.getType('long').rw;
var dateRW = thrift.getType('timestamp').rw;

var bufferCases = [
    [
        Buffer([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]),
        [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]
    ]
];

test('I64BufferRW', testRW.cases(bufferRW, bufferCases));

var longCases = [
    [
        Long.fromNumber(Math.pow(2, 53) - 1),
        [0x00, 0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]
    ]
];

test('I64LongRW', testRW.cases(longRW, longCases));

var dateCases = [
    [
        new Date(0),
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
    ],
    [
        new Date(1),
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]
    ],
    [
        new Date(1000),
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0xe8]
    ]
];

test('I64DateRW', testRW.cases(dateRW, dateCases));

test('coerce string', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto('0102030405060708', buffer, 0);
    assert.ifError(res.err, 'write into buffer');
    assert.equals(res.offset, 8, 'offset after write');
    assert.deepEquals(buffer, new Buffer('0102030405060708', 'hex'), 'written value');
    assert.end();
});

test('fail to coerce string of bad length', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto('01020304050607', buffer, 0);
    assert.equals(res.err.message,
        'invalid argument, expected a string of 16 hex characters, or other i64 representation', 'string length error');
    assert.end();
});

test('fail to coerce string of bad hi value', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto('--------05060708', buffer, 0);
    assert.equals(
        res.err.message,
        'invalid argument, expected a string of hex characters, or other i64 representation',
        'validate hi string value');
    assert.end();
});

test('fail to coerce string of bad lo value', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto('01020304--------', buffer, 0);
    assert.equals(res.err.message,
        'invalid argument, expected a string of hex characters, or other i64 representation',
        'validate lo string value');
    assert.end();
});

test('coerce {hi[gh], lo[w]} object to i32 on wire', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto({hi: 1, lo: 2}, buffer, 0);
    assert.ifError(res.err, 'write into buffer');
    assert.equals(res.offset, 8, 'offset after write');
    assert.deepEquals(buffer, new Buffer('0000000100000002', 'hex'), 'wrote hi[gh], lo[w] to buffer');
    assert.end();
});

test('fail to coerce object bad hi value', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto({hi: null, lo: 0}, buffer, 0);
    assert.equals(res.err.message,
        'invalid argument, expected {hi[gh], lo[w]} with high bits, or other i64 representation',
        'validate hi type');
    assert.end();
});

test('fail to coerce object bad lo value', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto({hi: 0, lo: null}, buffer, 0);
    assert.equals(res.err.message,
        'invalid argument, expected {hi[gh], lo[w]} with low bits, or other i64 representation',
        'validate lo type');
    assert.end();
});

test('coerce small number', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto(10, buffer, 0);
    assert.ifError(res.err, 'write into buffer');
    assert.equals(res.offset, 8, 'offset after write');
    assert.deepEquals(buffer, new Buffer('000000000000000a', 'hex'), 'written value');
    assert.end();
});

test('coerce large number', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto(Math.pow(2, 50), buffer, 0);
    assert.ifError(res.err, 'write into buffer');
    assert.equals(res.offset, 8, 'offset after write');
    assert.deepEquals(buffer, new Buffer('0004000000000000', 'hex'), 'written value');
    assert.end();
});

test('coerce array of bytes', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto([1, 2, 3, 4, 5, 6, 7, 8], buffer, 0);
    assert.ifError(res.err, 'write into buffer');
    assert.equals(res.offset, 8, 'offset after write');
    assert.deepEquals(buffer, new Buffer('0102030405060708', 'hex'), 'written value');
    assert.end();
});

test('fail to coerce array with bad length', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto([1, 2, 3, 4, 5, 6, 7, 8, 9], buffer, 0);
    assert.equals(res.err.message,
        'invalid argument, expected an array of 8 bytes, or other i64 representation',
        'validate buffer length');
    assert.end();
});

test('fail to coerce', function t(assert) {
    var buffer = new Buffer(8);
    var res = bufferRW.writeInto(null, buffer, 0);
    assert.equals(res.err.message, 'invalid argument, expected i64 representation');
    assert.end();
});

test('coerce date string', function t(assert) {
    var buffer = new Buffer(8);
    buffer.fill(0xff);
    dateRW.writeInto('1970-01-01T00:00:00.000', buffer, 0);
    assert.deepEquals(buffer, new Buffer([0, 0, 0, 0, 0, 0, 0, 0]), 'coerces date string');
    assert.end();
});

test('coerce number to date', function t(assert) {
    var buffer = new Buffer(8);
    dateRW.writeInto(0, buffer, 0);
    assert.deepEquals(buffer, new Buffer([0, 0, 0, 0, 0, 0, 0, 0]), 'coerces number to date');
    assert.end();
});

test('ThriftI64', testThrift(ThriftI64, bufferRW, TYPE.I64));
