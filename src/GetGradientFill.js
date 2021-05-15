import Color from "color";
function getKeyframes(gradientKeys) {
  if (typeof gradientKeys[0] === "number") {
    return [
      {
        s: gradientKeys,
      },
    ];
  } else {
    return gradientKeys;
  }
}
//  将 [0, 1, 1, 1, 0.507, 0.877, 0.618, 0.618, 1, 0.754, 0.235, 0.235] 这种格式的渐变颜色数组变成 单个的颜色对象
function buildGradientKeyframes(gradientData) {
  const totalPositions = gradientData.p;
  const colors = [];
  const alphas = [];
  const keyframes = getKeyframes(gradientData.k.k);
  keyframes.forEach((gradient) => {
    const gradientValue = gradient.s;
    const hasAlpha = gradientValue.length / 4 !== totalPositions;
    const colorList = [];
    const alphaList = [];
    let count = 0,
      index = 0;
    while (count < totalPositions) {
      index = count * 4;
      colorList.push({
        p: Math.round(100 * gradientValue[index + 0] * 100) / 100,
        r: Math.round(gradientValue[index + 1] * 255 * 100) / 100,
        g: Math.round(gradientValue[index + 2] * 255 * 100) / 100,
        b: Math.round(gradientValue[index + 3] * 255 * 100) / 100,
      });
      count += 1;
    }
    colors.push(colorList);
    if (hasAlpha) {
      count = 0;
      const totalAlphaPositions =
        (gradientValue.length - totalPositions * 4) / 2;
      index = 0;
      while (count < totalAlphaPositions) {
        index = totalPositions * 4 + count * 2;
        alphaList.push({
          p: Math.round(100 * gradientValue[index + 0] * 100) / 100,
          a: Math.round(gradientValue[index + 1] * 100 * 100) / 100,
        });
        count += 1;
      }
      alphas.push(alphaList);
    }
  });
  return {
    colors,
    alphas,
  };
}
// main algorithm, it executes a callback on every color it finds
const getGradientFill = (tree, cb, asset) => {
  if (tree)
    tree.forEach((layer, i) => {
      if (layer.shapes)
        layer.shapes.forEach((shape, j) => {
          if (shape.it)
            shape.it.forEach((prop, k) => {
              if (["gf", "gs"].includes(prop.ty)) {
                const gradientData = prop.g;
                const gradientFillColor = prop.g.k.k;
                const errorColor = [0, 1, 1, 1, 1, 0, 0, 0];
                /*
                排除3种情况
                1、目前只能识别替换2种颜色渐变，所以p要为3
                2、排除lottie渐变导出不正确为[0, 1, 1, 1, 1, 0, 0, 0]的情况
                3、排除不是直线渐变的情况
                */
                if (
                  gradientFillColor !== errorColor &&
                  gradientData.p === 3 &&
                  prop.h === undefined
                ) {
                  // eslint-disable-next-line
                  let colors = buildGradientKeyframes(gradientData).colors;
                  let alphas = buildGradientKeyframes(gradientData).alphas;
                  const meta = {
                    i,
                    j,
                    k,
                    layerName: layer.nm,
                    groupName: shape.nm,
                    propName: prop.nm,
                    asset,
                    colors,
                    alphas,
                    gradientFillColor,
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
export const parseGradientFill = (json) => {
  let colorsArr = [];
  if (json && json.layers)
    getGradientFill(json.layers, (color) => colorsArr.push(color));
  if (json && json.assets)
    json.assets.forEach((asset, i) =>
      getGradientFill(asset.layers, (color) => colorsArr.push(color), i)
    );
  return colorsArr;
};

const getMiddleRgb = (startColor, endColor, step) => {
  // 计算R\G\B每一步的差值
  const rStep = (endColor[0] - startColor[0]) / step,
    gStep = (endColor[1] - startColor[1]) / step,
    bStep = (endColor[2] - startColor[2]) / step;

  const gradientColorArr = [];
  for (let i = 0; i < step; i++) {
    // 计算每一步的hex值
    gradientColorArr.push([
      parseInt(rStep * i + startColor[0]),
      parseInt(gStep * i + startColor[1]),
      parseInt(bStep * i + startColor[2]),
    ]);
  }
  return gradientColorArr;
};

/**  生成lottie中的渐变颜色数据
  @param {startValue} obj color obj contain opacity、color、position
  @param {endValue} obj color obj contain opacity、color、position
  @param {colors} array color array contain three array
  @param {alphas} array alpha  array contain three array
  
*/
export const generalGradientK = (startValue, endValue, colors, alphas) => {
  // 确定颜色位置点
  const colorPosition1 = colors[0][0].p;
  const colorPosition2 = colors[0][1].p;
  const colorPosition3 = colors[0][2].p;

  // 算出中间点 position2 的 rgb 值
  const middleRgb = getMiddleRgb(
    startValue.color,
    endValue.color,
    parseInt((colorPosition3 - colorPosition1) * 10)
  )[parseInt((colorPosition2 - colorPosition1) * 10)];

  // 计算alpha值的位置点
  let alphaPosition1 = 0;
  let alphaPosition2 = 0;
  let alphaPosition3 = 0;
  if (alphas.length > 0) {
    alphaPosition1 = alphas[0][0].p;
    alphaPosition2 = alphas[0][1].p;
    alphaPosition3 = alphas[0][2].p;
  } else {
    alphaPosition1 = colorPosition1;
    alphaPosition2 = colorPosition2;
    alphaPosition3 = colorPosition3;
  }
  // 计算中间的alpha值
  const middleAlpha = (startValue.opacity + endValue.opacity) / 2;

  // 生成K值
  let K = [
    colorPosition1 / 100,
    startValue.color[0] / 255,
    startValue.color[1] / 255,
    startValue.color[2] / 255,
    colorPosition2 / 100,
    middleRgb[0] / 255,
    middleRgb[1] / 255,
    middleRgb[2] / 255,
    colorPosition3 / 100,
    endValue.color[0] / 255,
    endValue.color[1] / 255,
    endValue.color[2] / 255,
    alphaPosition1 / 100,
    startValue.opacity,
    alphaPosition2 / 100,
    middleAlpha,
    alphaPosition3 / 100,
    endValue.opacity,
  ];
  // 将K值保留3位小数
  const gradientK = K.map((item) => {
    return Math.round(item * 1000) / 1000;
  });
  return gradientK;
};

/** 替换渐变颜色
  @param {path} obj - path obj contain i j k asset
  @param {newColor} obj - color obj  contain startValue/endValue/colors/alphas
  @param {json} obj - json obj
*/
export const replaceGradientFill = (path, newColor, json) => {
  const { i, j, k, asset } = path;
  const { startValue, endValue, colors, alphas } = newColor;
  const gradientK = generalGradientK(startValue, endValue, colors, alphas);
  const newJson = json;
  if (asset === -1 || asset === undefined) {
    if (newJson && newJson.layers)
      newJson.layers[i].shapes[j].it[k].g.k.k = gradientK;
  } else {
    // eslint-disable-next-line
    if (newJson && newJson.assets)
      newJson.assets[asset].layers[i].shapes[j].it[k].g.k.k = gradientK;
  }
  return newJson;
};
/** 生成rgba格式的颜色
  @param {value} obj - color obj contain color array and opacity
*/
export const rgb2rgba = (value) => {
  const color = `rgba(${value.color[0]},${value.color[1]},${value.color[2]},${value.opacity})`;
  return color;
};

/** 生成 web css 渐变背景
  @param {startValue} color - rgba color string  eg:(255,1,55,10)
  @param {startPosition} number - color position  eg:100
  @param {endValue} color - rgba color string  eg:(255,1,55,10)
  @param {endPosition} number - color position  eg:100
*/
export const generatorWebGradient = (
  startValue,
  startPosition,
  endValue,
  endPosition
) => {
  const gradient = `linear-gradient(90deg,${startValue} ${startPosition}%, ${endValue} ${endPosition}%);`;
  return gradient;
};

/**  生成rgb数组的颜色格式
  @param {color} color - hex color string  eg:#000000
*/
export const hex2rgbArr = (color) => {
  try {
    const colorObject = Color(color);
    const rgbArr = colorObject.rgb().array();
    return rgbArr;
  } catch {
    return null;
  }
};

/**  rgb array to rgb string
  @param {color} color - rgb array color   eg:[255,255,255]
*/
export const rgbArr2rgb = (color) => {
  const rgb = `rgb(${color[0]},${color[1]},${color[2]})`;
  return rgb;
};

/**  rgb array to rgb string
  @param {color} color - rgb array color   eg:[255,255,255]
*/
export const rgbArr2hex = (rgb) => {
  const color = Color.rgb(rgb);
  const hexColor = color.hex();
  return hexColor;
};
/**  判断两个数组是否一致
  @param {arr1} array -  array    eg:[255,255,255]
  @param {arr2} array -  array    eg:[255,255,255]
*/
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
      for (let i in arr1) {
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
export function replaceGradientBycolor(source, target, obj) {
  if (obj && obj.g === true) {
    return;
  }
  if (obj && obj.g && obj.g.k && obj.g.k.k) {
    if (ArrayIsEqual(source, obj.g.k.k)) {
      obj.g.k.k = target;
    }
  }
  for (var key in obj) {
    if (typeof obj[key] === "object") {
      replaceGradientBycolor(source, target, obj[key]);
    }
  }
  return obj;
}
