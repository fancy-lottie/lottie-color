"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replaceColors = exports.parseColor = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// main algorithm, it executes a callback on every color it finds
//
var getColors = function getColors(tree, cb, asset) {
  if (tree) tree.forEach(function (layer, i) {
    if (layer.shapes) layer.shapes.forEach(function (shape, j) {
      if (shape.it) shape.it.forEach(function (prop, k) {
        if (["fl", "st"].includes(prop.ty)) {
          var color = prop.c.k;
          var colorAlpha = prop.o.k; // eslint-disable-next-line

          var _color = _slicedToArray(color, 4),
              r = _color[0],
              g = _color[1],
              b = _color[2],
              a = _color[3];

          r = fromUnitVector(r);
          g = fromUnitVector(g);
          b = fromUnitVector(b);
          var meta = {
            i: i,
            j: j,
            k: k,
            r: r,
            g: g,
            b: b,
            a: a,
            layerName: layer.nm,
            groupName: shape.nm,
            propName: prop.nm,
            asset: asset,
            color: rgbToHex(r, g, b),
            colorAlpha: colorAlpha
          };
          if (cb) cb(meta);
        }
      });
    });
  });
};

var fromUnitVector = function fromUnitVector(n) {
  return Math.round(n * 255);
};

var rgbToHex = function rgbToHex(r, g, b) {
  return "#".concat(componentToHex(r)).concat(componentToHex(g)).concat(componentToHex(b));
};

var componentToHex = function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? "0".concat(hex) : hex;
};

var hexToComponents = function hexToComponents(hex) {
  return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
};

var toUnitVector = function toUnitVector(n) {
  return Math.round(n / 255 * 1000) / 1000;
};

var hexToRgb = function hexToRgb(hex) {
  var rgb = hexToComponents(hex);
  return rgb ? {
    r: parseInt(rgb[1], 16),
    g: parseInt(rgb[2], 16),
    b: parseInt(rgb[3], 16)
  } : {
    r: 0,
    g: 0,
    b: 0
  };
};

var parseColor = function parseColor(json) {
  var colorsArr = [];
  if (json && json.layers) getColors(json.layers, function (color) {
    return colorsArr.push(color);
  });
  if (json && json.assets) json.assets.forEach(function (asset, i) {
    return getColors(asset.layers, function (color) {
      return colorsArr.push(color);
    }, i);
  });
  return colorsArr;
};

exports.parseColor = parseColor;

var replaceColors = function replaceColors(path, newColor, json, opacity) {
  var i = path.i,
      j = path.j,
      k = path.k,
      a = path.a,
      asset = path.asset;

  var _hexToRgb = hexToRgb(newColor),
      r = _hexToRgb.r,
      g = _hexToRgb.g,
      b = _hexToRgb.b;

  var newJson = json;

  if (asset === -1 || asset === undefined) {
    if (newJson && newJson.layers) {
      newJson.layers[i].shapes[j].it[k].c.k = [toUnitVector(r), toUnitVector(g), toUnitVector(b), a];

      if (typeof opacity === "number") {
        newJson.layers[i].shapes[j].it[k].o.k = opacity;
      }
    }
  } else {
    // eslint-disable-next-line
    if (newJson && newJson.assets) {
      newJson.assets[asset].layers[i].shapes[j].it[k].c.k = [toUnitVector(r), toUnitVector(g), toUnitVector(b), a];

      if (typeof opacity === "number") {
        newJson.assets[asset].layers[i].shapes[j].it[k].o.k = opacity;
      }
    }
  }

  return newJson;
};

exports.replaceColors = replaceColors;