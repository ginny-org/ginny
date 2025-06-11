import { Ginny } from "./types";
import { flatten, createElement } from "./elementUtils";
import markdown from "./components/markdown";

type FunctionComponent<P> = (
  props: P & { children?: Ginny.OutputType[] }
) => Ginny.Node | Promise<Ginny.Node> | Ginny.Node[] | Promise<Ginny.Node[]> | null;

export interface h {
  <P extends Ginny.HTMLAttributes<T>, T extends HTMLElement>(
    type: keyof Ginny.GinnyHTML,
    props?: (Ginny.Attributes & P) | null,
    ...children: Ginny.OutputType[]
  ): Ginny.OutputType;
  <P extends Ginny.SVGAttributes<T>, T extends SVGElement>(
    type: keyof Ginny.GinnySVG,
    props?: (Ginny.Attributes & P) | null,
    ...children: Ginny.OutputType[]
  ): string;
  <P extends Ginny.DOMAttributes<T>, T extends Element>(
    type: string,
    props?: (Ginny.Attributes & P) | null,
    ...children: Ginny.OutputType[]
  ): Ginny.OutputType;
  <P>(
    type: FunctionComponent<P>,
    props?: (Ginny.Attributes & P) | null,
    ...children: Ginny.OutputType[]
  ): Ginny.OutputType;
}

export async function h<P extends Ginny.HTMLAttributes<T>, T extends HTMLElement>(
  tag: string | FunctionComponent<P> | { default: FunctionComponent<P> },
  props: (Ginny.Attributes & P) | null,
  ...children: Ginny.OutputType[]
): Promise<Ginny.Node | Ginny.Node[] | null> {
  switch (tag) {
    case "markdown":
      tag = markdown as FunctionComponent<P>;
      break;
  }

  if (typeof tag === "function") {
    return tag({ ...(props as Ginny.Attributes & P), children });
  }

  if (typeof tag === "object") {
    return tag.default({ ...(props as Ginny.Attributes & P), children });
  }

  const attributesString = generateAttributeString(props);
  const tagAndAttributes = `${tag}${attributesString}`;

  if (children.length === 0) {
    return supportsSelfClosing(tag)
      ? createElement(`<${tagAndAttributes}/>`)
      : createElement(`<${tagAndAttributes}></${tag}>`);
  }

  return createElement(
    `<${tag}${attributesString}>${(await flatten(children)).map((child) => child?.text ?? "").join("")}</${tag}>`
  );
}

function generateAttributeString(props: Ginny.Attributes | null): string {
  const pairs = [""];

  if (props) {
    for (const attrName in props) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (props as any)[attrName];
      const name = attributeName(attrName);

      if (typeof value === "boolean") {
        if (value) {
          pairs.push(`${name}`);
        }
      } else {
        pairs.push(`${name}="${attributeValue(name, value)}"`);
      }
    }
  }

  return pairs.join(" ").trimEnd();
}

function attributeName(name: string): string {
  const lcased = name.toLowerCase();

  switch (lcased) {
    case "classname":
      return "class";
    default:
      return lcased;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function attributeValue(name: string, value: any): string {
  switch (name) {
    case "style":
      return formatStyle(value);
    default:
      return `${value}`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatStyle(style: any): string {
  const ret: string[] = [];

  for (const key in style) {
    const parts = key.split(/(?=[A-Z]+)/);
    const name = parts.map((part) => part.toLowerCase()).join("-");

    ret.push(`${name}: ${style[key]}`);
  }

  return ret.join("; ");
}

function supportsSelfClosing(tag: string): boolean {
  switch (tag) {
    case "area":
    case "base":
    case "br":
    case "col":
    case "embed":
    case "hr":
    case "img":
    case "input":
    case "link":
    case "meta":
    case "param":
    case "source":
    case "track":
    case "wbr":
      return true;
    default:
      return false;
  }
}

export default h;
