"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getColors = exports.flatten = exports.replaceColor = exports.colorify = void 0;

exports.colorify = function (destColors, lottie) {
  if (destColors === void 0) {
    destColors = [];
  }

  var modifiedColors = [];

  for (var _i = 0, destColors_1 = destColors; _i < destColors_1.length; _i++) {
    var color = destColors_1[_i];
    modifiedColors.push(convertColorToLottieColor(color));
  }

  var newLottie = modifyColors(modifiedColors, lodash_clonedeep_1["default"](lottie));
  return newLottie;
};

var convertColorToLottieColor = function convertColorToLottieColor(color) {
  if (typeof color === "string" && color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);

    if (!result) {
      throw new Error("Color can be only hex or rgb array (ex. [10,20,30])");
    }

    return [(parseInt(result[1], 16) / 255).toFixed(12) - 0, (parseInt(result[2], 16) / 255).toFixed(12) - 0, (parseInt(result[3], 16) / 255).toFixed(12) - 0, 1];
  } else if (_typeof(color) === "object" && color.length === 3 && color.every(function (item) {
    return item >= 0 && item <= 255;
  })) {
    return [Math.round(color[0] / 255 * 100) / 100, Math.round(color[1] / 255 * 100) / 100, Math.round(color[2] / 255 * 100) / 100, 1];
  } else if (!color) {
    return undefined;
  } else {
    throw new Error("Color can be only hex or rgb array (ex. [10,20,30])");
  }
};

exports.replaceColor = function (sourceColor, targetColor, lottieObj) {
  var genSourceLottieColor = convertColorToLottieColor(sourceColor);
  var genTargetLottieColor = convertColorToLottieColor(targetColor);

  if (!genSourceLottieColor || !genTargetLottieColor) {
    throw new Error("Proper colors must be used for both source and target");
  }

  function doReplace(sourceLottieColor, targetLottieColor, obj) {
    if (obj && obj.c === true) {
      return;
    }

    if (obj && obj.c && obj.c.k) {
      if (!isNaN(obj.c.k[0])) {
        if (sourceLottieColor[0].toFixed(2) === obj.c.k[0].toFixed(2) && sourceLottieColor[1].toFixed(2) === obj.c.k[1].toFixed(2) && sourceLottieColor[2].toFixed(2) === obj.c.k[2].toFixed(2)) {
          obj.c.k = targetLottieColor;
        }
      }
    }

    for (var key in obj) {
      if (_typeof(obj[key]) === "object") {
        doReplace(sourceLottieColor, targetLottieColor, obj[key]);
      }
    }

    return obj;
  }

  return doReplace(genSourceLottieColor, genTargetLottieColor, lottieObj);
};

exports.flatten = function (targetColor, lottieObj) {
  var genTargetLottieColor = convertColorToLottieColor(targetColor);

  if (!genTargetLottieColor) {
    throw new Error("Proper colors must be used for target");
  }

  function doFlatten(targetLottieColor, obj) {
    if (obj.c && obj.c.k) {
      obj.c.k = targetLottieColor;
    }

    for (var key in obj) {
      if (_typeof(obj[key]) === "object") {
        doFlatten(targetLottieColor, obj[key]);
      }
    }

    return obj;
  }

  return doFlatten(genTargetLottieColor, lodash_clonedeep_1["default"](lottieObj));
};

var modifyColors = function modifyColors(colorsArray, lottieObj) {
  var i = 0;

  function doModify(colors, obj) {
    if (obj.c && obj.c.k) {
      if (colors[i]) {
        obj.c.k = colors[i];
      }

      i++;
    }

    for (var key in obj) {
      if (_typeof(obj[key]) === "object") {
        doModify(colors, obj[key]);
      }
    }

    return obj;
  }

  return doModify(colorsArray, lottieObj);
};

var convertLottieColorToRgb = function convertLottieColorToRgb(lottieColor) {
  return [Math.round(lottieColor[0] * 255), Math.round(lottieColor[1] * 255), Math.round(lottieColor[2] * 255), 1];
};

exports.getColors = function (lottieObj) {
  var res = [];

  function doGet(obj) {
    if (obj && obj.c === true) {
      return;
    }

    if (obj && obj.c && obj.c.k) {
      res.push(convertLottieColorToRgb(obj.c.k));
    }

    for (var key in obj) {
      if (_typeof(obj[key]) === "object") {
        doGet(obj[key]);
      }
    }

    return res;
  }

  if (lottieObj.layers) {
    doGet(lottieObj.layers);
  } else if (lottieObj.assets) {
    doGet(lottieObj.assets);
  }

  return res;
};