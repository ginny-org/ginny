import { default as register, InputOptions } from "@swc/register/lib/node";
import "source-map-support/register";

const opts: InputOptions = {
  extensions: [".ts", ".tsx", ".jsx"],
  sourceMaps: true,
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: true
    },
    transform: {
      react: {
        pragma: "Ginny.h"
      }
    }
  },
  module: {
    type: "commonjs"
  }
};

register(opts);
