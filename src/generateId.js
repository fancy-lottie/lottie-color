// 获取填充、描边、渐变的路径
const getColorPath = (tree, cb, asset) => {
  if (tree)
    tree.forEach((layer, i) => {
      if (layer.shapes)
        layer.shapes.forEach((shape, j) => {
          if (shape.it)
            shape.it.forEach((prop, k) => {
              if (["fl", "st", "gf"].includes(prop.ty)) {
                // eslint-disable-next-line
                const meta = {
                  i,
                  j,
                  k,
                  layerName: layer.nm,
                  groupName: shape.nm,
                  propName: prop.nm,
                  asset,
                };
                if (cb) cb(meta);
              }
            });
        });
    });
};
// 查找所有的路径
export const parseColorPath = (json) => {
  let colorsArr = [];
  if (json && json.layers)
    getColorPath(json.layers, (color) => colorsArr.push(color));
  if (json && json.assets)
    json.assets.forEach((asset, i) =>
      getColorPath(asset.layers, (color) => colorsArr.push(color), i)
    );
  return colorsArr;
};

// 给指定的路径添加 ln 属性
export const AddColorIdUnit = (path, json) => {
  const { i, j, k, asset } = path;
  const newJson = json;
  const uniqueId = `${i}-${j}-${k}-${asset}`;
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

export const generateId = (jsonString) => {
  if (jsonString !== "") {
    const jsonObj = JSON.parse(jsonString);
    const colorPathArr = parseColorPath(jsonObj);
    if (colorPathArr.length) {
      colorPathArr.forEach((item) => {
        AddColorIdUnit(item, jsonObj);
      });
    }
    return JSON.stringify(jsonObj);
  } else {
    return "";
  }
};
