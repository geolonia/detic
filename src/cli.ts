#!/usr/bin/env node
import process from "process";
import detic from "./";

const [, , countryCode, ...args] = process.argv;

if (args.length === 0) {
  process.stderr.write("No argument supplied.");
  process.exit(1);
} else {
  const [lng, lat] = args[0].split(",").map(element => parseInt(element, 10));

  // @ts-ignore
  const handler = detic[countryCode];
  if (typeof handler !== "function") {
    process.stderr.write("no country handler exists.");
    process.exit(2);
  }

  handler([lng, lat])
    .then((result: any) => {
      process.stdout.write(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error: any) => {
      process.stderr.write("Unknown error");
      process.stderr.write(JSON.stringify(error, null, 2));
      process.exit(3);
    });
}
