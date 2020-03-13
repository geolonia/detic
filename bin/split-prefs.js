const fs = require("fs");
const pkgDir = require("pkg-dir");
const JSONStream = require("JSONStream");

const getbbox = coordinates => {
  const { top, right, bottom, left } = coordinates.reduce(
    (prev, [lng, lat]) => {
      (prev.top === void 0 || prev.top < lat) && (prev.top = lat);
      (prev.right === void 0 || prev.right < lng) && (prev.right = lng);
      (prev.bottom === void 0 || prev.bottom > lat) && (prev.bottom = lat);
      (prev.left === void 0 || prev.left > lng) && (prev.left = lng);
      return prev;
    },
    {
      top: void 0,
      right: void 0,
      bottom: void 0,
      left: void 0
    }
  );
  return [
    [left, top],
    [right, bottom]
  ];
};

const main = async () => {
  const basedir = await pkgDir();
  const filename = `${basedir}/${process.argv[2]}`;
  const bboxMap = {};
  fs.createReadStream(filename)
    .pipe(JSONStream.parse("features.*"))
    .on("data", data => {
      console.log(data);
      console.log(`${basedir}/prefs/${data.properties.id}.geojson`);
      const coordinates =
        data.geometry.type === "MultiPolygon"
          ? data.geometry.coordinates.flat().flat()
          : data.geometry.coordinates.flat();

      const bbox = getbbox(coordinates);
      bboxMap[data.properties.id] = bbox;
      fs.writeFile(
        `${basedir}/prefs/${data.properties.id}.geojson`,
        JSON.stringify(
          {
            ...data,
            properties: { ...data.properties, bbox }
          },
          null,
          2
        ),
        err => {
          if (err) throw err;
        }
      );
    })
    .on("end", () => {
      const all = getbbox(Object.values(bboxMap).flat());
      fs.writeFile(
        `${basedir}/src/bboxmap.json`,
        JSON.stringify({ prefs: bboxMap, japan: all }, null, 2),
        err => {
          if (err) throw err;
        }
      );

      for (
        let lng = all[0][0];
        lng < Math.ceil(all[1][0]);
        lng = Math.floor(lng) + 1
      ) {
        for (
          let lat = all[1][1];
          lat < Math.ceil(all[0][1]);
          lat = Math.floor(lat) + 1
        ) {
          console.log(lng, lat);
        }
      }
    });
};

main();
