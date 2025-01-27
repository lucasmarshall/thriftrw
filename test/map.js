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
var testRW = require('bufrw/test_rw');
var path = require('path');
var fs = require('fs');
var ThriftMap = require('../map').ThriftMap;
var Thrift = require('../thrift').Thrift;
var thrift;

var ThriftString = require('../string').ThriftString;
var ThriftI16 = require('../i16').ThriftI16;

test('thrift parses', function t(assert) {
    var filename = path.join(__dirname, 'map.thrift');
    var source = fs.readFileSync(filename, 'ascii');
    thrift = new Thrift({source: source});
    thrift.getType('Graph');
    assert.pass('thrift parses');
    assert.end();
});

var strI16Map = new ThriftMap(new ThriftString(), new ThriftI16(), {});
test('ThriftMap: strI16MapRW', testRW.cases(strI16Map.rw, [
    [{}, [
        0x0b,                  // key_type:1 -- 11, string
        0x06,                  // val_type:1 -- 6, i16
        0x00, 0x00, 0x00, 0x00 // length:4   -- 0
    ]],

    [{
        'abc': 1,
        'def': 2,
        'ghi': 3
    }, [
        0x0b,                   // key_type:1 -- 11, string
        0x06,                   // val_type:1 -- 6, i16
        0x00, 0x00, 0x00, 0x03, // length:4   -- 3
                                //            --
        0x00, 0x00, 0x00, 0x03, // str_len:4  -- 3
        0x61, 0x62, 0x63,       // chars      -- "abc"
        0x00, 0x01,             // Int16BE    -- 1
                                //            --
        0x00, 0x00, 0x00, 0x03, // str_len:4  -- 3
        0x64, 0x65, 0x66,       // chars      -- "def"
        0x00, 0x02,             // Int16BE    -- 2
                                //            --
        0x00, 0x00, 0x00, 0x03, // str_len:4  -- 3
        0x67, 0x68, 0x69,       // chars      -- "ghi"
        0x00, 0x03              // Int16BE    -- 3
    ]],

    {
        readTest: {
            bytes: [
                0x09,                  // key_type:1 -- 9
                0x02,                  // val_type:1 -- 2
                0x00, 0x00, 0x00, 0x00 // length:4   -- 0
            ],
            error: {
                type: 'thrift-map-key-typeid-mismatch',
                name: 'ThriftMapKeyTypeidMismatchError',
                message: 'encoded map key typeid 9 doesn\'t match expected ' +
                         'type "string" (id: 11)'
            }
        }
    },

    {
        readTest: {
            bytes: [
                0x0b,                  // key_type:1 -- 11
                0x09,                  // val_type:1 -- 9
                0x00, 0x00, 0x00, 0x00 // length:4   -- 0
            ],
            error: {
                type: 'thrift-map-val-typeid-mismatch',
                name: 'ThriftMapValTypeidMismatchError',
                message: 'encoded map value typeid 9 doesn\'t match expected ' +
                         'type "i16" (id: 6)'
            }
        }
    }

]));

var strI16MapEntries = new ThriftMap(new ThriftString(), new ThriftI16(),
    {'js.type': 'entries'});
test('ThriftMap: strI16MapRW', testRW.cases(strI16MapEntries.rw, [
    [[], [
        0x0b,                  // key_type:1 -- 11, string
        0x06,                  // val_type:1 -- 6, i16
        0x00, 0x00, 0x00, 0x00 // length:4   -- 0
    ]],

    [[
        ['abc', 1],
        ['def', 2],
        ['ghi', 3]
    ], [
        0x0b,                   // key_type:1 -- 11, string
        0x06,                   // val_type:1 -- 6, i16
        0x00, 0x00, 0x00, 0x03, // length:4   -- 3
                                //            --
        0x00, 0x00, 0x00, 0x03, // str_len:4  -- 3
        0x61, 0x62, 0x63,       // chars      -- "abc"
        0x00, 0x01,             // Int16BE    -- 1
                                //            --
        0x00, 0x00, 0x00, 0x03, // str_len:4  -- 3
        0x64, 0x65, 0x66,       // chars      -- "def"
        0x00, 0x02,             // Int16BE    -- 2
                                //            --
        0x00, 0x00, 0x00, 0x03, // str_len:4  -- 3
        0x67, 0x68, 0x69,       // chars      -- "ghi"
        0x00, 0x03              // Int16BE    -- 3
    ]],

    {
        readTest: {
            bytes: [
                0x09,                  // key_type:1 -- 9
                0x02,                  // val_type:1 -- 2
                0x00, 0x00, 0x00, 0x00 // length:4   -- 0
            ],
            error: {
                type: 'thrift-map-key-typeid-mismatch',
                name: 'ThriftMapKeyTypeidMismatchError',
                message: 'encoded map key typeid 9 doesn\'t match expected ' +
                         'type "string" (id: 11)'
            }
        }
    },

    {
        readTest: {
            bytes: [
                0x0b,                  // key_type:1 -- 11
                0x09,                  // val_type:1 -- 9
                0x00, 0x00, 0x00, 0x00 // length:4   -- 0
            ],
            error: {
                type: 'thrift-map-val-typeid-mismatch',
                name: 'ThriftMapValTypeidMismatchError',
                message: 'encoded map value typeid 9 doesn\'t match expected ' +
                         'type "i16" (id: 6)'
            }
        }
    }

]));

test('invalid map type annotation', function t(assert) {
    try {
        var thriftGraph = new Thrift({
            source: 'struct Graph { 1: required map<byte, byte> (js.type = "bogus") edges }'
        });
        assert.ok(!thriftGraph, 'should not parse');
    } catch (err) {
        assert.equals(err.message, 'unexpected map js.type annotation "bogus"', 'error message');
    }
    assert.end();
});
