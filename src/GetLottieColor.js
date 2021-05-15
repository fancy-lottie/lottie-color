// main algorithm, it executes a callback on every color it finds
//
const getColors = (tree, cb, asset) => {
  if (tree)
    tree.forEach((layer, i) => {
      if (layer.shapes)
        layer.shapes.forEach((shape, j) => {
          if (shape.it)
            shape.it.forEach((prop, k) => {
              if (["fl", "st"].includes(prop.ty)) {
                const color = prop.c.k;
                const colorAlpha = prop.o.k;
                // eslint-disable-next-line
                let [r, g, b, a] = color;
                r = fromUnitVector(r);
                g = fromUnitVector(g);
                b = fromUnitVector(b);
                const meta = {
                  i,
                  j,
                  k,
                  r,
                  g,
                  b,
                  a,
                  layerName: layer.nm,
                  groupName: shape.nm,
                  propName: prop.nm,
                  asset,
                  color: rgbToHex(r, g, b),
                  colorAlpha,
                };

                if (cb) cb(meta);
              }
            });
        });
    });
};
const fromUnitVector = (n) => Math.round(n * 255);
const rgbToHex = (r, g, b) =>
  `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
const componentToHex = (c) => {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};
const hexToComponents = (hex) =>
  /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

const toUnitVector = (n) => Math.round((n / 255) * 1000) / 1000;
const hexToRgb = (hex) => {
  const rgb = hexToComponents(hex);

  return rgb
    ? {
        r: parseInt(rgb[1], 16),
        g: parseInt(rgb[2], 16),
        b: parseInt(rgb[3], 16),
      }
    : {
        r: 0,
        g: 0,
        b: 0,
      };
};
export const parseColor = (json) => {
  let colorsArr = [];
  if (json && json.layers)
    getColors(json.layers, (color) => colorsArr.push(color));
  if (json && json.assets)
    json.assets.forEach((asset, i) =>
      getColors(asset.layers, (color) => colorsArr.push(color), i)
    );
  return colorsArr;
};

export const replaceColors = (path, newColor, json, opacity) => {
  const { i, j, k, a, asset } = path;
  const { r, g, b } = hexToRgb(newColor);
  const newJson = json;
  if (asset === -1 || asset === undefined) {
    if (newJson && newJson.layers) {
      newJson.layers[i].shapes[j].it[k].c.k = [
        toUnitVector(r),
        toUnitVector(g),
        toUnitVector(b),
        a,
      ];
      if (typeof opacity === "number") {
        newJson.layers[i].shapes[j].it[k].o.k = opacity;
      }
    }
  } else {
    // eslint-disable-next-line
    if (newJson && newJson.assets) {
      newJson.assets[asset].layers[i].shapes[j].it[k].c.k = [
        toUnitVector(r),
        toUnitVector(g),
        toUnitVector(b),
        a,
      ];
      if (typeof opacity === "number") {
        newJson.assets[asset].layers[i].shapes[j].it[k].o.k = opacity;
      }
    }
  }
  return newJson;
};
