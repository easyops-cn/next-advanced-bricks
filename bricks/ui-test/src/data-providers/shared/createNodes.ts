import { omit } from "lodash";
import { StoryboardApi_addNode } from "@next-api-sdk/next-builder-sdk";
import { NodeItem } from "../../interface.js";

interface NodeInstance extends NodeItem {
  instanceId: string;
}

interface NodeItemToSave extends NodeItem {
  parent: string;
  sort: number;
}

export interface Option {
  appId: string;
}

export async function createNodes(
  nodes: NodeItem[],
  parent: string,
  initialSort = 0,
  options: Option
): Promise<void> {
  let sort = initialSort;
  for (const node of nodes) {
    await createNode(
      {
        ...node,
        parent,
        sort,
      },
      options
    );
    sort++;
  }
}

async function createNode(
  node: NodeItemToSave,
  options: Option
): Promise<void> {
  const { appId } = options || {};
  const instance = (
    await StoryboardApi_addNode(appId!, {
      objectId: "UI_TEST_NODE@EASYOPS",
      instance: omit(node, ["children"]),
    })
  ).instance as NodeInstance;

  if (node.children?.length) {
    await createNodes(node.children, instance.instanceId, 0, options);
  }
}
