import * as t from "@babel/types";

export interface ParseError {
  message: string;
  node: t.Node | null;
  severity: "notice" | "warning" | "error" | "fatal";
}

export interface ParseTsxOptions {
  reward?: boolean;
  workspace?: string;
  withContexts?: string[];
}
