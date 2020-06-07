import { Ginny } from "./types";

export async function flatten(v: any | any[], ret: any[] = []): Promise<Ginny.Node[]> {
  const resolved = await v;

  if (!Array.isArray(resolved)) {
    ret.push(typeof resolved === "string" ? createText(resolved) : resolved);
  } else {
    for (const item of resolved) {
      await flatten(item, ret);
    }
  }

  return ret;
}

export function createText(text: string): { type: "text"; text: string } {
  return { type: "text", text };
}

export function createElement(text: string): { type: "element"; text: string } {
  return { type: "element", text };
}
