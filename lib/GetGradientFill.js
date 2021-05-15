"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replaceGradientBycolor = replaceGradientBycolor;
exports.rgbArr2hex = exports.rgbArr2rgb = exports.hex2rgbArr = exports.generatorWebGradient = exports.rgb2rgba = exports.replaceGradientFill = exports.generalGradientK = exports.parseGradientFill = void 0;

var _color = _interopRequireDefault(require("color"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function getKeyframes(gradientKeys) {
  if (typeof gradientKeys[0] === "number") {
    return [{
      s: gradientKeys
    }];
  } else {
    return gradientKeys;
  }
} //  将 [0, 1, 1, 1, 0.507, 0.877, 0.618, 0.618, 1, 0.754, 0.235, 0.235] 这种格式的渐变颜色数组变成 单个的颜色对象


function buildGradientKeyframes(gradientData) {
  var totalPositions = gradientData.p;
  var colors = [];
  var alphas = [];
  var keyframes = getKeyframes(gradientData.k.k);
  keyframes.forEach(function (gradient) {
    var gradientValue = gradient.s;
    var hasAlpha = gradientValue.length / 4 !== totalPositions;
    var colorList = [];
    var alphaList = [];
    var count = 0,
        index = 0;

    while (count < totalPositions) {
      index = count * 4;
      colorList.push({
        p: Math.round(100 * gradientValue[index + 0] * 100) / 100,
        r: Math.round(gradientValue[index + 1] * 255 * 100) / 100,
        g: Math.round(gradientValue[index + 2] * 255 * 100) / 100,
        b: Math.round(gradientValue[index + 3] * 255 * 100) / 100
      });
      count += 1;
    }

    colors.push(colorList);

    if (hasAlpha) {
      count = 0;
      var totalAlphaPositions = (gradientValue.length - totalPositions * 4) / 2;
      index = 0;

      while (count < totalAlphaPositions) {
        index = totalPositions * 4 + count * 2;
        alphaList.push({
          p: Math.round(100 * gradientValue[index + 0] * 100) / 100,
          a: Math.round(gradientValue[index + 1] * 100 * 100) / 100
        });
        count += 1;
      }

      alphas.push(alphaList);
    }
  });
  return {
    colors: colors,
    alphas: alphas
  };
} // main algorithm, it executes a callback on every color it finds


var getGradientFill = function getGradientFill(tree, cb, asset) {
  if (tree) tree.forEach(function (layer, i) {
    if (layer.shapes) layer.shapes.forEach(function (shape, j) {
      if (shape.it) shape.it.forEach(function (prop, k) {
        if (["gf", "gs"].includes(prop.ty)) {
          var gradientData = prop.g;
          var gradientFillColor = prop.g.k.k;
          var errorColor = [0, 1, 1, 1, 1, 0, 0, 0];
          /*
          排除3种情况
          1、目前只能识别替换2种颜色渐变，所以p要为3
          2、排除lottie渐变导出不正确为[0, 1, 1, 1, 1, 0, 0, 0]的情况
          3、排除不是直线渐变的情况
          */

          if (gradientFillColor !== errorColor && gradientData.p === 3 && prop.h === undefined) {
            // eslint-disable-next-line
            var colors = buildGradientKeyframes(gradientData).colors;
            var alphas = buildGradientKeyframes(gradientData).alphas;
            var meta = {
              i: i,
              j: j,
              k: k,
              layerName: layer.nm,
              groupName: shape.nm,
              propName: prop.nm,
              asset: asset,
              colors: colors,
              alphas: alphas,
              gradientFillColor: gradientFillColor
            };
            if (cb) cb(meta);
          }
        }
      });
    });
  });
};
/**  获取lottie中所有双色渐变颜色
  @param {startValue} obj Lottie json 
  
*/


var parseGradientFill = function parseGradientFill(json) {
  var colorsArr = [];
  if (json && json.layers) getGradientFill(json.layers, function (color) {
    return colorsArr.push(color);
  });
  if (json && json.assets) json.assets.forEach(function (asset, i) {
    return getGradientFill(asset.layers, function (color) {
      return colorsArr.push(color);
    }, i);
  });
  return colorsArr;
};

exports.parseGradientFill = parseGradientFill;

var getMiddleRgb = function getMiddleRgb(startColor, endColor, step) {
  // 计算R\G\B每一步的差值
  var rStep = (endColor[0] - startColor[0]) / step,
      gStep = (endColor[1] - startColor[1]) / step,
      bStep = (endColor[2] - startColor[2]) / step;
  var gradientColorArr = [];

  for (var i = 0; i < step; i++) {
    // 计算每一步的hex值
    gradientColorArr.push([parseInt(rStep * i + startColor[0]), parseInt(gStep * i + startColor[1]), parseInt(bStep * i + startColor[2])]);
  }

  return gradientColorArr;
};
/**  生成lottie中的渐变颜色数据
  @param {startValue} obj color obj contain opacity、color、position
  @param {endValue} obj color obj contain opacity、color、position
  @param {colors} array color array contain three array
  @param {alphas} array alpha  array contain three array
  
*/


var generalGradientK = function generalGradientK(startValue, endValue, colors, alphas) {
  // 确定颜色位置点
  var colorPosition1 = colors[0][0].p;
  var colorPosition2 = colors[0][1].p;
  var colorPosition3 = colors[0][2].p; // 算出中间点 position2 的 rgb 值

  var middleRgb = getMiddleRgb(startValue.color, endValue.color, parseInt((colorPosition3 - colorPosition1) * 10))[parseInt((colorPosition2 - colorPosition1) * 10)]; // 计算alpha值的位置点

  var alphaPosition1 = 0;
  var alphaPosition2 = 0;
  var alphaPosition3 = 0;

  if (alphas.length > 0) {
    alphaPosition1 = alphas[0][0].p;
    alphaPosition2 = alphas[0][1].p;
    alphaPosition3 = alphas[0][2].p;
  } else {
    alphaPosition1 = colorPosition1;
    alphaPosition2 = colorPosition2;
    alphaPosition3 = colorPosition3;
  } // 计算中间的alpha值


  var middleAlpha = (startValue.opacity + endValue.opacity) / 2; // 生成K值

  var K = [colorPosition1 / 100, startValue.color[0] / 255, startValue.color[1] / 255, startValue.color[2] / 255, colorPosition2 / 100, middleRgb[0] / 255, middleRgb[1] / 255, middleRgb[2] / 255, colorPosition3 / 100, endValue.color[0] / 255, endValue.color[1] / 255, endValue.color[2] / 255, alphaPosition1 / 100, startValue.opacity, alphaPosition2 / 100, middleAlpha, alphaPosition3 / 100, endValue.opacity]; // 将K值保留3位小数

  var gradientK = K.map(function (item) {
    return Math.round(item * 1000) / 1000;
  });
  return gradientK;
};
/** 替换渐变颜色
  @param {path} obj - path obj contain i j k asset
  @param {newColor} obj - color obj  contain startValue/endValue/colors/alphas
  @param {json} obj - json obj
*/


exports.generalGradientK = generalGradientK;

var replaceGradientFill = function replaceGradientFill(path, newColor, json) {
  var i = path.i,
      j = path.j,
      k = path.k,
      asset = path.asset;
  var startValue = newColor.startValue,
      endValue = newColor.endValue,
      colors = newColor.colors,
      alphas = newColor.alphas;
  var gradientK = generalGradientK(startValue, endValue, colors, alphas);
  var newJson = json;

  if (asset === -1 || asset === undefined) {
    if (newJson && newJson.layers) newJson.layers[i].shapes[j].it[k].g.k.k = gradientK;
  } else {
    // eslint-disable-next-line
    if (newJson && newJson.assets) newJson.assets[asset].layers[i].shapes[j].it[k].g.k.k = gradientK;
  }

  return newJson;
};
/** 生成rgba格式的颜色
  @param {value} obj - color obj contain color array and opacity
*/


exports.replaceGradientFill = replaceGradientFill;

var rgb2rgba = function rgb2rgba(value) {
  var color = "rgba(".concat(value.color[0], ",").concat(value.color[1], ",").concat(value.color[2], ",").concat(value.opacity, ")");
  return color;
};
/** 生成 web css 渐变背景
  @param {startValue} color - rgba color string  eg:(255,1,55,10)
  @param {startPosition} number - color position  eg:100
  @param {endValue} color - rgba color string  eg:(255,1,55,10)
  @param {endPosition} number - color position  eg:100
*/


exports.rgb2rgba = rgb2rgba;

var generatorWebGradient = function generatorWebGradient(startValue, startPosition, endValue, endPosition) {
  var gradient = "linear-gradient(90deg,".concat(startValue, " ").concat(startPosition, "%, ").concat(endValue, " ").concat(endPosition, "%);");
  return gradient;
};
/**  生成rgb数组的颜色格式
  @param {color} color - hex color string  eg:#000000
*/


exports.generatorWebGradient = generatorWebGradient;

var hex2rgbArr = function hex2rgbArr(color) {
  try {
    var colorObject = (0, _color["default"])(color);
    var rgbArr = colorObject.rgb().array();
    return rgbArr;
  } catch (_unused) {
    return null;
  }
};
/**  rgb array to rgb string
  @param {color} color - rgb array color   eg:[255,255,255]
*/


exports.hex2rgbArr = hex2rgbArr;

var rgbArr2rgb = function rgbArr2rgb(color) {
  var rgb = "rgb(".concat(color[0], ",").concat(color[1], ",").concat(color[2], ")");
  return rgb;
};
/**  rgb array to rgb string
  @param {color} color - rgb array color   eg:[255,255,255]
*/


exports.rgbArr2rgb = rgbArr2rgb;

var rgbArr2hex = function rgbArr2hex(rgb) {
  var color = _color["default"].rgb(rgb);

  var hexColor = color.hex();
  return hexColor;
};
/**  判断两个数组是否一致
  @param {arr1} array -  array    eg:[255,255,255]
  @param {arr2} array -  array    eg:[255,255,255]
*/


exports.rgbArr2hex = rgbArr2hex;

function ArrayIsEqual(arr1, arr2) {
  //判断2个数组是否相等
  if (arr1 === arr2) {
    //如果2个数组对应的指针相同，那么肯定相等，同时也对比一下类型
    return true;
  } else {
    if (arr1.length !== arr2.length) {
      return false;
    } else {
      //长度相同
      for (var i in arr1) {
        //循环遍历对比每个位置的元素
        if (arr1[i] !== arr2[i]) {
          //只要出现一次不相等，那么2个数组就不相等
          return false;
        }
      } //for循环完成，没有出现不相等的情况，那么2个数组相等


      return true;
    }
  }
}
/**  替换渐变颜色值
  @param {source} array -  ae gradient array    eg:[0, 1, 1, 1, 0.507, 0.877, 0.618, 0.618, 1, 0.754, 0.235, 0.235]
  @param {target} array -   ae gradient array    eg:[0, 1, 1, 1, 0.507, 0.877, 0.618, 0.618, 1, 0.754, 0.235, 0.235]
  @param {obj} obj -   lottie json obj    
*/


function replaceGradientBycolor(source, target, obj) {
  if (obj && obj.g === true) {
    return;
  }

  if (obj && obj.g && obj.g.k && obj.g.k.k) {
    if (ArrayIsEqual(source, obj.g.k.k)) {
      obj.g.k.k = target;
    }
  }

  for (var key in obj) {
    if (_typeof(obj[key]) === "object") {
      replaceGradientBycolor(source, target, obj[key]);
    }
  }

  return obj;
}