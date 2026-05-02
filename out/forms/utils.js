"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getList = exports.getBool = exports.getOptionalString = exports.getStringOr = exports.getString = void 0;
const getString = (result, key) => (result[key] ?? "").trim();
exports.getString = getString;
const getStringOr = (result, key, fallback) => (0, exports.getString)(result, key) || fallback;
exports.getStringOr = getStringOr;
const getOptionalString = (result, key) => (0, exports.getString)(result, key) || undefined;
exports.getOptionalString = getOptionalString;
const getBool = (result, key) => Boolean(result[key]);
exports.getBool = getBool;
const getList = (result, key) => result[key] ?? [];
exports.getList = getList;
//# sourceMappingURL=utils.js.map