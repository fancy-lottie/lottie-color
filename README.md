# 简介

这是一个支持解析Lottie json中纯色和渐变色的库。可以获取json中的双色渐变色以及纯色，还可以替换纯色和渐变色，支持指定位置替换以及按色值替换。

# 运行

运行如下代码块，可以运行src/index的代码

```javascript
yarn && yarn build
```

# 功能解析



## case01 获取渐变色

目前由于某种限制，暂时只能获取双色渐变。绝大部分情况下，设计师的渐变也是双色渐变。

由于是双色渐变，按理说只有两种颜色，但是

Lottie会在两个颜色之间再生成一个颜色。

所以，我们读取的时候要忽略中间的那个颜色，但是替换颜色的时候，需要自动生成。



```javascript
import GradientAnimation from "../assets/Gradient.json";
import {
  parseGradientFill,
  generatorWebGradient,
  rgb2rgba,
  replaceGradientBycolor,
  replaceGradientFill,
} from "./GetGradientFill";
const gradientColor = parseGradientFill(GradientAnimation);
const stringColor = JSON.stringify(gradientColor);
console.log("stringColor", stringColor);
console.log("");
// stringColor output

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
```

## case02 替换渐变色

点对点替换，就是根据该渐变色的位置替换

```javascript
import GradientAnimation from "../assets/Gradient.json";
import {
  parseGradientFill,
  generatorWebGradient,
  rgb2rgba,
  replaceGradientBycolor,
  replaceGradientFill,
} from "./GetGradientFill";

// 生成css可以用的web颜色数据，用于显示渐变颜色

const gradientObj = {
  i: 0,
  j: 0,
  k: 1,
  layerName: "Shape Layer 1",
  groupName: "Rectangle 1",
  propName: "Gradient Fill 1",
  colors: [
    [
      { p: 0, r: 0, g: 38.76, b: 175.7 },
      { p: 50, r: 19.13, g: 146.88, b: 193.55 },
      { p: 100, r: 38.5, g: 255, b: 211.65 },
    ],
  ],
  alphas: [
    [
      { p: 0, a: 82 },
      { p: 50, a: 88.5 },
      { p: 100, a: 95 },
    ],
  ],
  gradientFillColor: [
    0, 0, 0.152, 0.689, 0.5, 0.075, 0.576, 0.759, 1, 0.151, 1, 0.83, 0, 0.82,
    0.5, 0.885, 1, 0.95,
  ],
};
const startColor = [
  gradientObj.colors[0][0].r,
  gradientObj.colors[0][0].g,
  gradientObj.colors[0][0].b,
];
const endColor = [
  gradientObj.colors[0][2].r,
  gradientObj.colors[0][2].g,
  gradientObj.colors[0][2].b,
];
let startOpacity = 1;
let endOpacity = 1;
if (gradientObj.alphas.length > 0) {
  startOpacity = gradientObj.alphas[0][0].a / 100;
  endOpacity = gradientObj.alphas[0][2].a / 100;
}
const startValue = { color: startColor, opacity: startOpacity };
const endValue = { color: endColor, opacity: endOpacity };

const startPosition = gradientObj.colors[0][0].p;
const endPosition = gradientObj.colors[0][2].p;

const webGradientColor = generatorWebGradient(
  rgb2rgba(startValue),
  startPosition,
  rgb2rgba(endValue),
  endPosition
);
console.log("webGradientColor", webGradientColor);
console.log("");
// output
// linear-gradient(90deg,rgba(0,38.76,175.7,0.82) 0%, rgba(38.5,255,211.65,0.95) 100%);

/*
  case02
  替换渐变色-点对点替换，就是根据该渐变色的位置替换
*/

const newGradeintColor = {
  startValue,
  endValue,
  colors: gradientObj.colors,
  alphas: gradientObj.alphas,
};
const path = {
  i: gradientObj.i,
  j: gradientObj.j,
  k: gradientObj.k,
  asset: gradientObj.asset,
};
const newJson = replaceGradientFill(path, newGradeintColor, GradientAnimation);
console.log(JSON.stringify(newJson));

```

按色值替换渐变色

```javascript
/*
  替换渐变色-色值替换，就是根据该渐变色的位置替换
*/
import GradientAnimation from "../assets/Gradient.json";
import {
  parseGradientFill,
  generatorWebGradient,
  rgb2rgba,
  replaceGradientBycolor,
  replaceGradientFill,
} from "./GetGradientFill";
const gradientObj = {
  i: 0,
  j: 0,
  k: 1,
  layerName: "Shape Layer 1",
  groupName: "Rectangle 1",
  propName: "Gradient Fill 1",
  colors: [
    [
      { p: 0, r: 0, g: 38.76, b: 175.7 },
      { p: 50, r: 19.13, g: 146.88, b: 193.55 },
      { p: 100, r: 38.5, g: 255, b: 211.65 },
    ],
  ],
  alphas: [
    [
      { p: 0, a: 82 },
      { p: 50, a: 88.5 },
      { p: 100, a: 95 },
    ],
  ],
  gradientFillColor: [
    0, 0, 0.152, 0.689, 0.5, 0.075, 0.576, 0.759, 1, 0.151, 1, 0.83, 0, 0.82,
    0.5, 0.885, 1, 0.95,
  ],
};
const sourceGradientK = gradientObj.gradientFillColor;
const targetGradientK = [
  0, 0, 0.152, 0.689, 0.5, 0.075, 0.576, 0.759, 1, 0.151, 1, 0.83, 0, 0.82, 0.5,
  0.885, 1, 0.2,
];

const newGradientJson = replaceGradientBycolor(
  sourceGradientK,
  targetGradientK,
  GradientAnimation
);
console.log(JSON.stringify(newGradientJson));
```

## case03 获取纯色

获取json中所有的纯色

```javascript
import GradientAnimation from "../assets/Gradient.json";
import { parseColor, replaceColors } from "./GetLottieColor";
const fillColor = parseColor(GradientAnimation);
console.log(fillColor);
```

## case04 替换纯色

替换json中的纯色

```javascript
import { replaceColor } from "./ParseColorByColor";
import { generateId } from "./GenerateId";
import GradientAnimation from "../assets/Gradient.json";
/*
  case05
  替换指定位置的纯色
*/
const fillPath = { i: 0, j: 0, k: 3, a: 75, asset: undefined };
const newColor = { r: 255, g: 255, b: 255 };
const newFillJson = replaceColors(fillPath, newColor, GradientAnimation);
console.log(JSON.stringify(newFillJson));

/*
  case05
  替换同一色值的纯色
*/

const newHexColor = "#0099FF";
const sourceHexColor = "#0099DD";
const newFillJson1 = replaceColor(
  sourceHexColor,
  newHexColor,
  GradientAnimation
);
console.log(JSON.stringify(newFillJson1));
```

## case05 给颜色增加ln属性

给填充颜色、描边颜色以及渐变色添加ln属性，这样在点击Dom元素的时候，可以获取dom元素的id，id就是ln属性。这样就可以把动画和颜色关联起来

```javascript
import GradientAnimation from "../assets/Gradient.json";
import { generateId } from "./GenerateId";
const newJsonWithId = generateId(GradientAnimation);
console.log(JSON.stringify(newJsonWithId));

```

