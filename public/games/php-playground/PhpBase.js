"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhpBase = void 0;
var _OutputBuffer = require("./OutputBuffer.js");
var _Event2 = require("./_Event.js");
var _fsOps = require("./fsOps.js");
var _resolveDependencies3 = require("./resolveDependencies.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var importMeta = (undefined /*import.meta*/);
var STR = 'string';
var NUM = 'number';
var normalizeRuntimeModule = function normalizeRuntimeModule(runtime) {
  return runtime && _typeof(runtime) === 'object' && 'default' in runtime ? runtime : {
    "default": runtime
  };
};

/**
 * Base PHP runtime wrapper shared by the environment-specific adapters.
 */
var PhpBase = exports.PhpBase = /*#__PURE__*/function (_EventTarget) {
  /**
   * Creates a PHP runtime wrapper for a specific module loader and SAPI.
   * @param {Promise<{default: new (args: object) => object}|(new (args: object) => object)>} phpBinLoader Deferred PHP module loader.
   * @param {PhpRuntimeArgs} args Runtime configuration for the PHP instance.
   * @param {string} sapi SAPI identifier to initialize inside the module.
   */
  function PhpBase(phpBinLoader) {
    var _globalThis$phpSettin;
    var _this;
    var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var sapi = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'embed';
    _classCallCheck(this, PhpBase);
    _this = _callSuper(this, PhpBase);
    /** @type {Array<[PhpQueuedCallback, PhpQueueParams, PhpQueueResolve, PhpQueueReject]>} */
    _defineProperty(_this, "queue", void 0);
    /** @type {(event?: Event) => void} */
    _defineProperty(_this, "onerror", void 0);
    /** @type {(event?: Event) => void} */
    _defineProperty(_this, "onoutput", void 0);
    /** @type {(event?: Event) => void} */
    _defineProperty(_this, "onready", void 0);
    /** @type {TextEncoder} */
    _defineProperty(_this, "encoder", void 0);
    /** @type {{stdin: number[], stdout: OutputBuffer, stderr: OutputBuffer}} */
    _defineProperty(_this, "buffers", void 0);
    /** @type {boolean} */
    _defineProperty(_this, "autoTransaction", void 0);
    /** @type {boolean|Promise<void>} */
    _defineProperty(_this, "transactionStarted", void 0);
    /** @type {string|undefined} */
    _defineProperty(_this, "phpVersion", void 0);
    /** @type {string|undefined} */
    _defineProperty(_this, "phpVariant", void 0);
    /** @type {{[key: string]: PhpSharedValue}} */
    _defineProperty(_this, "shared", void 0);
    /** @type {PhpRuntimeArgs} */
    _defineProperty(_this, "phpArgs", void 0);
    /** @type {number} */
    _defineProperty(_this, "valueIndex", void 0);
    /** @type {Promise<object>} */
    _defineProperty(_this, "binary", void 0);
    _this.queue = [];
    _this.onerror = function () {};
    _this.onoutput = function () {};
    _this.onready = function () {};
    Object.defineProperty(_this, 'encoder', {
      value: new TextEncoder()
    });
    Object.defineProperty(_this, 'buffers', {
      value: {
        stdin: [],
        stdout: new _OutputBuffer.OutputBuffer(_this, 'output', -1),
        stderr: new _OutputBuffer.OutputBuffer(_this, 'error', -1)
      }
    });
    Object.freeze(_this.buffers);
    _this.autoTransaction = 'autoTransaction' in args ? args.autoTransaction : true;
    _this.transactionStarted = false;
    _this.phpVersion = args.version;
    _this.phpVariant = args.variant;
    _this.shared = args.shared = 'shared' in args ? args.shared : {};
    _this.phpArgs = args;
    var defaults = {
      stdin: function stdin() {
        var _this$buffers$stdin$s;
        return (_this$buffers$stdin$s = _this.buffers.stdin.shift()) !== null && _this$buffers$stdin$s !== void 0 ? _this$buffers$stdin$s : null;
      },
      stdout: function stdout(_byte) {
        return _this.buffers.stdout.push(_byte);
      },
      stderr: function stderr(_byte2) {
        return _this.buffers.stderr.push(_byte2);
      },
      postRun: function postRun() {
        var event = new _Event2._Event('ready');
        _this.onready(event);
        _this.dispatchEvent(event);
      }
    };
    var fixed = {
      onRefresh: new Set()
    };
    var phpSettings = (_globalThis$phpSettin = globalThis.phpSettings) !== null && _globalThis$phpSettin !== void 0 ? _globalThis$phpSettin : {};
    var userLocateFile = args.locateFile || function () {
      return undefined;
    };
    var files = args.files || [];
    var _resolveDependencies = (0, _resolveDependencies3.resolveDependencies)(args.sharedLibs, _this),
      sharedLibFiles = _resolveDependencies.files,
      sharedlibs = _resolveDependencies.libs,
      sharedLibUrls = _resolveDependencies.urlLibs;
    var _resolveDependencies2 = (0, _resolveDependencies3.resolveDependencies)(args.dynamicLibs, _this),
      dynamicLibFiles = _resolveDependencies2.files,
      dynamiclibs = _resolveDependencies2.libs,
      dyamicLibUrls = _resolveDependencies2.urlLibs;
    args.locateFile = function (path, directory) {
      args.debug && console.error('Loading %s', path);
      var located = userLocateFile(path, directory);
      if (located !== undefined) {
        return located;
      }
      if (sharedLibUrls[path]) {
        return sharedLibUrls[path];
      }
      if (dyamicLibUrls[path]) {
        return dyamicLibUrls[path];
      }

      // Suppress attempt to load libxml when
      // it hasn't been provided in sharedLibs
      if (path === 'libxml2.so') {
        return 'data:,';
      }
    };
    _this.valueIndex = 0;
    var phpArgs = Object.assign({}, defaults, phpSettings, args, fixed);
    _this.binary = phpBinLoader.then(normalizeRuntimeModule).then(function (_ref) {
      var PHP = _ref["default"];
      return new PHP(phpArgs);
    }).then(/*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (php) {
        yield php.ccall('pib_storage_init', NUM, [], [], {
          async: true
        });
        if (!php.FS.analyzePath('/preload').exists) {
          php.FS.mkdir('/preload');
        }
        var allFiles = files.concat(sharedLibFiles, dynamicLibFiles);

        // Make sure folder structure exists before preloading files
        allFiles.forEach(function (fileDef) {
          var segments = fileDef.parent.split('/');
          var currentPath = '';
          var _iterator = _createForOfIteratorHelper(segments),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var segment = _step.value;
              if (!segment) continue;
              currentPath += segment + '/';
              if (!php.FS.analyzePath(currentPath).exists) {
                php.FS.mkdir(currentPath);
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        });
        yield Promise.all(allFiles.map(function (fileDef) {
          return new Promise(function (accept) {
            return php.FS.createPreloadedFile(fileDef.parent, fileDef.name, fileDef.url instanceof URL ? fileDef.url.href : fileDef.url, true, false, accept);
          });
        }));
        var iniLines = sharedlibs.map(function (lib) {
          if (typeof lib === 'string' || lib instanceof URL) {
            return "extension=".concat(lib);
          } else if (_typeof(lib) === 'object' && lib.ini) {
            var _lib$name;
            return "extension=".concat((_lib$name = lib.name) !== null && _lib$name !== void 0 ? _lib$name : String(lib.url).split('/').pop());
          }
        });
        args.ini && iniLines.push(args.ini.replace(/\n\s+/g, '\n'));
        php.FS.writeFile('/php.ini', iniLines.join("\n") + "\n", {
          encoding: 'utf8'
        });
        yield php.ccall('pib_init', NUM, [STR], [sapi], {
          async: true
        });
        return php;
      });
      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
    return _this;
  }

  /**
   * Encodes a text string and pushes it into STDIN.
   * @param {string} byteString Input text to encode and queue for STDIN.
   */
  _inherits(PhpBase, _EventTarget);
  return _createClass(PhpBase, [{
    key: "inputString",
    value: function inputString(byteString) {
      this.input(this.encoder.encode(byteString));
    }

    /**
     * Queues raw input bytes for the PHP process.
     * @param {Iterable<number>} items Encoded input bytes to queue for STDIN.
     */
  }, {
    key: "input",
    value: function input(items) {
      var _this$buffers$stdin;
      (_this$buffers$stdin = this.buffers.stdin).push.apply(_this$buffers$stdin, _toConsumableArray(items));
    }

    /**
     * Flushes buffered STDOUT and STDERR data.
     */
  }, {
    key: "flush",
    value: function flush() {
      this.buffers.stdout.flush();
      this.buffers.stderr.flush();
    }

    /**
     * Tokenizes a PHP source string in the runtime.
     * @param {string} phpCode PHP source to tokenize.
     * @returns {Promise<string>} Serialized token data from the PHP runtime.
     */
  }, {
    key: "tokenize",
    value: function tokenize(phpCode) {
      return this.binary.then(function (php) {
        return php.ccall('pib_tokenize', STR, [STR], [phpCode]);
      });
    }

    /**
     * Starts a filesystem transaction when the environment supports it.
     * @returns {Promise<void>} Resolves when a transaction has started.
     */
  }, {
    key: "startTransaction",
    value: function startTransaction() {
      return Promise.resolve();
    }

    /**
     * Commits a filesystem transaction when the environment supports it.
     * @param {boolean} readOnly Indicates whether the transaction only performed reads.
     * @returns {Promise<void>} Resolves when the transaction has been committed.
     */
  }, {
    key: "commitTransaction",
    value: function commitTransaction() {
      var readOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return Promise.resolve();
    }

    /**
     * Schedules an async operation on the runtime queue.
     * @param {PhpQueuedCallback} callback Async operation to queue.
     * @param {PhpQueueParams} params Arguments passed to the queued callback.
     * @param {boolean} readOnly Indicates whether the queued operation mutates the filesystem.
     * @returns {Promise<PhpRuntimeValue>} Resolves with the queued callback result.
     */
  }, {
    key: "_enqueue",
    value: (function () {
      var _enqueue2 = _asyncToGenerator(function* (callback) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var readOnly = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var accept, reject;
        var coordinator = new Promise(function (a, r) {
          var _ref3;
          return _ref3 = [a, r], accept = _ref3[0], reject = _ref3[1], _ref3;
        });
        var _accept = function _accept(result) {
          return accept(result);
        };
        var _reject = function _reject(reason) {
          return reject(reason);
        };
        this.queue.push([callback, params, _accept, _reject]);
        if (!this.queue.length) {
          return;
        }
        (yield this.autoTransaction && !readOnly) ? this.startTransaction() : Promise.resolve();
        while (this.queue.length) {
          var _this$queue$shift = this.queue.shift(),
            _this$queue$shift2 = _slicedToArray(_this$queue$shift, 4),
            _callback = _this$queue$shift2[0],
            _params = _this$queue$shift2[1],
            _accept2 = _this$queue$shift2[2],
            _reject2 = _this$queue$shift2[3];
          yield _callback.apply(void 0, _toConsumableArray(_params)).then(_accept2)["catch"](_reject2);
        }
        (yield this.autoTransaction) ? this.commitTransaction(readOnly) : Promise.resolve();
        return coordinator;
      });
      function _enqueue(_x2) {
        return _enqueue2.apply(this, arguments);
      }
      return _enqueue;
    }()
    /**
     * Queues PHP code for execution through `pib_run`.
     * @param {string|string[]} phpCode PHP source code to execute.
     * @returns {Promise<PhpRuntimeValue>} Resolves with the execution result.
     */
    )
  }, {
    key: "run",
    value: function run(phpCode) {
      var _this2 = this;
      return this._enqueue(
      /**
       * Executes queued PHP source.
       * @param {string} phpCode PHP source code queued for execution.
       * @returns {Promise<PhpRuntimeValue>} Resolves with the PHP execution result.
       */
      function (phpCode) {
        return _this2._run(phpCode);
      }, [phpCode]);
    }

    /**
     * Executes PHP code immediately through `pib_run`.
     * @param {string|string[]} phpCode PHP source code to execute immediately.
     * @returns {Promise<PhpRuntimeValue>} Resolves with the execution result.
     */
  }, {
    key: "_run",
    value: function _run(phpCode) {
      var _this3 = this;
      return this.binary.then(function (php) {
        return php.ccall('pib_run', NUM, [STR], ["?>".concat(phpCode)]);
      })["finally"](function () {
        return _this3.flush();
      });
    }

    /**
     * Queues PHP code for execution through `pib_exec`.
     * @param {string|string[]} phpCode PHP source code to evaluate and capture output from.
     * @returns {Promise<PhpRuntimeValue>} Resolves with the execution result.
     */
  }, {
    key: "exec",
    value: function exec(phpCode) {
      var _this4 = this;
      return this._enqueue(
      /**
       * Executes queued PHP source and captures the result.
       * @param {string} phpCode PHP source code queued for evaluation.
       * @returns {Promise<PhpRuntimeValue>} Resolves with the PHP evaluation result.
       */
      function (phpCode) {
        return _this4._exec(phpCode);
      }, [phpCode]);
    }

    /**
     * Executes PHP code immediately through `pib_exec`.
     * @param {string|string[]} phpCode PHP source code to evaluate immediately.
     * @returns {Promise<PhpRuntimeValue>} Resolves with the execution result.
     */
  }, {
    key: "_exec",
    value: (function () {
      var _exec2 = _asyncToGenerator(function* (phpCode) {
        var _this5 = this;
        var call = (yield this.binary).ccall('pib_exec', STR, [STR], [phpCode], {
          async: true
        });
        return call["finally"](function () {
          return _this5.flush();
        });
      });
      function _exec(_x3) {
        return _exec2.apply(this, arguments);
      }
      return _exec;
    }()
    /**
     * Evaluates an interpolated PHP expression and returns its value.
     * @param {string[]} fragments Template literal string fragments.
     * @param {...(object|string|number|boolean|null)} values Values to interpolate into the PHP expression.
     * @returns {Promise<PhpRuntimeValue>} Resolves with the decoded PHP expression result.
     */
    )
  }, {
    key: "x",
    value: (function () {
      var _x5 = _asyncToGenerator(function* (fragments) {
        var names = [];
        var phpModule = yield this.binary;
        for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          values[_key - 1] = arguments[_key];
        }
        if (phpModule.hasVrzno) {
          var _iterator2 = _createForOfIteratorHelper(values),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var value = _step2.value;
              var name = "___value__".concat(this.valueIndex++);
              this.shared[name] = value;
              names.push(name);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          var code = '';
          fragments = _toConsumableArray(fragments);
          while (fragments.length || names.length) {
            if (fragments.length) code += fragments.shift();
            if (names.length) code += "(vrzno_shared('".concat(names.shift(), "'))");
          }
          code = "vrzno_zval( ".concat(code, " );");
          return phpModule.zvalToJS(yield this.exec(code));
        } else {
          var encoded = values.map(function (value) {
            return JSON.stringify(value);
          });
          fragments = _toConsumableArray(fragments);
          var _code = '';
          while (fragments.length || names.length) {
            if (fragments.length) _code += fragments.shift();
            if (encoded.length) {
              _code += "(json_decode('".concat(encoded.shift(), "'))");
            }
          }
          return this.exec(_code);
        }
      });
      function x(_x4) {
        return _x5.apply(this, arguments);
      }
      return x;
    }()
    /**
     * Executes an interpolated PHP script without decoding the result.
     * @param {string[]} fragments Template literal string fragments.
     * @param {...(object|string|number|boolean|null)} values Values to interpolate into the PHP script.
     * @returns {Promise<PhpRuntimeValue>} Resolves with the script execution result.
     */
    )
  }, {
    key: "r",
    value: (function () {
      var _r = _asyncToGenerator(function* (fragments) {
        var names = [];
        var phpModule = yield this.binary;
        for (var _len2 = arguments.length, values = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          values[_key2 - 1] = arguments[_key2];
        }
        if (phpModule.hasVrzno) {
          var _iterator3 = _createForOfIteratorHelper(values),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var value = _step3.value;
              var name = "___value__".concat(this.valueIndex++);
              this.shared[name] = value;
              names.push(name);
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
          var code = '';
          fragments = _toConsumableArray(fragments);
          while (fragments.length || names.length) {
            if (fragments.length) code += fragments.shift();
            if (names.length) {
              code += "(vrzno_shared('".concat(names.shift(), "'))");
            }
          }
          return this.run(code);
        } else {
          var encoded = values.map(function (value) {
            return JSON.stringify(value);
          });
          fragments = _toConsumableArray(fragments);
          var _code2 = '';
          while (fragments.length || names.length) {
            if (fragments.length) _code2 += fragments.shift();
            if (encoded.length) {
              _code2 += "(json_decode('".concat(encoded.shift(), "'))");
            }
          }
          return this.run(_code2);
        }
      });
      function r(_x6) {
        return _r.apply(this, arguments);
      }
      return r;
    }()
    /**
     * Recreates the underlying PHP module instance.
     * @returns {Promise<PhpRuntimeValue>} Resolves when the PHP runtime has been refreshed.
     */
    )
  }, {
    key: "refresh",
    value: (function () {
      var _refresh = _asyncToGenerator(function* () {
        var _this6 = this;
        var php = yield this.binary;
        var _iterator4 = _createForOfIteratorHelper(php.onRefresh),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var callback = _step4.value;
            callback();
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
        Object.keys(this.shared).forEach(function (key) {
          return delete _this6.shared[key];
        });
        return php.ccall('pib_refresh', NUM, [], [], {
          async: true
        });
      });
      function refresh() {
        return _refresh.apply(this, arguments);
      }
      return refresh;
    }()
    /**
     * Inspects a path in the virtual filesystem.
     * @param {string} path Filesystem path to inspect.
     * @returns {Promise<PhpRuntimeValue>} Filesystem analysis details for the path.
     */
    )
  }, {
    key: "analyzePath",
    value: function analyzePath(path) {
      return this._enqueue(_fsOps.fsOps.analyzePath, [this.binary, path]);
    }

    /**
     * Lists a directory in the virtual filesystem.
     * @param {string} path Directory path to list.
     * @returns {Promise<PhpRuntimeValue>} Directory entries for the path.
     */
  }, {
    key: "readdir",
    value: function readdir(path) {
      return this._enqueue(_fsOps.fsOps.readdir, [this.binary, path]);
    }

    /**
     * Reads a file from the virtual filesystem.
     * @param {string} path File path to read.
     * @param {object} options Read options forwarded to Emscripten FS.
     * @returns {Promise<PhpRuntimeValue>} File contents for the requested path.
     */
  }, {
    key: "readFile",
    value: function readFile(path, options) {
      return this._enqueue(_fsOps.fsOps.readFile, [this.binary, path, options]);
    }

    /**
     * Returns file metadata for a virtual filesystem path.
     * @param {string} path Filesystem path to stat.
     * @returns {Promise<PhpRuntimeValue>} File metadata for the path.
     */
  }, {
    key: "stat",
    value: function stat(path) {
      return this._enqueue(_fsOps.fsOps.stat, [this.binary, path]);
    }

    /**
     * Creates a directory in the virtual filesystem.
     * @param {string} path Directory path to create.
     * @returns {Promise<PhpRuntimeValue>} Metadata for the created directory.
     */
  }, {
    key: "mkdir",
    value: function mkdir(path) {
      return this._enqueue(_fsOps.fsOps.mkdir, [this.binary, path]);
    }

    /**
     * Removes a directory from the virtual filesystem.
     * @param {string} path Directory path to remove.
     * @returns {Promise<PhpRuntimeValue>} Resolves when the directory has been removed.
     */
  }, {
    key: "rmdir",
    value: function rmdir(path) {
      return this._enqueue(_fsOps.fsOps.rmdir, [this.binary, path]);
    }

    /**
     * Renames a virtual filesystem path.
     * @param {string} path Existing filesystem path.
     * @param {string} newPath Destination filesystem path.
     * @returns {Promise<PhpRuntimeValue>} Resolves when the path has been renamed.
     */
  }, {
    key: "rename",
    value: function rename(path, newPath) {
      return this._enqueue(_fsOps.fsOps.rename, [this.binary, path, newPath]);
    }

    /**
     * Writes a file into the virtual filesystem.
     * @param {string} path File path to write.
     * @param {string|Uint8Array} data Data to persist.
     * @param {object} options Write options forwarded to Emscripten FS.
     * @returns {Promise<PhpRuntimeValue>} Resolves when the file has been written.
     */
  }, {
    key: "writeFile",
    value: function writeFile(path, data, options) {
      return this._enqueue(_fsOps.fsOps.writeFile, [this.binary, path, data, options]);
    }

    /**
     * Deletes a file from the virtual filesystem.
     * @param {string} path File path to remove.
     * @returns {Promise<PhpRuntimeValue>} Resolves when the file has been removed.
     */
  }, {
    key: "unlink",
    value: function unlink(path) {
      return this._enqueue(_fsOps.fsOps.unlink, [this.binary, path]);
    }
  }]);
}(/*#__PURE__*/_wrapNativeSuper(EventTarget));