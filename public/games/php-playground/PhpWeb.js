"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhpWeb = void 0;
var _PhpBase2 = require("./PhpBase.js");
var _webTransactions = require("./webTransactions.js");
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, e, o, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), e, o); return 2 & r && "function" == typeof p ? function (t) { return p.apply(o, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var defaultVersion = '8.4';
var defaultVariant = '';

/**
 * Browser-hosted PHP wrapper.
 */
var PhpWeb = exports.PhpWeb = /*#__PURE__*/function (_PhpBase) {
  /**
   * Creates a browser-hosted PHP runtime.
   * @param {PhpRuntimeArgs} args Runtime configuration.
   */
  function PhpWeb() {
    var _args$version, _args$variant;
    var _this;
    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, PhpWeb);
    var version = (_args$version = args.version) !== null && _args$version !== void 0 ? _args$version : defaultVersion;
    var variant = (_args$variant = args.variant) !== null && _args$variant !== void 0 ? _args$variant : defaultVariant;
    var vvId = version + variant;
    var constructorArgs = _objectSpread({
      version: version,
      variant: variant
    }, args);
    switch (vvId) {
      case '8.5':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.5-web.mjs"), constructorArgs]);
        break;
      case '8.5_sdl':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.5_sdl-web.mjs"), constructorArgs]);
        break;
      case '8.4':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.4-web.mjs"), constructorArgs]);
        break;
      case '8.4_sdl':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.4_sdl-web.mjs"), constructorArgs]);
        break;
      case '8.3':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.3-web.mjs"), constructorArgs]);
        break;
      case '8.3_sdl':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.3_sdl-web.mjs"), constructorArgs]);
        break;
      case '8.2':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.2-web.mjs"), constructorArgs]);
        break;
      case '8.2_sdl':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.2_sdl-web.mjs"), constructorArgs]);
        break;
      case '8.1':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.1-web.mjs"), constructorArgs]);
        break;
      case '8.1_sdl':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.1_sdl-web.mjs"), constructorArgs]);
        break;
      case '8.0':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.0-web.mjs"), constructorArgs]);
        break;
      case '8.0_sdl':
        _this = _callSuper(this, PhpWeb, [function (specifier) {
          return new Promise(function (r) {
            return r(specifier);
          }).then(function (s) {
            return _interopRequireWildcard(require(s));
          });
        }("./php8.0_sdl-web.mjs"), constructorArgs]);
        break;
      default:
        throw new Error("Unsupported PHP runtime: ".concat(vvId));
    }
    return _assertThisInitialized(_this);
  }

  /**
   * Starts a persisted browser transaction for the runtime.
   * @returns {Promise<void>} Resolves when the transaction lock has been acquired.
   */
  _inherits(PhpWeb, _PhpBase);
  return _createClass(PhpWeb, [{
    key: "startTransaction",
    value: function startTransaction() {
      return (0, _webTransactions.startTransaction)(this);
    }

    /**
     * Commits a persisted browser transaction for the runtime.
     * @param {boolean} readOnly Indicates whether the transaction only performed reads.
     * @returns {Promise<void>} Resolves when the transaction has been committed.
     */
  }, {
    key: "commitTransaction",
    value: function commitTransaction() {
      var readOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return (0, _webTransactions.commitTransaction)(this, readOnly);
    }

    /**
     * Refreshes the browser-hosted runtime and syncs its filesystem.
     * @returns {Promise<void>} Resolves after the browser runtime has been refreshed.
     */
  }, {
    key: "refresh",
    value: (function () {
      var _refresh = _asyncToGenerator(function* () {
        yield _superPropGet(PhpWeb, "refresh", this, 3)([]);
        var php = yield this.binary;
        yield navigator.locks.request('php-wasm-fs-lock', function () {
          return new Promise(function (accept, reject) {
            php.FS.syncfs(true, function (error) {
              if (error) reject(error);else accept();
            });
          });
        });
      });
      function refresh() {
        return _refresh.apply(this, arguments);
      }
      return refresh;
    }()
    /**
     * Serializes async runtime operations behind the browser FS lock.
     * @param {PhpQueuedCallback} callback Async operation to queue.
     * @param {PhpQueueParams} params Arguments passed to the queued callback.
     * @param {boolean} readOnly Indicates whether the queued operation mutates state.
     * @returns {Promise<PhpRuntimeValue>} Resolves with the queued callback result.
     */
    )
  }, {
    key: "_enqueue",
    value: (function () {
      var _enqueue2 = _asyncToGenerator(function* (callback) {
        var _this2 = this;
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var readOnly = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        yield this.binary;
        var accept, reject;
        var coordinator = new Promise(function (a, r) {
          var _ref;
          return _ref = [a, r], accept = _ref[0], reject = _ref[1], _ref;
        });
        var _accept = function _accept(result) {
          return accept(result);
        };
        var _reject = function _reject(reason) {
          return reject(reason);
        };
        this.queue.push([callback, params, _accept, _reject]);
        navigator.locks.request('php-wasm-fs-lock', /*#__PURE__*/_asyncToGenerator(function* () {
          if (!_this2.queue.length) {
            return;
          }
          yield _this2.autoTransaction && !readOnly ? _this2.startTransaction() : Promise.resolve();
          do {
            var _this2$queue$shift = _this2.queue.shift(),
              _this2$queue$shift2 = _slicedToArray(_this2$queue$shift, 4),
              _callback = _this2$queue$shift2[0],
              _params = _this2$queue$shift2[1],
              _accept2 = _this2$queue$shift2[2],
              _reject2 = _this2$queue$shift2[3];
            var run = _callback.apply(void 0, _toConsumableArray(_params));
            run.then(_accept2)["catch"](_reject2);
            yield run;
            var lockChecks = 25;
            while (!_this2.queue.length && lockChecks--) {
              yield new Promise(function (a) {
                return setTimeout(a, 5);
              });
            }
          } while (_this2.queue.length);
          yield _this2.autoTransaction ? _this2.commitTransaction(readOnly) : Promise.resolve();
        }));
        return coordinator;
      });
      function _enqueue(_x) {
        return _enqueue2.apply(this, arguments);
      }
      return _enqueue;
    }())
  }]);
}(_PhpBase2.PhpBase);