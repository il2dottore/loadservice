'use strict';

const crypto = require('node:crypto');
const net = require('node:net');
const tls = require('node:tls');
const { Duplex } = require('node:stream');
const { EventEmitter } = require('node:events');

const FRAME = Object.freeze({
    DATA: 0x0,
    HEADERS: 0x1,
    PRIORITY: 0x2,
    RST_STREAM: 0x3,
    SETTINGS: 0x4,
    PUSH_PROMISE: 0x5,
    PING: 0x6,
    GOAWAY: 0x7,
    WINDOW_UPDATE: 0x8,
    CONTINUATION: 0x9
});

const FLAG = Object.freeze({
    END_STREAM: 0x1,
    ACK: 0x1,
    END_HEADERS: 0x4,
    PADDED: 0x8,
    PRIORITY: 0x20
});

const SETTINGS = Object.freeze({
    HEADER_TABLE_SIZE: 0x1,
    ENABLE_PUSH: 0x2,
    MAX_CONCURRENT_STREAMS: 0x3,
    INITIAL_WINDOW_SIZE: 0x4,
    MAX_FRAME_SIZE: 0x5,
    MAX_HEADER_LIST_SIZE: 0x6,
    ENABLE_CONNECT_PROTOCOL: 0x8
});

const CONSTANTS = Object.freeze({
    NGHTTP2_NO_ERROR: 0x0,
    NGHTTP2_PROTOCOL_ERROR: 0x1,
    NGHTTP2_INTERNAL_ERROR: 0x2,
    NGHTTP2_FLOW_CONTROL_ERROR: 0x3,
    NGHTTP2_SETTINGS_TIMEOUT: 0x4,
    NGHTTP2_STREAM_CLOSED: 0x5,
    NGHTTP2_FRAME_SIZE_ERROR: 0x6,
    NGHTTP2_REFUSED_STREAM: 0x7,
    NGHTTP2_CANCEL: 0x8,
    NGHTTP2_COMPRESSION_ERROR: 0x9,
    NGHTTP2_CONNECT_ERROR: 0xa,
    NGHTTP2_ENHANCE_YOUR_CALM: 0xb,
    NGHTTP2_INADEQUATE_SECURITY: 0xc,
    NGHTTP2_HTTP_1_1_REQUIRED: 0xd,

    HTTP2_HEADER_STATUS: ':status',
    HTTP2_HEADER_METHOD: ':method',
    HTTP2_HEADER_PATH: ':path',
    HTTP2_HEADER_AUTHORITY: ':authority',
    HTTP2_HEADER_SCHEME: ':scheme',

    HTTP2_METHOD_GET: 'GET',
    HTTP2_METHOD_POST: 'POST',
    HTTP2_METHOD_PUT: 'PUT',
    HTTP2_METHOD_PATCH: 'PATCH',
    HTTP2_METHOD_DELETE: 'DELETE',
    HTTP2_METHOD_HEAD: 'HEAD',
    HTTP2_METHOD_OPTIONS: 'OPTIONS',
});

const PREFACE = Buffer.from('PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n', 'ascii');
const EMPTY_BUFFER = Buffer.alloc(0);
const DEFAULT_FRAME_SIZE = 16_384;
const MAX_FRAME_SIZE = 0x00ff_ffff;
const DEFAULT_WINDOW_SIZE = 65_535;
const MAX_WINDOW_SIZE = 0x7fff_ffff;
const DEFAULT_HEADER_TABLE_SIZE = 4_096;

const DEFAULT_LOCAL_SETTINGS = Object.freeze({
    [SETTINGS.ENABLE_PUSH]: 0,
    [SETTINGS.INITIAL_WINDOW_SIZE]: 1_048_576
});

const DEFAULT_REMOTE_SETTINGS = Object.freeze({
    [SETTINGS.HEADER_TABLE_SIZE]: DEFAULT_HEADER_TABLE_SIZE,
    [SETTINGS.ENABLE_PUSH]: 0,
    [SETTINGS.INITIAL_WINDOW_SIZE]: DEFAULT_WINDOW_SIZE,
    [SETTINGS.MAX_FRAME_SIZE]: DEFAULT_FRAME_SIZE
});

const FORBIDDEN_HEADERS = new Set([
    'connection',
    'upgrade',
    'keep-alive',
    'proxy-connection',
    'transfer-encoding'
]);

const REQUEST_PSEUDO_HEADERS = new Set([
    ':method',
    ':authority',
    ':scheme',
    ':path',
]);

const SENSITIVE_HEADERS = new Set([
    'authorization',
    'proxy-authorization'
]);

const HEADER_NAME = /^[!#$%&'*+.^_`|~0-9a-z-]+$/;

class Http2Error extends Error {
    constructor(message, code, streamId = 0) {
        super(message);
        this.name = 'Http2Error';
        this.code = code;
        this.streamId = streamId;
    }
}

function toUInt32(value, name) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0 || number > 0xffff_ffff) {
        throw new RangeError(`${name} must be an unsigned 32-bit integer`);
    }
    return number;
}

function validateWindowIncrement(value) {
    const increment = Number(value);
    if (!Number.isInteger(increment) || increment < 1 || increment > MAX_WINDOW_SIZE) {
        throw new RangeError(`WINDOW_UPDATE increment must be between 1 and ${MAX_WINDOW_SIZE}`);
    }
    return increment;
}

function encodeFrameHeader(streamId, type, length, flags = 0) {
    if (!Number.isInteger(length) || length < 0 || length > MAX_FRAME_SIZE) {
        throw new RangeError(`Frame payload exceeds the 24-bit HTTP/2 limit: ${length}`);
    }
    if (!Number.isInteger(streamId) || streamId < 0 || streamId > MAX_WINDOW_SIZE) {
        throw new RangeError('Invalid HTTP/2 stream ID');
    }

    const header = Buffer.allocUnsafe(9);
    header.writeUIntBE(length, 0, 3);
    header.writeUInt8(type & 0xff, 3);
    header.writeUInt8(flags & 0xff, 4);
    header.writeUInt32BE(streamId & MAX_WINDOW_SIZE, 5);
    return header;
}

function encodeFrame(streamId, type, payload = EMPTY_BUFFER, flags = 0) {
    if (!Buffer.isBuffer(payload)) payload = Buffer.from(payload);
    const header = encodeFrameHeader(streamId, type, payload.length, flags);
    return payload.length === 0 ? header : Buffer.concat([header, payload], 9 + payload.length);
}

function decodeFrame(buffer, offset = 0) {
    if (buffer.length - offset < 9) return null;
    const length = buffer.readUIntBE(offset, 3);
    if (buffer.length - offset < length + 9) return null;

    const type = buffer.readUInt8(offset + 3);
    const flags = buffer.readUInt8(offset + 4);
    const streamId = buffer.readUInt32BE(offset + 5) & MAX_WINDOW_SIZE;
    const payloadStart = offset + 9;
    const payloadEnd = payloadStart + length;

    return {
        frame: {
            length,
            type,
            flags,
            streamId,
            payload: buffer.subarray(payloadStart, payloadEnd)
        },
        nextOffset: payloadEnd
    };
}

function encodeSettingsEntries(settings) {
    const entries = normalizeSettingsEntries(settings);
    const payload = Buffer.allocUnsafe(entries.length * 6);
    for (let index = 0; index < entries.length; index += 1) {
        const [id, value] = entries[index];
        payload.writeUInt16BE(id, index * 6);
        payload.writeUInt32BE(value, index * 6 + 2);
    }
    return payload;
}

function normalizeSettingsEntries(settings) {
    const source = Array.isArray(settings)
        ? settings
        : Object.entries(settings || {}).map(([id, value]) => [Number(id), value]);

    return source.map(([rawId, rawValue]) => {
        const id = Number(rawId);
        if (!Number.isInteger(id) || id < 0 || id > 0xffff) {
            throw new RangeError(`Invalid HTTP/2 setting identifier: ${rawId}`);
        }
        return [id, toUInt32(rawValue, `HTTP/2 setting ${id}`)];
    });
}

function decodeSettingsEntries(payload) {
    const entries = [];
    for (let offset = 0; offset < payload.length; offset += 6) {
        entries.push([
            payload.readUInt16BE(offset),
            payload.readUInt32BE(offset + 2)
        ]);
    }
    return entries;
}

function validateSetting(id, value, fromServer = false) {
    switch (id) {
        case SETTINGS.ENABLE_PUSH:
            if (value !== 0 && value !== 1) {
                throw new Http2Error(
                    'SETTINGS_ENABLE_PUSH must be 0 or 1',
                    CONSTANTS.NGHTTP2_PROTOCOL_ERROR
                );
            }
            if (fromServer && value === 1) {
                throw new Http2Error(
                    'A server must not send SETTINGS_ENABLE_PUSH = 1',
                    CONSTANTS.NGHTTP2_PROTOCOL_ERROR
                );
            }
            break;
        case SETTINGS.ENABLE_CONNECT_PROTOCOL:
            if (value !== 0 && value !== 1) {
                throw new Http2Error(
                    'SETTINGS_ENABLE_CONNECT_PROTOCOL must be 0 or 1',
                    CONSTANTS.NGHTTP2_PROTOCOL_ERROR
                );
            }
            break;
        case SETTINGS.INITIAL_WINDOW_SIZE:
            if (value > MAX_WINDOW_SIZE) {
                throw new Http2Error(
                    'SETTINGS_INITIAL_WINDOW_SIZE exceeds 2^31-1',
                    CONSTANTS.NGHTTP2_FLOW_CONTROL_ERROR
                );
            }
            break;
        case SETTINGS.MAX_FRAME_SIZE:
            if (value < DEFAULT_FRAME_SIZE || value > MAX_FRAME_SIZE) {
                throw new Http2Error(
                    'SETTINGS_MAX_FRAME_SIZE is outside the valid range',
                    CONSTANTS.NGHTTP2_PROTOCOL_ERROR
                );
            }
            break;
        default:
            break;
    }
}

function encodeWindowUpdate(streamId, increment) {
    const value = validateWindowIncrement(increment);
    const payload = Buffer.allocUnsafe(4);
    payload.writeUInt32BE(value, 0);
    return encodeFrame(streamId, FRAME.WINDOW_UPDATE, payload);
}

function encodePriorityPayload(priority = {}) {
    const dependency = Number(priority.stream_dependency ?? priority.parent ?? 0);
    if (!Number.isInteger(dependency) || dependency < 0 || dependency > MAX_WINDOW_SIZE) {
        throw new RangeError('Invalid priority stream dependency');
    }
    const weight = Math.max(1, Math.min(256, Number(priority.weight ?? 16)));
    if (!Number.isFinite(weight)) throw new RangeError('Invalid priority weight');

    const payload = Buffer.allocUnsafe(5);
    const exclusive = priority.exclusive ? 0x8000_0000 : 0;
    payload.writeUInt32BE((dependency | exclusive) >>> 0, 0);
    payload.writeUInt8(Math.round(weight) - 1, 4);
    return payload;
}

function encodePriority(streamId, priority = {}) {
    const dependency = Number(priority.stream_dependency ?? priority.parent ?? 0);
    if (dependency === streamId) {
        throw new RangeError('A stream cannot depend on itself');
    }
    return encodeFrame(streamId, FRAME.PRIORITY, encodePriorityPayload(priority));
}

function encodeRstStream(streamId, errorCode) {
    const payload = Buffer.allocUnsafe(4);
    payload.writeUInt32BE(toUInt32(errorCode, 'RST_STREAM error code'), 0);
    return encodeFrame(streamId, FRAME.RST_STREAM, payload);
}

function encodeGoaway(lastStreamId, errorCode, debugData = EMPTY_BUFFER) {
    const debug = Buffer.isBuffer(debugData) ? debugData : Buffer.from(String(debugData));
    const payload = Buffer.allocUnsafe(8 + debug.length);
    payload.writeUInt32BE(lastStreamId & MAX_WINDOW_SIZE, 0);
    payload.writeUInt32BE(toUInt32(errorCode, 'GOAWAY error code'), 4);
    debug.copy(payload, 8);
    return encodeFrame(0, FRAME.GOAWAY, payload);
}

function parsePaddedPayload(frame, extraPrefixLength = 0) {
    let offset = 0;
    let end = frame.payload.length;

    if (frame.flags & FLAG.PADDED) {
        if (frame.payload.length === 0) {
            throw new Http2Error('PADDED frame has no Pad Length field', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
        }
        const padding = frame.payload.readUInt8(0);
        offset = 1;
        end -= padding;
        if (end < offset) {
            throw new Http2Error('Padding exceeds frame payload', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
        }
    }

    offset += extraPrefixLength;
    if (offset > end) {
        throw new Http2Error('Frame payload is shorter than its declared prefix', CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR);
    }

    return frame.payload.subarray(offset, end);
}

function getHeaderFragment(frame) {
    if (frame.type === FRAME.CONTINUATION) return frame.payload;
    if (frame.type === FRAME.PUSH_PROMISE) return parsePaddedPayload(frame, 4);
    const priorityLength = frame.flags & FLAG.PRIORITY ? 5 : 0;
    return parsePaddedPayload(frame, priorityLength);
}

function getHeadersPriorityDependency(frame) {
    if (frame.type !== FRAME.HEADERS || !(frame.flags & FLAG.PRIORITY)) return null;
    let offset = 0;
    let end = frame.payload.length;
    if (frame.flags & FLAG.PADDED) {
        if (frame.payload.length === 0) {
            throw new Http2Error('PADDED HEADERS frame has no Pad Length field', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
        }
        const padding = frame.payload.readUInt8(0);
        offset = 1;
        end -= padding;
        if (end < offset) {
            throw new Http2Error('Padding exceeds HEADERS payload', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
        }
    }
    if (offset + 5 > end) {
        throw new Http2Error('HEADERS priority section is incomplete', CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR);
    }
    return frame.payload.readUInt32BE(offset) & MAX_WINDOW_SIZE;
}

function getPromisedStreamId(frame) {
    if (frame.type !== FRAME.PUSH_PROMISE) return null;
    let offset = 0;
    let end = frame.payload.length;
    if (frame.flags & FLAG.PADDED) {
        if (frame.payload.length === 0) {
            throw new Http2Error('PADDED PUSH_PROMISE frame has no Pad Length field', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
        }
        const padding = frame.payload.readUInt8(0);
        offset = 1;
        end -= padding;
        if (end < offset) {
            throw new Http2Error('Padding exceeds PUSH_PROMISE payload', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
        }
    }
    if (offset + 4 > end) {
        throw new Http2Error('PUSH_PROMISE payload is too short', CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR);
    }
    return frame.payload.readUInt32BE(offset) & MAX_WINDOW_SIZE;
}

function getDataPayload(frame) {
    return parsePaddedPayload(frame, 0);
}

function assertValidHeaderText(name, value) {
    if (
        !name ||
        (!name.startsWith(':') && !HEADER_NAME.test(name)) ||
        name.includes('\0') ||
        value.includes('\0') ||
        value.includes('\r') ||
        value.includes('\n')
    ) {
        throw new TypeError(`Invalid HTTP/2 header: ${name}`);
    }
}

function normalizeHeaders(headers) {
    const pairs = [];
    for (const [rawName, rawValue] of Object.entries(headers || {})) {
        if (rawValue === undefined || rawValue === null) continue;
        const name = String(rawName).toLowerCase();
        const values = Array.isArray(rawValue) ? rawValue : [rawValue];
        for (const rawItem of values) {
            const value = String(rawItem);
            assertValidHeaderText(name, value);
            pairs.push([name, value]);
        }
    }
    return pairs;
}

function prepareRequestHeaders(authority, headers, sensitiveHeaders = SENSITIVE_HEADERS) {
    const normalized = normalizeHeaders(headers);
    const pseudo = new Map();
    const regular = [];
    let sawRegular = false;

    for (const [name, value] of normalized) {
        if (name.startsWith(':')) {
            if (!REQUEST_PSEUDO_HEADERS.has(name)) {
                throw new TypeError(`Invalid HTTP/2 request pseudo-header: ${name}`);
            }
            if (sawRegular || pseudo.has(name)) {
                throw new TypeError(`Duplicate or misplaced HTTP/2 pseudo-header: ${name}`);
            }

            pseudo.set(name, value);
            continue;
        }
        if (FORBIDDEN_HEADERS.has(name)) continue;
        // Ignore TE header if not trailers.
        if (name === 'te' && value.trim().toLowerCase() !== 'trailers') continue;
        sawRegular = true;
        regular.push([name, value]);
    }

    const method = pseudo.get(CONSTANTS.HTTP2_HEADER_METHOD);
    const isConnect = method === 'CONNECT';
    if (!method) {
        throw new TypeError('HTTP/2 request requires a :method pseudo-header');
    }
    if (!pseudo.has(CONSTANTS.HTTP2_HEADER_AUTHORITY) && authority?.host) {
        pseudo.set(CONSTANTS.HTTP2_HEADER_AUTHORITY, authority.host);
    }
    if (!pseudo.has(CONSTANTS.HTTP2_HEADER_AUTHORITY)) {
        throw new TypeError('HTTP/2 request requires a :authority pseudo-header');
    }
    if (isConnect) {
        if (pseudo.has(CONSTANTS.HTTP2_HEADER_SCHEME) || pseudo.has(CONSTANTS.HTTP2_HEADER_PATH)) {
            throw new TypeError('CONNECT requests must not include :scheme or :path');
        }
    } else if (
        !pseudo.has(CONSTANTS.HTTP2_HEADER_SCHEME) ||
        !pseudo.has(CONSTANTS.HTTP2_HEADER_PATH) ||
        pseudo.get(CONSTANTS.HTTP2_HEADER_PATH) === ''
    ) {
        throw new TypeError('HTTP/2 request requires :scheme and :path pseudo-headers');
    }

    const output = [];
    for (const name of pseudo.keys()) {
        if (pseudo.has(name)) output.push({ name, value: pseudo.get(name), incremental: false });
    }

    for (const [name, value] of regular) {
        output.push({
            name,
            value,
            neverIndex: sensitiveHeaders.has(name)
        });
    }
    return output;
}

function headersArrayToObject(headers) {
    const result = Object.create(null);
    for (const [name, value] of headers) {
        if (result[name] === undefined) {
            result[name] = value;
        } else if (Array.isArray(result[name])) {
            result[name].push(value);
        } else {
            result[name] = [result[name], value];
        }
    }
    return result;
}

function validateResponseHeaders(pairs, trailers, maxHeaderListSize) {
    let sawRegular = false;
    let statusCount = 0;
    let fieldSectionSize = 0;

    for (const [name, value] of pairs) {
        fieldSectionSize += Buffer.byteLength(name) + Buffer.byteLength(value) + 32;
        if (fieldSectionSize > maxHeaderListSize) {
            throw new Http2Error(
                'Response header list exceeds the configured limit',
                CONSTANTS.NGHTTP2_ENHANCE_YOUR_CALM
            );
        }
        if (name !== name.toLowerCase()) {
            throw new Http2Error('Uppercase response header name', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
        }
        assertValidHeaderText(name, value);

        if (name.startsWith(':')) {
            if (trailers || sawRegular || name !== ':status') {
                throw new Http2Error('Invalid response pseudo-header', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
            }
            statusCount += 1;
        } else {
            sawRegular = true;
            if (FORBIDDEN_HEADERS.has(name)) {
                throw new Http2Error('Connection-specific response header', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
            }
            if (name === 'te' && value.trim().toLowerCase() !== 'trailers') {
                throw new Http2Error('Invalid TE response header', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
            }
        }
    }

    if (!trailers && statusCount !== 1) {
        throw new Http2Error('A response must contain exactly one :status', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
    }
    if (trailers && statusCount !== 0) {
        throw new Http2Error('Trailers must not contain pseudo-headers', CONSTANTS.NGHTTP2_PROTOCOL_ERROR);
    }
}

function validateConfiguredLimit(value, name, { allowInfinity = false, min = 0 } = {}) {
    const number = Number(value);
    if (
        (allowInfinity && number === Number.POSITIVE_INFINITY) ||
        (Number.isSafeInteger(number) && number >= min)
    ) {
        return number;
    }
    throw new RangeError(`${name} must be ${allowInfinity ? 'a non-negative safe integer or Infinity' : `a safe integer greater than or equal to ${min}`}`);
}

function drainReadable(readable) {
    const chunks = [];
    let chunk;
    while ((chunk = readable.read()) !== null) chunks.push(chunk);
    if (chunks.length === 0) return EMPTY_BUFFER;
    if (chunks.length === 1) return Buffer.from(chunks[0]);
    return Buffer.concat(chunks.map(item => Buffer.from(item)));
}

function createHpackCodec(options = {}) {
    if (options.hpackCodec) {
        const codec = options.hpackCodec;
        if (typeof codec.encode !== 'function' || typeof codec.decode !== 'function') {
            throw new TypeError('options.hpackCodec must provide encode() and decode()');
        }
        return codec;
    }

    let hpack;
    try {
        hpack = require('hpack.js');
    } catch (error) {
        const wrapped = new Error(
            'Missing dependency "hpack.js". Install it with: npm install hpack.js'
        );
        wrapped.cause = error;
        throw wrapped;
    }

    const encoderMax = options.remoteHeaderTableSize ?? DEFAULT_HEADER_TABLE_SIZE;
    const decoderMax = options.localHeaderTableSize ?? DEFAULT_HEADER_TABLE_SIZE;
    const compressor = hpack.compressor.create({ table: { maxSize: encoderMax } });
    const decompressor = hpack.decompressor.create({ table: { maxSize: decoderMax } });

    return {
        encode(headers) {
            let streamError = null;
            const onError = error => { streamError = error; };
            compressor.once('error', onError);
            compressor.write(headers);
            compressor.removeListener('error', onError);
            if (streamError) throw streamError;
            return drainReadable(compressor);
        },

        decode(block, maxHeaderListSize = Number.POSITIVE_INFINITY) {
            let streamError = null;
            let fieldSectionSize = 0;
            let limitExceeded = false;
            const originalPush = decompressor.push;
            const enforceLimit = Number.isFinite(maxHeaderListSize);
            const onError = error => { streamError = error; };

            if (enforceLimit) {
                decompressor.push = function pushWithLimit(field) {
                    if (field && typeof field === 'object') {
                        const name = String(field.name);
                        const value = String(field.value);
                        const fieldSize = Buffer.byteLength(name) + Buffer.byteLength(value) + 32;
                        if (limitExceeded || fieldSectionSize + fieldSize > maxHeaderListSize) {
                            limitExceeded = true;
                            // Continue decoding to preserve HPACK state, but do not
                            // retain additional fields in the readable buffer.
                            return true;
                        }
                        fieldSectionSize += fieldSize;
                    }
                    return originalPush.call(this, field);
                };
            }

            decompressor.once('error', onError);
            try {
                decompressor.write(block);
                decompressor.execute();
            } finally {
                decompressor.removeListener('error', onError);
                if (enforceLimit) decompressor.push = originalPush;
            }
            if (streamError) throw streamError;

            const headers = [];
            let field;
            while ((field = decompressor.read()) !== null) {
                headers.push([String(field.name), String(field.value)]);
            }
            if (limitExceeded) {
                throw new Http2Error(
                    'Response header list exceeds the configured limit',
                    CONSTANTS.NGHTTP2_ENHANCE_YOUR_CALM
                );
            }
            return headers;
        },

        setEncoderMaxTableSize(size) {
            // hpack.js does not expose a public setter for the peer-advertised
            // maximum. Keep the version-specific access isolated here.
            if (!compressor._table || typeof compressor.updateTableSize !== 'function') {
                throw new Error('The configured hpack.js version does not support encoder table-size updates');
            }
            compressor._table.protocolMaxSize = size;
            compressor.updateTableSize(size);
        },

        setDecoderMaxTableSize(size) {
            if (!decompressor._table || typeof decompressor.updateTableSize !== 'function') {
                throw new Error('The configured hpack.js version does not support decoder table-size updates');
            }
            decompressor._table.protocolMaxSize = size;
            if (decompressor._table.maxSize > size) decompressor.updateTableSize(size);
        }
    };
}

function makeStreamError(message, code, streamId) {
    return new Http2Error(message, code, streamId);
}

class ClientHttp2Stream extends Duplex {
    constructor(session, id, headers, options = {}) {
        super({
            allowHalfOpen: true,
            emitClose: true,
            readableHighWaterMark: options.readableHighWaterMark,
            writableHighWaterMark: options.writableHighWaterMark
        });

        this.session = session;
        this.id = id;
        this.options = options;
        this.requestHeaders = prepareRequestHeaders(
            session.authority,
            headers,
            session.sensitiveHeaders
        );

        this.sentHeaders = false;
        this.sentEnd = false;
        this.receivedEnd = false;
        this.rstCode = CONSTANTS.NGHTTP2_NO_ERROR;
        this.aborted = false;

        this.sendWindow = session.remoteSettings[SETTINGS.INITIAL_WINDOW_SIZE];
        this.receiveWindow = session._effectiveLocalSettings[SETTINGS.INITIAL_WINDOW_SIZE] ?? DEFAULT_WINDOW_SIZE;
        this.pendingReceiveCredit = 0;
        this.uncreditedFlowBytes = 0;

        this.pendingPriority = options.priority ? { ...options.priority } : null;
        this.pendingWindowUpdate = options.windowUpdate
            ? validateWindowIncrement(options.windowUpdate)
            : 0;

        this.responseHeaders = null;
        this.responseTrailers = null;
        this.headerFragments = [];
        this.headerBlockLength = 0;
        this.headerBlockEndStream = false;
        this.headerBlockFlags = 0;
        this.headerBlockError = null;

        this._writeItem = null;
        this._endingRequested = Boolean(options.endStream);
        this._finalCallback = null;
        this._flushing = false;
        this._normalClose = false;
        this._rstSent = false;
        this._rstReceived = false;
        this._sessionDestroying = false;
        this._outboundBlocked = false;

        // Stream failures are observable through the normal error event, but
        // an omitted listener must not crash the hosting process.
        this.on('error', () => { });
    }

    _read() {
        this._grantInboundCredit(false);
    }

    _write(chunk, encoding, callback) {
        if (this.sentEnd || this._endingRequested || this.destroyed) {
            callback(makeStreamError(
                'Cannot write after END_STREAM',
                CONSTANTS.NGHTTP2_STREAM_CLOSED,
                this.id
            ));
            return;
        }

        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
        if (buffer.length === 0) {
            callback();
            return;
        }

        this._writeItem = { buffer, offset: 0, callback };
        this._flushOutbound();
    }

    _final(callback) {
        if (this.sentEnd || this.destroyed) {
            callback();
            return;
        }
        this._endingRequested = true;
        this._finalCallback = callback;
        this._flushOutbound();
    }

    _destroy(error, callback) {
        const destroyError = error || makeStreamError(
            'HTTP/2 stream destroyed',
            this.rstCode || CONSTANTS.NGHTTP2_CANCEL,
            this.id
        );

        if (
            !this._normalClose &&
            !this._rstSent &&
            !this._rstReceived &&
            !this._sessionDestroying &&
            this.sentHeaders &&
            this.session._canWrite()
        ) {
            this.rstCode = this.rstCode || CONSTANTS.NGHTTP2_CANCEL;
            this._rstSent = true;
            this.session._writeFrame(encodeRstStream(this.id, this.rstCode));
        }

        if (this._writeItem) {
            const item = this._writeItem;
            this._writeItem = null;
            process.nextTick(item.callback, destroyError);
        }
        if (this._finalCallback) {
            const finalCallback = this._finalCallback;
            this._finalCallback = null;
            process.nextTick(finalCallback, destroyError);
        }

        this._releaseInboundConnectionCredit();
        this._clearOutboundBlocked();
        this.session._deleteStream(this.id);
        callback(error);
    }

    priority(priority) {
        if (this.destroyed) return this;
        if (!this.sentHeaders) {
            this.pendingPriority = { ...priority };
        } else {
            this.session._writeFrame(encodePriority(this.id, priority));
        }
        return this;
    }

    windowUpdate(increment) {
        if (this.destroyed) return this;
        const value = validateWindowIncrement(increment);
        const pendingSettingsDelta = this.session._pendingLocalInitialWindowDelta();
        if (this.receiveWindow + value + pendingSettingsDelta > MAX_WINDOW_SIZE) {
            throw new RangeError('Stream receive window would exceed 2^31-1 after pending SETTINGS');
        }

        if (!this.sentHeaders) {
            if (this.receiveWindow + this.pendingWindowUpdate + value + pendingSettingsDelta > MAX_WINDOW_SIZE) {
                throw new RangeError('Pending stream receive window would exceed 2^31-1 after pending SETTINGS');
            }
            this.pendingWindowUpdate += value;
        } else {
            this.receiveWindow += value;
            this.session._writeFrame(encodeWindowUpdate(this.id, value));
        }
        return this;
    }

    close(code = CONSTANTS.NGHTTP2_NO_ERROR, callback) {
        if (typeof callback === 'function') this.once('close', callback);
        if (this.destroyed) return this;

        this.rstCode = toUInt32(code, 'RST_STREAM error code');
        if (this.sentHeaders && this.session._canWrite()) {
            this._rstSent = true;
            this.session._writeFrame(encodeRstStream(this.id, this.rstCode));
        }

        const error = this.rstCode === CONSTANTS.NGHTTP2_NO_ERROR
            ? undefined
            : makeStreamError('HTTP/2 stream closed locally', this.rstCode, this.id);
        this.destroy(error);
        return this;
    }

    _flushOutbound() {
        if (this._flushing || this.destroyed || !this.session._readyToSend()) return;
        this._flushing = true;

        try {
            if (!this.sentHeaders) {
                const endOnHeaders = this._endingRequested && !this._writeItem;
                const block = this.session._hpack.encode(this.requestHeaders);
                this.session._sendHeaderBlock(
                    this.id,
                    block,
                    endOnHeaders,
                    this.pendingPriority
                );
                this.sentHeaders = true;
                this.pendingPriority = null;
                this._flushPendingControlFrames();

                if (endOnHeaders) {
                    this._completeLocalEnd();
                    return;
                }
            }

            if (this._writeItem) {
                const item = this._writeItem;
                while (item.offset < item.buffer.length) {
                    const available = Math.min(
                        this.sendWindow,
                        this.session.sendConnectionWindow,
                        this.session.remoteSettings[SETTINGS.MAX_FRAME_SIZE],
                        this.session._availableDataPayloadCapacity()
                    );
                    if (available <= 0) {
                        this._markOutboundBlocked();
                        return;
                    }

                    const remaining = item.buffer.length - item.offset;
                    const size = Math.min(remaining, available);
                    const payload = item.buffer.subarray(item.offset, item.offset + size);
                    item.offset += size;
                    this.sendWindow -= size;
                    this.session.sendConnectionWindow -= size;
                    this.session._writeDataFrame(this.id, payload);
                }

                this._writeItem = null;
                this._clearOutboundBlocked();
                process.nextTick(item.callback);
                return;
            }

            this._clearOutboundBlocked();
            if (this._endingRequested && !this.sentEnd) {
                this.session._writeFrame(encodeFrame(
                    this.id,
                    FRAME.DATA,
                    EMPTY_BUFFER,
                    FLAG.END_STREAM
                ));
                this._completeLocalEnd();
            }
        } catch (error) {
            this.destroy(error);
        } finally {
            this._flushing = false;
        }
    }

    _completeLocalEnd() {
        if (this.sentEnd) return;
        this._clearOutboundBlocked();
        this.sentEnd = true;
        this._endingRequested = false;
        if (this._finalCallback) {
            const callback = this._finalCallback;
            this._finalCallback = null;
            process.nextTick(callback);
        }
        this._maybeCloseNormally();
    }

    _flushPendingControlFrames() {
        if (this.pendingWindowUpdate > 0) {
            this.receiveWindow += this.pendingWindowUpdate;
            this.session._writeFrame(encodeWindowUpdate(this.id, this.pendingWindowUpdate));
            this.pendingWindowUpdate = 0;
        }
    }

    _handleWindowUpdate(increment) {
        if (this.sendWindow + increment > MAX_WINDOW_SIZE) {
            this._streamError(
                CONSTANTS.NGHTTP2_FLOW_CONTROL_ERROR,
                'Stream send window overflow'
            );
            return;
        }
        this.sendWindow += increment;
        this._flushOutbound();
    }

    _handleHeaders(frame) {
        if (frame.type === FRAME.HEADERS) {
            this.headerFragments = [];
            this.headerBlockLength = 0;
            this.headerBlockEndStream = Boolean(frame.flags & FLAG.END_STREAM);
            this.headerBlockFlags = frame.flags;
            this.headerBlockError = null;

            if (this.receivedEnd) {
                this.headerBlockError = {
                    code: CONSTANTS.NGHTTP2_STREAM_CLOSED,
                    message: 'HEADERS on a closed remote side'
                };
            } else if (this.responseTrailers !== null) {
                this.headerBlockError = {
                    code: CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                    message: 'HEADERS after response trailers'
                };
            } else if (this.responseHeaders !== null && !(frame.flags & FLAG.END_STREAM)) {
                this.headerBlockError = {
                    code: CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                    message: 'Response trailers must set END_STREAM'
                };
            }

            try {
                const dependency = getHeadersPriorityDependency(frame);
                if (dependency === this.id) {
                    this.headerBlockError = {
                        code: CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                        message: 'A stream cannot depend on itself'
                    };
                }
            } catch (error) {
                this.session._connectionError(
                    error.code || CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR,
                    error.message
                );
                return;
            }
        }

        let fragment;
        try {
            fragment = getHeaderFragment(frame);
        } catch (error) {
            this.session._connectionError(
                error.code || CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR,
                error.message
            );
            return;
        }

        this.headerFragments.push(fragment);
        this.headerBlockLength += fragment.length;
        if (this.headerBlockLength > this.session.maxHeaderBlockBytes) {
            this.session._connectionError(
                CONSTANTS.NGHTTP2_ENHANCE_YOUR_CALM,
                'Compressed header block exceeds configured limit'
            );
            return;
        }

        if (!(frame.flags & FLAG.END_HEADERS)) return;

        const block = this.headerFragments.length === 1
            ? this.headerFragments[0]
            : Buffer.concat(this.headerFragments, this.headerBlockLength);
        const blockFlags = this.headerBlockFlags;
        const blockEndStream = this.headerBlockEndStream;
        const blockError = this.headerBlockError;

        this.headerFragments = [];
        this.headerBlockLength = 0;
        this.headerBlockFlags = 0;
        this.headerBlockEndStream = false;
        this.headerBlockError = null;

        let pairs;
        try {
            pairs = this.session._hpack.decode(block, this.session.maxHeaderListSize);
        } catch (error) {
            if (error instanceof Http2Error && error.code === CONSTANTS.NGHTTP2_ENHANCE_YOUR_CALM) {
                this._streamError(error.code, error.message);
            } else {
                this.session._connectionError(
                    CONSTANTS.NGHTTP2_COMPRESSION_ERROR,
                    `HPACK decode failed: ${error.message}`
                );
            }
            return;
        }

        // Even an invalid or already-closed stream must have its field block
        // decompressed so that the connection-wide HPACK state remains aligned.
        if (blockError) {
            this._streamError(blockError.code, blockError.message);
            return;
        }

        const trailers = this.responseHeaders !== null;
        try {
            validateResponseHeaders(pairs, trailers, this.session.maxHeaderListSize);
        } catch (error) {
            this._streamError(error.code || CONSTANTS.NGHTTP2_PROTOCOL_ERROR, error.message);
            return;
        }

        const headers = headersArrayToObject(pairs);
        if (!trailers) {
            const rawStatus = headers[':status'];
            if (typeof rawStatus !== 'string' || !/^[1-5][0-9]{2}$/.test(rawStatus)) {
                this._streamError(CONSTANTS.NGHTTP2_PROTOCOL_ERROR, 'Invalid HTTP/2 response status');
                return;
            }
            const status = Number(rawStatus);
            if (status >= 100 && status < 200) {
                if (blockEndStream) {
                    this._streamError(
                        CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                        'Informational response headers must not set END_STREAM'
                    );
                    return;
                }
                this.emit('headers', headers, blockFlags, pairs.flat());
            } else {
                this.responseHeaders = headers;
                this.emit('response', headers, blockFlags, pairs.flat());
            }
        } else {
            this.responseTrailers = headers;
            this.emit('trailers', headers, blockFlags, pairs.flat());
        }

        if (blockEndStream) this._handleRemoteEnd();
    }

    _handleData(frame) {
        // DATA always consumes connection-level flow-control credit, including
        // DATA that is subsequently discarded because the stream is closed.
        this.session.receiveConnectionWindow -= frame.length;
        if (this.session.receiveConnectionWindow < 0) {
            this.session._connectionError(
                CONSTANTS.NGHTTP2_FLOW_CONTROL_ERROR,
                'Connection receive window exceeded'
            );
            return;
        }

        if (this.receivedEnd) {
            this.session._acknowledgeConnectionInbound(frame.length, true);
            this._streamError(CONSTANTS.NGHTTP2_STREAM_CLOSED, 'DATA on a closed remote side');
            return;
        }

        this.receiveWindow -= frame.length;
        if (this.receiveWindow < 0) {
            this.session._acknowledgeConnectionInbound(frame.length, true);
            this._streamError(
                CONSTANTS.NGHTTP2_FLOW_CONTROL_ERROR,
                'Stream receive window exceeded'
            );
            return;
        }

        if (this.responseHeaders === null) {
            this.session._acknowledgeConnectionInbound(frame.length, true);
            this._streamError(CONSTANTS.NGHTTP2_PROTOCOL_ERROR, 'DATA received before final response headers');
            return;
        }

        let data;
        try {
            data = getDataPayload(frame);
        } catch (error) {
            this.session._connectionError(error.code, error.message);
            return;
        }

        if (data.length === 0) {
            this.session._acknowledgeInbound(this, frame.length, false);
        } else {
            const wantsMore = this.push(data);
            if (wantsMore) {
                this.session._acknowledgeInbound(this, frame.length, false);
            } else {
                this.uncreditedFlowBytes += frame.length;
            }
        }

        if (frame.flags & FLAG.END_STREAM) this._handleRemoteEnd();
    }

    _grantInboundCredit(force) {
        if (this.uncreditedFlowBytes === 0) return;
        const amount = this.uncreditedFlowBytes;
        this.uncreditedFlowBytes = 0;
        this.session._acknowledgeInbound(this, amount, force);
    }

    _releaseInboundConnectionCredit() {
        const amount = this.uncreditedFlowBytes;
        this.uncreditedFlowBytes = 0;
        if (
            amount <= 0 ||
            this._sessionDestroying ||
            this.session.destroyed ||
            this.session._connectionErrorStarted
        ) {
            return;
        }
        this.session._acknowledgeConnectionInbound(amount, true);
    }

    _markOutboundBlocked() {
        if (this._outboundBlocked || this.destroyed) return;
        this._outboundBlocked = true;
        this.session._blockedStreams.add(this);
    }

    _clearOutboundBlocked() {
        if (!this._outboundBlocked) return;
        this._outboundBlocked = false;
        this.session._blockedStreams.delete(this);
    }

    _handleRemoteEnd() {
        if (this.receivedEnd) return;
        this.receivedEnd = true;
        this._grantInboundCredit(true);
        this.push(null);
        this._maybeCloseNormally();
    }

    _handleReset(errorCode) {
        if (this.destroyed) return;
        this.rstCode = errorCode;
        this._rstReceived = true;
        this.aborted = errorCode !== CONSTANTS.NGHTTP2_NO_ERROR;
        if (!this.receivedEnd) this.push(null);
        if (this.aborted) this.emit('aborted');

        const error = errorCode === CONSTANTS.NGHTTP2_NO_ERROR
            ? undefined
            : makeStreamError(
                `Stream reset by peer with error code ${errorCode}`,
                errorCode,
                this.id
            );
        this.destroy(error);
    }

    _streamError(code, message) {
        if (this.destroyed) return;
        this.rstCode = code;
        if (this.sentHeaders && this.session._canWrite()) {
            this._rstSent = true;
            this.session._writeFrame(encodeRstStream(this.id, code));
        }
        this.destroy(makeStreamError(message, code, this.id));
    }

    _maybeCloseNormally() {
        if (!this.sentEnd || !this.receivedEnd || this.destroyed) return;
        this._normalClose = true;
        this.destroy();
    }
}

class ClientHttp2Session extends EventEmitter {
    constructor(authority, options = {}, listener) {
        super();

        this.authority = typeof authority === 'string' ? new URL(authority) : authority;
        if (!this.authority || this.authority.protocol !== 'https:') {
            throw new Error('Only https:// authorities are supported');
        }

        this.options = options;
        this.closed = false;
        this.destroyed = false;
        this.connecting = true;
        this.goawayReceived = false;
        this.goawaySent = false;
        this.lastPeerStreamId = 0;

        this.streams = new Map();
        this.nextStreamId = Number(options.initialStreamId ?? 1);
        if (!Number.isInteger(this.nextStreamId) || this.nextStreamId < 1 || this.nextStreamId > MAX_WINDOW_SIZE) {
            throw new RangeError('initialStreamId must be a positive 31-bit integer');
        }
        if ((this.nextStreamId & 1) === 0) this.nextStreamId += 1;
        if (this.nextStreamId > MAX_WINDOW_SIZE) {
            throw new RangeError('initialStreamId must resolve to an odd 31-bit integer');
        }

        this.localSettings = {
            ...DEFAULT_LOCAL_SETTINGS,
            ...(options.settings || {})
        };
        for (const [id, value] of normalizeSettingsEntries(this.localSettings)) {
            validateSetting(id, value, false);
            if (id === SETTINGS.ENABLE_PUSH && value !== 0) {
                throw new Error('This client does not implement server push; ENABLE_PUSH must remain 0');
            }
        }

        // Settings advertised by this client do not become safe to enforce
        // against peer frames until the corresponding SETTINGS ACK arrives.
        this._effectiveLocalSettings = {
            [SETTINGS.HEADER_TABLE_SIZE]: DEFAULT_HEADER_TABLE_SIZE,
            [SETTINGS.ENABLE_PUSH]: 1,
            [SETTINGS.INITIAL_WINDOW_SIZE]: DEFAULT_WINDOW_SIZE,
            [SETTINGS.MAX_FRAME_SIZE]: DEFAULT_FRAME_SIZE
        };

        this.remoteSettings = { ...DEFAULT_REMOTE_SETTINGS };
        this.sendConnectionWindow = DEFAULT_WINDOW_SIZE;
        this.receiveConnectionWindow = DEFAULT_WINDOW_SIZE;
        this.pendingConnectionReceiveCredit = 0;

        // SETTINGS_INITIAL_WINDOW_SIZE controls per-stream flow control only.
        // The connection-level receive window always starts at 65,535 and must
        // be increased independently with connectionWindowSize/windowUpdate().
        const requestedConnectionWindow = validateConfiguredLimit(
            options.connectionWindowSize ?? DEFAULT_WINDOW_SIZE,
            'connectionWindowSize',
            { min: 1 }
        );
        this.connectionWindowTarget = Math.max(
            DEFAULT_WINDOW_SIZE,
            Math.min(MAX_WINDOW_SIZE, requestedConnectionWindow)
        );

        this.autoWindowUpdate = options.autoWindowUpdate !== false;
        this.maxHeaderBlockBytes = validateConfiguredLimit(
            options.maxHeaderBlockBytes ?? 16 * 1024 * 1024,
            'maxHeaderBlockBytes',
            { min: 1 }
        );
        this.maxHeaderListSize = validateConfiguredLimit(
            options.maxHeaderListSize ??
            this.localSettings[SETTINGS.MAX_HEADER_LIST_SIZE] ??
            Number.POSITIVE_INFINITY,
            'maxHeaderListSize',
            { allowInfinity: true }
        );

        this.sensitiveHeaders = new Set([
            ...SENSITIVE_HEADERS,
            ...Array.from(options.sensitiveHeaders || [], name => String(name).toLowerCase())
        ]);

        this._hpack = createHpackCodec({
            hpackCodec: options.hpackCodec,
            remoteHeaderTableSize: this.remoteSettings[SETTINGS.HEADER_TABLE_SIZE],
            localHeaderTableSize: this._effectiveLocalSettings[SETTINGS.HEADER_TABLE_SIZE]
        });

        this._buffer = EMPTY_BUFFER;
        this._bufferOffset = 0;
        this._writeQueue = [];
        this._writeQueueHead = 0;
        this._writeQueueBytes = 0;
        this.maxQueuedWriteBytes = validateConfiguredLimit(
            options.maxQueuedWriteBytes ?? 16 * 1024 * 1024,
            'maxQueuedWriteBytes',
            { allowInfinity: true, min: DEFAULT_FRAME_SIZE + 9 }
        );
        this._blockedStreams = new Set();
        this._socketBlocked = false;
        this._endAfterFlush = false;
        this._receivedFirstFrame = false;
        this._continuationStreamId = null;
        this._continuationStream = null;
        this._discardedHeaderBlock = null;
        this._pendingSettingsAcks = [];
        this._enablePushAcknowledged = false;
        this._lastPromisedStreamId = 0;
        this._closedServerStreams = new Set();
        this._pendingPings = new Map();
        this._closeEmitted = false;
        this._connectionErrorStarted = false;

        // A transport failure must not turn into an uncaught EventEmitter
        // exception merely because an application did not add an error listener.
        this.on('error', () => { });

        this.socket = typeof options.createConnection === 'function'
            ? options.createConnection(this.authority, options)
            : this._createTlsSocket(options);

        if (!this.socket || typeof this.socket.write !== 'function') {
            throw new Error('createConnection() must return a Duplex socket');
        }
        if (typeof listener === 'function') this.once('connect', listener);
        this._bindSocket();
    }

    _createTlsSocket(options) {
        const tlsOptions = {
            ...(options.tls || {}),
            host: this.authority.hostname,
            port: Number(this.authority.port || 443),
            ALPNProtocols: ['h2']
        };

        if (options.rejectUnauthorized !== undefined) {
            tlsOptions.rejectUnauthorized = options.rejectUnauthorized;
        } else if (tlsOptions.rejectUnauthorized === undefined) {
            tlsOptions.rejectUnauthorized = true;
        }
        if (options.ca !== undefined) tlsOptions.ca = options.ca;
        if (options.cert !== undefined) tlsOptions.cert = options.cert;
        if (options.key !== undefined) tlsOptions.key = options.key;

        if (options.servername !== undefined) {
            tlsOptions.servername = options.servername;
        } else if (tlsOptions.servername === undefined && !net.isIP(this.authority.hostname)) {
            tlsOptions.servername = this.authority.hostname;
        }
        return tls.connect(tlsOptions);
    }

    request(headers = {}, options = {}) {
        if (this.closed || this.destroyed || this.goawayReceived) {
            throw new Error('The HTTP/2 session is closed');
        }

        const maxConcurrent = this.remoteSettings[SETTINGS.MAX_CONCURRENT_STREAMS];
        if (maxConcurrent !== undefined && this.streams.size >= maxConcurrent) {
            throw new Error(`Remote peer allows only ${maxConcurrent} concurrent streams`);
        }
        if (this.nextStreamId > MAX_WINDOW_SIZE) {
            this.close();
            throw new Error('HTTP/2 stream ID space exhausted');
        }

        const streamId = this.nextStreamId;
        this.nextStreamId += 2;
        const stream = new ClientHttp2Stream(this, streamId, headers, options);
        this.streams.set(streamId, stream);
        process.nextTick(() => stream._flushOutbound());
        return stream;
    }

    close(callback) {
        if (typeof callback === 'function') this.once('close', callback);
        if (this.closed) return this;

        this.closed = true;
        if (this._canWrite() && !this.connecting && !this.goawaySent) {
            this.goawaySent = true;
            this._writeFrame(encodeGoaway(
                this.lastPeerStreamId,
                CONSTANTS.NGHTTP2_NO_ERROR
            ));
        }
        this._maybeEndSocket();
        return this;
    }

    destroy(error) {
        if (this.destroyed) return this;
        this.destroyed = true;
        this.closed = true;

        for (const stream of [...this.streams.values()]) {
            stream._sessionDestroying = true;
            stream.rstCode = CONSTANTS.NGHTTP2_CANCEL;
            stream.destroy(error || makeStreamError(
                'HTTP/2 session destroyed',
                CONSTANTS.NGHTTP2_CANCEL,
                stream.id
            ));
        }
        this.streams.clear();
        const destroyError = error || new Http2Error(
            'HTTP/2 session destroyed',
            CONSTANTS.NGHTTP2_CANCEL,
            0
        );
        this._failPendingPings(destroyError);
        this._clearQueuedWrites();
        this.socket.destroy(error);
        return this;
    }

    setTimeout(timeout, callback) {
        if (typeof callback === 'function') this.socket.once('timeout', callback);
        this.socket.setTimeout(timeout);
        return this;
    }

    settings(settings) {
        if (this.closed || this.destroyed) {
            throw new Error('The HTTP/2 session is closed');
        }
        const entries = normalizeSettingsEntries(settings);
        for (const [id, value] of entries) {
            validateSetting(id, value, false);
            if (id === SETTINGS.ENABLE_PUSH && value !== 0) {
                throw new Error('This client does not implement server push; ENABLE_PUSH must remain 0');
            }
        }

        const nextLocalSettings = { ...this.localSettings };
        for (const [id, value] of entries) nextLocalSettings[id] = value;

        const nextInitialWindow = nextLocalSettings[SETTINGS.INITIAL_WINDOW_SIZE] ?? DEFAULT_WINDOW_SIZE;
        const effectiveInitialWindow = this._effectiveLocalSettings[SETTINGS.INITIAL_WINDOW_SIZE] ?? DEFAULT_WINDOW_SIZE;
        const pendingDelta = nextInitialWindow - effectiveInitialWindow;
        for (const stream of this.streams.values()) {
            if (stream.receiveWindow + pendingDelta > MAX_WINDOW_SIZE) {
                throw new RangeError('SETTINGS_INITIAL_WINDOW_SIZE would overflow a stream receive window');
            }
        }

        for (const [id, value] of entries) this.localSettings[id] = value;

        if (!this.connecting) {
            this._sendSettings(entries, { ...this.localSettings });
        }
        return this;
    }

    _applyAcknowledgedLocalSettings(entries) {
        for (const [id, value] of entries) {
            const previous = this._effectiveLocalSettings[id];
            if (id === SETTINGS.INITIAL_WINDOW_SIZE) {
                const delta = value - (previous ?? DEFAULT_WINDOW_SIZE);
                for (const stream of this.streams.values()) {
                    if (stream.receiveWindow + delta > MAX_WINDOW_SIZE) {
                        this._connectionError(
                            CONSTANTS.NGHTTP2_FLOW_CONTROL_ERROR,
                            'Acknowledged SETTINGS_INITIAL_WINDOW_SIZE overflowed a stream receive window'
                        );
                        return false;
                    }
                }
                for (const stream of this.streams.values()) stream.receiveWindow += delta;
            } else if (id === SETTINGS.HEADER_TABLE_SIZE && this._hpack.setDecoderMaxTableSize) {
                try {
                    this._hpack.setDecoderMaxTableSize(value);
                } catch (error) {
                    this._connectionError(
                        CONSTANTS.NGHTTP2_INTERNAL_ERROR,
                        `Failed to apply acknowledged HPACK table size: ${error.message}`
                    );
                    return false;
                }
            }
            this._effectiveLocalSettings[id] = value;
        }

        if (this._effectiveLocalSettings[SETTINGS.ENABLE_PUSH] === 0) {
            this._enablePushAcknowledged = true;
        }
        return true;
    }

    _pendingLocalInitialWindowDelta() {
        const desired = this.localSettings[SETTINGS.INITIAL_WINDOW_SIZE] ?? DEFAULT_WINDOW_SIZE;
        const effective = this._effectiveLocalSettings[SETTINGS.INITIAL_WINDOW_SIZE] ?? DEFAULT_WINDOW_SIZE;
        return desired - effective;
    }

    ping(payload, callback) {
        if (this.closed || this.destroyed) {
            throw new Error('The HTTP/2 session is closed');
        }
        let data = payload;
        let done = callback;
        if (typeof data === 'function') {
            done = data;
            data = undefined;
        }

        const body = data === undefined ? crypto.randomBytes(8) : Buffer.from(data);
        if (body.length !== 8) throw new RangeError('PING payload must be exactly 8 bytes');

        const key = body.toString('hex');
        const queue = this._pendingPings.get(key) || [];
        queue.push({ callback: done, startedAt: process.hrtime.bigint() });
        this._pendingPings.set(key, queue);
        this._writeFrame(encodeFrame(0, FRAME.PING, body));
        return this;
    }

    windowUpdate(increment) {
        if (this.closed || this.destroyed) {
            throw new Error('The HTTP/2 session is closed');
        }
        const value = validateWindowIncrement(increment);
        if (this.receiveConnectionWindow + value > MAX_WINDOW_SIZE) {
            throw new RangeError('Connection receive window would exceed 2^31-1');
        }
        this.receiveConnectionWindow += value;
        this._writeFrame(encodeWindowUpdate(0, value));
        return this;
    }

    _bindSocket() {
        const onConnect = () => {
            if (this.destroyed) return;
            if (!this.socket.encrypted) {
                this.destroy(new Error('createConnection() must return a TLS socket for an https:// authority'));
                return;
            }
            if (this.socket.alpnProtocol !== 'h2') {
                this.destroy(new Error(
                    `Server did not negotiate h2 via ALPN: ${this.socket.alpnProtocol || 'none'}`
                ));
                return;
            }

            // Frames queued by API calls made while connecting (for example
            // windowUpdate()) must never precede the HTTP/2 client preface.
            // Insert the preface and initial SETTINGS atomically at the front.
            const initialSettings = normalizeSettingsEntries(this.localSettings);
            const initialSettingsSnapshot = { ...this.localSettings };
            this._pendingSettingsAcks.push({
                entries: initialSettings,
                snapshot: initialSettingsSnapshot
            });

            const connectionPreface = Buffer.concat([
                PREFACE,
                encodeFrame(
                    0,
                    FRAME.SETTINGS,
                    encodeSettingsEntries(initialSettings)
                )
            ]);
            this._writeQueue.unshift(connectionPreface);
            this._writeQueueBytes += connectionPreface.length;
            this.connecting = false;
            this._flushWriteQueue();

            if (this.connectionWindowTarget > DEFAULT_WINDOW_SIZE) {
                const increment = this.connectionWindowTarget - DEFAULT_WINDOW_SIZE;
                this.receiveConnectionWindow += increment;
                this._writeFrame(encodeWindowUpdate(0, increment));
            }

            if (this.closed && !this.goawaySent) {
                this.goawaySent = true;
                this._writeFrame(encodeGoaway(
                    this.lastPeerStreamId,
                    CONSTANTS.NGHTTP2_NO_ERROR
                ));
            }

            this.emit('connect', this, this.socket);
            for (const stream of this.streams.values()) stream._flushOutbound();
            this._maybeEndSocket();
        };

        if (this.socket.encrypted) {
            if (this.socket.alpnProtocol) process.nextTick(onConnect);
            else this.socket.once('secureConnect', onConnect);
        } else if (this.socket.connecting) {
            this.socket.once('connect', onConnect);
        } else {
            process.nextTick(onConnect);
        }

        this.socket.on('drain', () => {
            this._socketBlocked = false;
            this._flushWriteQueue();
            this._flushBlockedStreams();
        });

        this.socket.on('timeout', () => this.emit('timeout'));

        this.socket.on('data', chunk => {
            try {
                this._onData(chunk);
            } catch (error) {
                this._connectionError(
                    error.code || CONSTANTS.NGHTTP2_INTERNAL_ERROR,
                    error.message
                );
            }
        });

        this.socket.on('error', error => this.emit('error', error));

        this.socket.on('close', () => {
            this.closed = true;
            this.destroyed = true;
            for (const stream of [...this.streams.values()]) {
                stream._sessionDestroying = true;
                stream.destroy(makeStreamError(
                    'HTTP/2 connection closed',
                    CONSTANTS.NGHTTP2_CONNECT_ERROR,
                    stream.id
                ));
            }
            this.streams.clear();
            this._failPendingPings(new Http2Error(
                'HTTP/2 connection closed',
                CONSTANTS.NGHTTP2_CONNECT_ERROR,
                0
            ));
            this._clearQueuedWrites();
            if (!this._closeEmitted) {
                this._closeEmitted = true;
                this.emit('close');
            }
        });
    }

    _onData(chunk) {
        if (!Buffer.isBuffer(chunk)) chunk = Buffer.from(chunk);
        const remainder = this._buffer.subarray(this._bufferOffset);
        this._rejectOversizedPendingFrame(remainder, chunk);
        if (this.destroyed || this._connectionErrorStarted) return;

        if (this._bufferOffset === this._buffer.length) {
            this._buffer = chunk;
            this._bufferOffset = 0;
        } else {
            this._buffer = Buffer.concat([remainder, chunk], remainder.length + chunk.length);
            this._bufferOffset = 0;
        }

        while (true) {
            const decoded = decodeFrame(this._buffer, this._bufferOffset);
            if (!decoded) break;
            this._bufferOffset = decoded.nextOffset;
            this._handleFrame(decoded.frame);
            if (this.destroyed) break;
        }

        if (this._bufferOffset === this._buffer.length) {
            this._buffer = EMPTY_BUFFER;
            this._bufferOffset = 0;
        }
    }

    _rejectOversizedPendingFrame(remainder, chunk) {
        if (remainder.length + chunk.length < 9) return;
        let header;
        if (remainder.length >= 9) {
            header = remainder;
        } else {
            header = Buffer.concat([remainder, chunk.subarray(0, 9 - remainder.length)]);
        }
        const length = header.readUIntBE(0, 3);
        const localMaxFrame = this._effectiveLocalSettings[SETTINGS.MAX_FRAME_SIZE] ?? DEFAULT_FRAME_SIZE;
        if (length > localMaxFrame) {
            this._connectionError(
                CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR,
                `Received frame payload ${length} exceeds local MAX_FRAME_SIZE ${localMaxFrame}`
            );
        }
    }

    _handleFrame(frame) {
        const localMaxFrame = this._effectiveLocalSettings[SETTINGS.MAX_FRAME_SIZE] ?? DEFAULT_FRAME_SIZE;
        if (frame.length > localMaxFrame) {
            this._connectionError(
                CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR,
                `Received frame payload ${frame.length} exceeds local MAX_FRAME_SIZE ${localMaxFrame}`
            );
            return;
        }

        if (!this._receivedFirstFrame) {
            this._receivedFirstFrame = true;
            if (
                frame.type !== FRAME.SETTINGS ||
                frame.streamId !== 0 ||
                (frame.flags & FLAG.ACK)
            ) {
                this._connectionError(
                    CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                    'The server connection preface must start with a non-ACK SETTINGS frame'
                );
                return;
            }
        }

        if (this._continuationStreamId !== null) {
            if (frame.type !== FRAME.CONTINUATION || frame.streamId !== this._continuationStreamId) {
                this._connectionError(
                    CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                    'Expected a CONTINUATION frame on the same stream'
                );
                return;
            }

            if (this._discardedHeaderBlock) {
                this._appendDiscardedHeaderFrame(frame);
            } else if (this._continuationStream) {
                this._continuationStream._handleHeaders(frame);
            } else {
                this._connectionError(
                    CONSTANTS.NGHTTP2_INTERNAL_ERROR,
                    'Missing CONTINUATION target'
                );
                return;
            }

            if (frame.flags & FLAG.END_HEADERS) {
                this._continuationStreamId = null;
                this._continuationStream = null;
            }
            return;
        }

        if (frame.type === FRAME.CONTINUATION) {
            this._connectionError(
                CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                'Unexpected CONTINUATION frame'
            );
            return;
        }

        // Unknown extension frames are ignorable, regardless of stream state.
        if (frame.type > FRAME.CONTINUATION) return;

        switch (frame.type) {
            case FRAME.SETTINGS:
                this._handleSettingsFrame(frame);
                return;
            case FRAME.PING:
                this._handlePingFrame(frame);
                return;
            case FRAME.GOAWAY:
                this._handleGoawayFrame(frame);
                return;
            case FRAME.WINDOW_UPDATE:
                this._handleWindowUpdateFrame(frame);
                return;
            case FRAME.PRIORITY:
                if (frame.streamId === 0) {
                    this._connectionError(CONSTANTS.NGHTTP2_PROTOCOL_ERROR, 'PRIORITY on stream 0');
                } else if (frame.length !== 5) {
                    this._connectionError(CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR, 'Invalid PRIORITY size');
                } else {
                    const dependency = frame.payload.readUInt32BE(0) & MAX_WINDOW_SIZE;
                    if (dependency === frame.streamId) {
                        this._connectionError(
                            CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                            'A stream cannot depend on itself'
                        );
                    }
                }
                return;
            default:
                break;
        }

        if (frame.streamId === 0) {
            this._connectionError(
                CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                'Stream-specific frame received on stream 0'
            );
            return;
        }

        if (frame.type === FRAME.PUSH_PROMISE) {
            this._handlePushPromiseFrame(frame);
            return;
        }

        const isClosedServerStream = (frame.streamId & 1) === 0 &&
            this._closedServerStreams.has(frame.streamId);

        if ((frame.streamId & 1) === 0 && !isClosedServerStream) {
            this._connectionError(
                CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                'Frame received on an idle or unsupported server-initiated stream'
            );
            return;
        }
        if ((frame.streamId & 1) === 1 && frame.streamId >= this.nextStreamId) {
            this._connectionError(
                CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                'Frame received on an idle client-initiated stream'
            );
            return;
        }

        const stream = this.streams.get(frame.streamId);
        if (!stream || stream.destroyed) {
            this._handleFrameOnClosedStream(frame, isClosedServerStream);
            return;
        }

        switch (frame.type) {
            case FRAME.RST_STREAM:
                if (frame.length !== 4) {
                    this._connectionError(CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR, 'Invalid RST_STREAM size');
                    return;
                }
                stream._handleReset(frame.payload.readUInt32BE(0));
                return;
            case FRAME.HEADERS:
                stream._handleHeaders(frame);
                if (!(frame.flags & FLAG.END_HEADERS) && !this._connectionErrorStarted) {
                    this._continuationStreamId = frame.streamId;
                    this._continuationStream = stream;
                }
                return;
            case FRAME.DATA:
                stream._handleData(frame);
                return;
            default:
                return;
        }
    }

    _handleFrameOnClosedStream(frame, isClosedServerStream = false) {
        if (frame.type === FRAME.DATA) {
            this.receiveConnectionWindow -= frame.length;
            if (this.receiveConnectionWindow < 0) {
                this._connectionError(
                    CONSTANTS.NGHTTP2_FLOW_CONTROL_ERROR,
                    'Connection receive window exceeded by DATA on a closed stream'
                );
                return;
            }
            if (!isClosedServerStream && this._canWrite()) {
                this._writeFrame(encodeRstStream(
                    frame.streamId,
                    CONSTANTS.NGHTTP2_STREAM_CLOSED
                ));
            }
            this._acknowledgeConnectionInbound(frame.length, true);
            return;
        }

        if (frame.type === FRAME.HEADERS) {
            try {
                const dependency = getHeadersPriorityDependency(frame);
                if (dependency === frame.streamId) {
                    this._connectionError(
                        CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                        'A stream cannot depend on itself'
                    );
                    return;
                }
            } catch (error) {
                this._connectionError(
                    error.code || CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR,
                    error.message
                );
                return;
            }

            if (!isClosedServerStream && this._canWrite()) {
                this._writeFrame(encodeRstStream(
                    frame.streamId,
                    CONSTANTS.NGHTTP2_STREAM_CLOSED
                ));
            }
            this._startDiscardedHeaderBlock(frame);
            return;
        }

        if (frame.type === FRAME.RST_STREAM) {
            if (frame.length !== 4) {
                this._connectionError(CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR, 'Invalid RST_STREAM size');
                return;
            }
            if (isClosedServerStream) this._closedServerStreams.delete(frame.streamId);
        }
    }

    _handlePushPromiseFrame(frame) {
        if (this._enablePushAcknowledged) {
            this._connectionError(
                CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                'PUSH_PROMISE received after SETTINGS_ENABLE_PUSH = 0 was acknowledged'
            );
            return;
        }
        if ((frame.streamId & 1) === 0 || frame.streamId >= this.nextStreamId) {
            this._connectionError(
                CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                'PUSH_PROMISE received on an invalid associated stream'
            );
            return;
        }

        let promisedStreamId;
        try {
            promisedStreamId = getPromisedStreamId(frame);
        } catch (error) {
            this._connectionError(
                error.code || CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR,
                error.message
            );
            return;
        }

        if (
            promisedStreamId === 0 ||
            (promisedStreamId & 1) !== 0 ||
            promisedStreamId <= this._lastPromisedStreamId ||
            this._closedServerStreams.has(promisedStreamId)
        ) {
            this._connectionError(
                CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                'PUSH_PROMISE contains an invalid promised stream ID'
            );
            return;
        }

        this._lastPromisedStreamId = promisedStreamId;
        this.lastPeerStreamId = Math.max(this.lastPeerStreamId, promisedStreamId);
        this._closedServerStreams.add(promisedStreamId);
        this._startDiscardedHeaderBlock(frame, () => {
            if (this._canWrite()) {
                this._writeFrame(encodeRstStream(
                    promisedStreamId,
                    CONSTANTS.NGHTTP2_REFUSED_STREAM
                ));
            }
        });
    }

    _startDiscardedHeaderBlock(frame, onComplete = null) {
        this._discardedHeaderBlock = {
            streamId: frame.streamId,
            fragments: [],
            length: 0,
            onComplete
        };
        this._appendDiscardedHeaderFrame(frame);
        if (!(frame.flags & FLAG.END_HEADERS) && !this._connectionErrorStarted) {
            this._continuationStreamId = frame.streamId;
        }
    }

    _appendDiscardedHeaderFrame(frame) {
        const state = this._discardedHeaderBlock;
        if (!state) {
            this._connectionError(
                CONSTANTS.NGHTTP2_INTERNAL_ERROR,
                'Missing discarded header block state'
            );
            return;
        }

        let fragment;
        try {
            fragment = getHeaderFragment(frame);
        } catch (error) {
            this._discardedHeaderBlock = null;
            this._connectionError(
                error.code || CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR,
                error.message
            );
            return;
        }

        state.fragments.push(fragment);
        state.length += fragment.length;
        if (state.length > this.maxHeaderBlockBytes) {
            this._discardedHeaderBlock = null;
            this._connectionError(
                CONSTANTS.NGHTTP2_ENHANCE_YOUR_CALM,
                'Compressed discarded header block exceeds configured limit'
            );
            return;
        }

        if (!(frame.flags & FLAG.END_HEADERS)) return;

        const block = state.fragments.length === 1
            ? state.fragments[0]
            : Buffer.concat(state.fragments, state.length);
        this._discardedHeaderBlock = null;

        try {
            this._hpack.decode(block, this.maxHeaderListSize);
        } catch (error) {
            this._connectionError(
                error.code || CONSTANTS.NGHTTP2_COMPRESSION_ERROR,
                `HPACK decode failed: ${error.message}`
            );
            return;
        }

        if (typeof state.onComplete === 'function') state.onComplete();
    }

    _handleSettingsFrame(frame) {
        if (frame.streamId !== 0) {
            this._connectionError(CONSTANTS.NGHTTP2_PROTOCOL_ERROR, 'SETTINGS must use stream 0');
            return;
        }
        if (frame.flags & FLAG.ACK) {
            if (frame.length !== 0) {
                this._connectionError(CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR, 'SETTINGS ACK must be empty');
                return;
            }
            const acknowledged = this._pendingSettingsAcks.shift();
            if (!acknowledged) {
                this._connectionError(
                    CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                    'Received an unexpected SETTINGS ACK'
                );
                return;
            }
            if (!this._applyAcknowledgedLocalSettings(acknowledged.entries)) return;
            this.emit('localSettings', { ...acknowledged.snapshot });
            return;
        }
        if (frame.length % 6 !== 0) {
            this._connectionError(
                CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR,
                'SETTINGS payload length must be a multiple of 6'
            );
            return;
        }

        const entries = decodeSettingsEntries(frame.payload);
        for (const [id, value] of entries) {
            try {
                validateSetting(id, value, true);
            } catch (error) {
                this._connectionError(error.code, error.message);
                return;
            }

            const previous = this.remoteSettings[id];
            if (id === SETTINGS.INITIAL_WINDOW_SIZE) {
                const oldValue = previous ?? DEFAULT_WINDOW_SIZE;
                const delta = value - oldValue;
                for (const stream of this.streams.values()) {
                    const updated = stream.sendWindow + delta;
                    if (updated > MAX_WINDOW_SIZE) {
                        this._connectionError(
                            CONSTANTS.NGHTTP2_FLOW_CONTROL_ERROR,
                            'SETTINGS_INITIAL_WINDOW_SIZE caused a stream window overflow'
                        );
                        return;
                    }
                    stream.sendWindow = updated;
                }
            } else if (id === SETTINGS.HEADER_TABLE_SIZE && this._hpack.setEncoderMaxTableSize) {
                this._hpack.setEncoderMaxTableSize(value);
            }
            this.remoteSettings[id] = value;
        }

        this.emit('remoteSettings', { ...this.remoteSettings });
        this._writeFrame(encodeFrame(0, FRAME.SETTINGS, EMPTY_BUFFER, FLAG.ACK));
        this._flushBlockedStreams();
    }

    _handlePingFrame(frame) {
        if (frame.streamId !== 0) {
            this._connectionError(CONSTANTS.NGHTTP2_PROTOCOL_ERROR, 'PING must use stream 0');
            return;
        }
        if (frame.length !== 8) {
            this._connectionError(CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR, 'PING payload must be 8 bytes');
            return;
        }

        if (frame.flags & FLAG.ACK) {
            const key = frame.payload.toString('hex');
            const queue = this._pendingPings.get(key);
            if (!queue || queue.length === 0) return;
            const pending = queue.shift();
            if (queue.length === 0) this._pendingPings.delete(key);
            if (typeof pending.callback === 'function') {
                const elapsedMs = Number(process.hrtime.bigint() - pending.startedAt) / 1e6;
                pending.callback(null, elapsedMs, Buffer.from(frame.payload));
            }
            return;
        }

        this._writeFrame(encodeFrame(0, FRAME.PING, frame.payload, FLAG.ACK));
    }

    _handleGoawayFrame(frame) {
        if (frame.streamId !== 0) {
            this._connectionError(CONSTANTS.NGHTTP2_PROTOCOL_ERROR, 'GOAWAY must use stream 0');
            return;
        }
        if (frame.length < 8) {
            this._connectionError(CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR, 'GOAWAY payload is too short');
            return;
        }

        const lastStreamId = frame.payload.readUInt32BE(0) & MAX_WINDOW_SIZE;
        const errorCode = frame.payload.readUInt32BE(4);
        const debugData = frame.payload.subarray(8);
        this.goawayReceived = true;
        this.closed = true;
        this.emit('goaway', errorCode, lastStreamId, debugData);

        for (const stream of [...this.streams.values()]) {
            if (stream.id > lastStreamId) {
                stream._handleReset(CONSTANTS.NGHTTP2_REFUSED_STREAM);
            }
        }
        this._maybeEndSocket();
    }

    _handleWindowUpdateFrame(frame) {
        if (frame.length !== 4) {
            this._connectionError(
                CONSTANTS.NGHTTP2_FRAME_SIZE_ERROR,
                'WINDOW_UPDATE payload must be 4 bytes'
            );
            return;
        }
        const increment = frame.payload.readUInt32BE(0) & MAX_WINDOW_SIZE;
        if (increment === 0) {
            if (frame.streamId === 0) {
                this._connectionError(
                    CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                    'Connection WINDOW_UPDATE increment must not be zero'
                );
            } else {
                const stream = this.streams.get(frame.streamId);
                if (stream && !stream.destroyed) stream._streamError(
                    CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                    'Stream WINDOW_UPDATE increment must not be zero'
                );
            }
            return;
        }

        if (frame.streamId === 0) {
            if (this.sendConnectionWindow + increment > MAX_WINDOW_SIZE) {
                this._connectionError(
                    CONSTANTS.NGHTTP2_FLOW_CONTROL_ERROR,
                    'Connection send window overflow'
                );
                return;
            }
            this.sendConnectionWindow += increment;
            this._flushBlockedStreams();
            return;
        }

        const stream = this.streams.get(frame.streamId);
        if (stream && !stream.destroyed) {
            stream._handleWindowUpdate(increment);
            return;
        }
        const isClosedServerStream = (frame.streamId & 1) === 0 &&
            this._closedServerStreams.has(frame.streamId);
        const isIdleClientStream = (frame.streamId & 1) === 1 && frame.streamId >= this.nextStreamId;
        const isIdleServerStream = (frame.streamId & 1) === 0 && !isClosedServerStream;
        if (isIdleClientStream || isIdleServerStream) {
            this._connectionError(
                CONSTANTS.NGHTTP2_PROTOCOL_ERROR,
                'WINDOW_UPDATE received on an idle stream'
            );
        }
    }

    _sendSettings(entries, snapshot = null) {
        const normalized = normalizeSettingsEntries(entries);
        this._pendingSettingsAcks.push({
            entries: normalized,
            snapshot: snapshot || { ...this.localSettings }
        });
        this._writeFrame(encodeFrame(
            0,
            FRAME.SETTINGS,
            encodeSettingsEntries(normalized)
        ));
    }

    _sendHeaderBlock(streamId, headerBlock, endStream, priority) {
        const maxFrame = this.remoteSettings[SETTINGS.MAX_FRAME_SIZE] ?? DEFAULT_FRAME_SIZE;
        const priorityPayload = priority ? encodePriorityPayload(priority) : null;
        if (priorityPayload) {
            const dependency = priorityPayload.readUInt32BE(0) & MAX_WINDOW_SIZE;
            if (dependency === streamId) throw new RangeError('A stream cannot depend on itself');
        }

        const firstCapacity = maxFrame - (priorityPayload ? priorityPayload.length : 0);
        const firstFragment = headerBlock.subarray(0, Math.max(0, firstCapacity));
        const firstPayload = priorityPayload
            ? Buffer.concat([priorityPayload, firstFragment])
            : firstFragment;

        let offset = firstFragment.length;
        let flags = 0;
        if (endStream) flags |= FLAG.END_STREAM;
        if (priorityPayload) flags |= FLAG.PRIORITY;
        if (offset >= headerBlock.length) flags |= FLAG.END_HEADERS;
        this._writeFrame(encodeFrame(streamId, FRAME.HEADERS, firstPayload, flags));

        while (offset < headerBlock.length) {
            const end = Math.min(offset + maxFrame, headerBlock.length);
            const fragment = headerBlock.subarray(offset, end);
            const continuationFlags = end === headerBlock.length ? FLAG.END_HEADERS : 0;
            this._writeFrame(encodeFrame(
                streamId,
                FRAME.CONTINUATION,
                fragment,
                continuationFlags
            ));
            offset = end;
        }
    }

    _acknowledgeInbound(stream, amount, force) {
        if (!this.autoWindowUpdate || amount <= 0 || this.destroyed) return;
        stream.pendingReceiveCredit += amount;
        this.pendingConnectionReceiveCredit += amount;

        const streamTarget = this._effectiveLocalSettings[SETTINGS.INITIAL_WINDOW_SIZE] ?? DEFAULT_WINDOW_SIZE;
        const streamThreshold = Math.max(1, Math.floor(streamTarget / 4));
        if (
            force ||
            stream.receiveWindow <= Math.floor(streamTarget / 2) ||
            stream.pendingReceiveCredit >= streamThreshold
        ) {
            const available = Math.max(0, MAX_WINDOW_SIZE - stream.receiveWindow);
            const increment = Math.min(stream.pendingReceiveCredit, available);
            if (increment > 0) {
                stream.pendingReceiveCredit -= increment;
                stream.receiveWindow += increment;
                if (!stream.receivedEnd && !stream.destroyed) {
                    this._writeFrame(encodeWindowUpdate(stream.id, increment));
                } else {
                    stream.pendingReceiveCredit = 0;
                }
            }
        }

        this._acknowledgeConnectionInbound(0, force);
    }

    _acknowledgeConnectionInbound(amount, force) {
        if (!this.autoWindowUpdate || this.destroyed) return;
        if (amount > 0) this.pendingConnectionReceiveCredit += amount;
        const threshold = Math.max(1, Math.floor(this.connectionWindowTarget / 4));
        if (
            force ||
            this.receiveConnectionWindow <= Math.floor(this.connectionWindowTarget / 2) ||
            this.pendingConnectionReceiveCredit >= threshold
        ) {
            const available = Math.max(0, MAX_WINDOW_SIZE - this.receiveConnectionWindow);
            const increment = Math.min(this.pendingConnectionReceiveCredit, available);
            if (increment > 0) {
                this.pendingConnectionReceiveCredit -= increment;
                this.receiveConnectionWindow += increment;
                this._writeFrame(encodeWindowUpdate(0, increment));
            }
        }
    }

    _connectionError(code, message) {
        if (this._connectionErrorStarted) return;
        this._connectionErrorStarted = true;
        this.closed = true;

        const error = new Http2Error(message, code, 0);
        if (this._canWrite() && !this.connecting) {
            // Do not delay GOAWAY behind queued application DATA after a
            // connection-level protocol failure.
            this._clearQueuedWrites();
            const debug = Buffer.from(message).subarray(0, 256);
            this.goawaySent = true;
            this._writeFrame(encodeGoaway(this.lastPeerStreamId, code, debug));
            this._endAfterFlush = true;
            this._flushWriteQueue();
        } else {
            this.socket.destroy(error);
        }

        for (const stream of [...this.streams.values()]) {
            stream._sessionDestroying = true;
            stream.destroy(error);
        }
        this.streams.clear();
        this._failPendingPings(error);
        this.emit('error', error);
    }

    _failPendingPings(error) {
        for (const queue of this._pendingPings.values()) {
            for (const pending of queue) {
                if (typeof pending.callback === 'function') {
                    process.nextTick(pending.callback, error);
                }
            }
        }
        this._pendingPings.clear();
    }

    _clearQueuedWrites() {
        this._writeQueue.length = 0;
        this._writeQueueHead = 0;
        this._writeQueueBytes = 0;
        this._blockedStreams.clear();
    }

    _canWrite() {
        return Boolean(this.socket) && !this.socket.destroyed;
    }

    _readyToSend() {
        return this._canWrite() && !this.connecting && !this.destroyed;
    }

    _availableDataPayloadCapacity() {
        if (this.maxQueuedWriteBytes === Number.POSITIVE_INFINITY) {
            return Number.POSITIVE_INFINITY;
        }
        return Math.max(0, this.maxQueuedWriteBytes - this._writeQueueBytes - 9);
    }

    _flushBlockedStreams() {
        if (!this._readyToSend() || this._blockedStreams.size === 0) return;
        for (const stream of [...this._blockedStreams]) {
            if (stream.destroyed) {
                this._blockedStreams.delete(stream);
                continue;
            }
            stream._flushOutbound();
            if (this._socketBlocked || this._availableDataPayloadCapacity() <= 0) break;
        }
    }

    _writeFrame(frame) {
        if (!this._canWrite() || this.destroyed) return false;
        this._queueRaw(frame);
        return true;
    }

    _writeDataFrame(streamId, payload, flags = 0) {
        if (!this._canWrite() || this.destroyed) return false;
        const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
        const header = encodeFrameHeader(streamId, FRAME.DATA, body.length, flags);
        this._queueRawParts(body.length === 0 ? [header] : [header, body]);
        return true;
    }

    _queueRaw(buffer) {
        this._queueRawParts([buffer]);
    }

    _queueRawParts(buffers) {
        for (const buffer of buffers) {
            this._writeQueue.push(buffer);
            this._writeQueueBytes += buffer.length;
        }
        this._flushWriteQueue();
    }

    _flushWriteQueue() {
        if (!this._canWrite() || this.connecting || this._socketBlocked) return;

        const canCork = typeof this.socket.cork === 'function' &&
            typeof this.socket.uncork === 'function';
        if (canCork) this.socket.cork();
        try {
            while (this._writeQueueHead < this._writeQueue.length) {
                const buffer = this._writeQueue[this._writeQueueHead++];
                this._writeQueueBytes -= buffer.length;
                if (!this.socket.write(buffer)) {
                    this._socketBlocked = true;
                    break;
                }
            }
        } finally {
            if (canCork) this.socket.uncork();
        }

        if (this._writeQueueHead === this._writeQueue.length) {
            this._writeQueue.length = 0;
            this._writeQueueHead = 0;
            this._writeQueueBytes = 0;
        } else if (this._writeQueueHead >= 1024 && this._writeQueueHead * 2 >= this._writeQueue.length) {
            this._writeQueue = this._writeQueue.slice(this._writeQueueHead);
            this._writeQueueHead = 0;
        }

        if (!this._socketBlocked && this._endAfterFlush && this._writeQueueBytes === 0 && !this.socket.destroyed) {
            this._endAfterFlush = false;
            this.socket.end();
        }
    }

    _deleteStream(streamId) {
        const stream = this.streams.get(streamId);
        if (stream) this._blockedStreams.delete(stream);
        this.streams.delete(streamId);
        this._maybeEndSocket();
    }

    _maybeEndSocket() {
        if (!this.closed || this.streams.size !== 0 || !this._canWrite()) return;
        this._endAfterFlush = true;
        this._flushWriteQueue();
    }
}

function connect(authority, options, listener) {
    let sessionOptions = options;
    let onConnect = listener;
    if (typeof sessionOptions === 'function') {
        onConnect = sessionOptions;
        sessionOptions = {};
    }
    return new ClientHttp2Session(authority, sessionOptions || {}, onConnect);
}

module.exports = {
    connect,
    constants: CONSTANTS,
    settings: SETTINGS,
    frames: FRAME,
    flags: FLAG,
    ClientHttp2Session,
    ClientHttp2Stream,
    Http2Error
};
