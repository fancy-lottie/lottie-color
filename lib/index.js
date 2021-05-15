"use strict";

var _Gradient = _interopRequireDefault(require("../assets/Gradient.json"));

var _GetGradientFill = require("./GetGradientFill");

var _GetLottieColor = require("./GetLottieColor");

var _ParseColorByColor = require("./ParseColorByColor");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
  case01 获取渐变色
  目前由于某种限制，暂时只能获取双色渐变。绝大部分情况下，设计师的渐变也是双色渐变。
  由于是双色渐变，按理说只有两种颜色，但是Lottie会在两个颜色之间再生成一个颜色。
  所以，我们读取的时候要忽略中间的那个颜色，但是替换颜色的时候，需要自动生成。
*/
var gradientColor = (0, _GetGradientFill.parseGradientFill)(_Gradient["default"]);
var stringColor = JSON.stringify(gradientColor);
console.log("stringColor", stringColor);
console.log(""); // stringColor output
// [
//   {
//     i: 0,
//     j: 0,
//     k: 1,
//     layerName: "Shape Layer 1",
//     groupName: "Rectangle 1",
//     propName: "Gradient Fill 1",
//     colors: [
//       [
//         { p: 0, r: 0, g: 38.76, b: 175.7 },
//         { p: 50, r: 19.13, g: 146.88, b: 193.55 },
//         { p: 100, r: 38.5, g: 255, b: 211.65 },
//       ],
//     ],
//     alphas: [
//       [
//         { p: 0, a: 82 },
//         { p: 50, a: 88.5 },
//         { p: 100, a: 95 },
//       ],
//     ],
//     gradientFillColor: [
//       0, 0, 0.152, 0.689, 0.5, 0.075, 0.576, 0.759, 1, 0.151, 1, 0.83, 0, 0.82,
//       0.5, 0.885, 1, 0.95,
//     ],
//   },
// ];
// 生成css可以用的web颜色数据，用于显示渐变颜色

var gradientObj = {
  i: 0,
  j: 0,
  k: 1,
  layerName: "Shape Layer 1",
  groupName: "Rectangle 1",
  propName: "Gradient Fill 1",
  colors: [[{
    p: 0,
    r: 0,
    g: 38.76,
    b: 175.7
  }, {
    p: 50,
    r: 19.13,
    g: 146.88,
    b: 193.55
  }, {
    p: 100,
    r: 38.5,
    g: 255,
    b: 211.65
  }]],
  alphas: [[{
    p: 0,
    a: 82
  }, {
    p: 50,
    a: 88.5
  }, {
    p: 100,
    a: 95
  }]],
  gradientFillColor: [0, 0, 0.152, 0.689, 0.5, 0.075, 0.576, 0.759, 1, 0.151, 1, 0.83, 0, 0.82, 0.5, 0.885, 1, 0.95]
};
var startColor = [gradientObj.colors[0][0].r, gradientObj.colors[0][0].g, gradientObj.colors[0][0].b];
var endColor = [gradientObj.colors[0][2].r, gradientObj.colors[0][2].g, gradientObj.colors[0][2].b];
var startOpacity = 1;
var endOpacity = 1;

if (gradientObj.alphas.length > 0) {
  startOpacity = gradientObj.alphas[0][0].a / 100;
  endOpacity = gradientObj.alphas[0][2].a / 100;
}

var startValue = {
  color: startColor,
  opacity: startOpacity
};
var endValue = {
  color: endColor,
  opacity: endOpacity
};
var startPosition = gradientObj.colors[0][0].p;
var endPosition = gradientObj.colors[0][2].p;
var webGradientColor = (0, _GetGradientFill.generatorWebGradient)((0, _GetGradientFill.rgb2rgba)(startValue), startPosition, (0, _GetGradientFill.rgb2rgba)(endValue), endPosition);
console.log("webGradientColor", webGradientColor);
console.log(""); // output
// linear-gradient(90deg,rgba(0,38.76,175.7,0.82) 0%, rgba(38.5,255,211.65,0.95) 100%);

/*
  case02
  替换渐变色-点对点替换，就是根据该渐变色的位置替换
*/

var newGradeintColor = {
  startValue: startValue,
  endValue: endValue,
  colors: gradientObj.colors,
  alphas: gradientObj.alphas
};
var path = {
  i: gradientObj.i,
  j: gradientObj.j,
  k: gradientObj.k,
  asset: gradientObj.asset
};
var newJson = (0, _GetGradientFill.replaceGradientFill)(path, newGradeintColor, _Gradient["default"]);
console.log(JSON.stringify(newJson));
/*
  case03
  替换渐变色-色值替换，就是根据该渐变色的位置替换
*/

var sourceGradientK = gradientObj.gradientFillColor;
var targetGradientK = [0, 0, 0.152, 0.689, 0.5, 0.075, 0.576, 0.759, 1, 0.151, 1, 0.83, 0, 0.82, 0.5, 0.885, 1, 0.2];
var newGradientJson = (0, _GetGradientFill.replaceGradientBycolor)(sourceGradientK, targetGradientK, _Gradient["default"]);
console.log(JSON.stringify(newGradientJson));
/*
  case04
  获取所有的纯色
*/

var fillColor = (0, _GetLottieColor.parseColor)(_Gradient["default"]);
console.log(fillColor);
/*
  case05
  替换指定位置的纯色
*/

var fillPath = {
  i: 0,
  j: 0,
  k: 3,
  a: 75,
  asset: undefined
};
var newColor = {
  r: 255,
  g: 255,
  b: 255
};
var newFillJson = (0, _GetLottieColor.replaceColors)(fillPath, newColor, _Gradient["default"]);
console.log(JSON.stringify(newFillJson));
/*
  case05
  替换同一色值的纯色
*/

var newHexColor = "#0099FF";
var sourceHexColor = "#0099DD";
var newFillJson1 = (0, _ParseColorByColor.replaceColor)(sourceHexColor, newHexColor, _Gradient["default"]);
console.log(JSON.stringify(newFillJson1));