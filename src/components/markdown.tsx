import { Ginny } from "../types";
import * as showdown from "showdown";
import { flatten, createElement } from "../elementUtils";

type MarkdownProperties = Ginny.DetailedHTMLProps<Ginny.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export default async (props: MarkdownProperties): Promise<(string | { type: "element"; text: string })[]> => {
  const innerContent = await flatten(props.children);
  const converter = new showdown.Converter();

  return innerContent.map((content) =>
    content.type === "element" ? content.text : createElement(converter.makeHtml(content.text))
  );
};
