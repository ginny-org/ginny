import { register } from "@swc-node/register/register";
import "source-map-support/register";
import * as ts from "typescript";

const opts: Partial<ts.CompilerOptions> = {
  extensions: [".ts", ".tsx", ".jsx"],
  sourceMaps: true,
  jsxFactory: "Ginny.h",
  jsx: ts.JsxEmit.React,
  module: ts.ModuleKind.CommonJS
};

register(opts);
