# Copyright (c) 2015 Uber Technologies, Inc.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

from __future__ import absolute_import, unicode_literals, print_function

from libc.stdint cimport (
    int8_t,
    int16_t,
    int32_t,
    int64_t,
)


cdef class Value(object):
    pass


cdef class BoolValue(Value):
    cdef readonly bint value


cdef class ByteValue(Value):
    cdef readonly int8_t value


cdef class DoubleValue(Value):
    cdef readonly double value


cdef class I16Value(Value):
    cdef readonly int16_t value


cdef class I32Value(Value):
    cdef readonly int32_t value


cdef class I64Value(Value):
    cdef readonly int64_t value


cdef class BinaryValue(Value):
    cdef readonly char* value

    # a reference to the Python object must be maintained to ensure that the
    # char* doesn't get free-ed
    cdef bytes _value


cdef class FieldValue(object):
    cdef readonly int16_t id
    cdef readonly int8_t ttype
    cdef readonly Value value


cdef class StructValue(Value):
    cdef readonly list fields
    cdef readonly dict _index


cdef class MapItem(object):
    cdef readonly Value key
    cdef readonly Value value


cdef class MapValue(Value):
    cdef readonly int8_t key_ttype
    cdef readonly int8_t value_ttype
    cdef readonly list pairs


cdef class SetValue(Value):
    cdef readonly int8_t value_ttype
    cdef readonly list values


cdef class ListValue(Value):
    cdef readonly int8_t value_ttype
    cdef readonly list values