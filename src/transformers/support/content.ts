import { ContentContext } from "./ContentContext";

export interface FileResult<Content> {
  filename: string;
  content: Content;
}

export interface MultiFileResult<Content> {
  files: FileResult<Content>[];
}

export type ContentResult<Content> = Content | FileResult<Content> | MultiFileResult<Content>;

export interface ContentFunction<Content> {
  default(context: ContentContext): ContentResult<Content> | Promise<ContentResult<Content>>;
}
