"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateId = exports.AddColorIdUnit = exports.parseColorPath = void 0;

// 获取填充或者描边的路径
var getColorPath = function getColorPath(tree, cb, asset) {
  if (tree) tree.forEach(function (layer, i) {
    if (layer.shapes) layer.shapes.forEach(function (shape, j) {
      if (shape.it) shape.it.forEach(function (prop, k) {
        if (["fl", "st", "gf"].includes(prop.ty)) {
          // eslint-disable-next-line
          var meta = {
            i: i,
            j: j,
            k: k,
            layerName: layer.nm,
            groupName: shape.nm,
            propName: prop.nm,
            asset: asset
          };
          if (cb) cb(meta);
        }
      });
    });
  });
}; // 查找所有的路径


var parseColorPath = function parseColorPath(json) {
  var colorsArr = [];
  if (json && json.layers) getColorPath(json.layers, function (color) {
    return colorsArr.push(color);
  });
  if (json && json.assets) json.assets.forEach(function (asset, i) {
    return getColorPath(asset.layers, function (color) {
      return colorsArr.push(color);
    }, i);
  });
  return colorsArr;
}; // 给指定的路径添加 ln 属性


exports.parseColorPath = parseColorPath;

var AddColorIdUnit = function AddColorIdUnit(path, json) {
  var i = path.i,
      j = path.j,
      k = path.k,
      asset = path.asset;
  var newJson = json;
  var uniqueId = "".concat(i, "-").concat(j, "-").concat(k, "-").concat(asset);

  if (asset === -1 || asset === undefined) {
    if (newJson && newJson.layers) {
      newJson.layers[i].shapes[j].it[k]["ln"] = uniqueId;
    }
  } else {
    // eslint-disable-next-line
    if (newJson && newJson.assets) {
      newJson.assets[asset].layers[i].shapes[j].it[k]["ln"] = uniqueId;
    }
  }

  return newJson;
};

exports.AddColorIdUnit = AddColorIdUnit;

var generateId = function generateId(jsonString) {
  if (jsonString !== "") {
    var jsonObj = JSON.parse(jsonString);
    var colorPathArr = parseColorPath(jsonObj);

    if (colorPathArr.length) {
      colorPathArr.forEach(function (item) {
        AddColorIdUnit(item, jsonObj);
      });
    }

    return JSON.stringify(jsonObj);
  } else {
    return "";
  }
};

exports.generateId = generateId;