import { createProviderClass } from "@next-core/utils/general";
import { createNodes, Option } from "./shared/createNodes.js";
import type { NodeItem } from "../interface.js";

export interface ApplySnippetParams {
  nodes: NodeItem[];
  parent: string;
  initialSort?: number;
}

export async function applySnippet(
  { nodes, parent, initialSort }: ApplySnippetParams,
  options: Option
): Promise<void> {
  await createNodes(nodes, parent, initialSort, options);
}

customElements.define(
  "ui-test.apply-snippet",
  createProviderClass(applySnippet)
);
