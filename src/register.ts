import { default as register, InputOptions } from "@swc/register/lib/node";

const opts: InputOptions = {
  extensions: [".ts", ".tsx", ".jsx"],
  sourceMaps: false,
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
