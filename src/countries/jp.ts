import * as turf from "@turf/turf";
import bbox from "../bboxmap.json";
import fs from "fs";
import { promisify } from "util";
import pkgDir from "pkg-dir";
const readFile = promisify(fs.readFile);

const bbox2polygon = ([[lng1, lat1], [lng2, lat2]]: number[][]) => {
  const smallerLat = Math.min(lat1, lat2);
  const largerLat = Math.max(lat1, lat2);
  const smallerLng = Math.min(lng1, lng2);
  const largerLng = Math.max(lng1, lng2);
  return turf.polygon([
    [
      [smallerLng, largerLat],
      [largerLng, largerLat],
      [largerLng, smallerLat],
      [smallerLng, smallerLat],
      [smallerLng, largerLat]
    ]
  ]);
};

export default async (coord: [number, number]) => {
  const point = turf.point(coord);
  const polygon = bbox2polygon(bbox.japan);

  const isSurelyOutsideOfJapan = !turf.booleanPointInPolygon(point, polygon);

  if (isSurelyOutsideOfJapan) {
    return false;
  } else {
    const basedir = await pkgDir();
    for (const prefCode in bbox.prefs) {
      const prefPolygon = bbox2polygon(
        bbox.prefs[prefCode as keyof typeof bbox.prefs]
      );
      const isSurelyOutsideOfThePref = !turf.booleanPointInPolygon(
        point,
        prefPolygon
      );

      if (!isSurelyOutsideOfThePref) {
        const prefGeojson = JSON.parse(
          (await readFile(`${basedir}/prefs/${prefCode}.geojson`)).toString()
        ) as any;
        const prefMultiPolygon = turf.multiPolygon(
          prefGeojson.geometry.coordinates
        );

        if (turf.booleanPointInPolygon(point, prefMultiPolygon)) {
          return { name: prefGeojson.properties.name_ja, prefCode };
        }
      }
    }
    return false;
  }
};
