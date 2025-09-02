import { createProviderClass } from "@next-core/utils/general";
import { TestTreeData, TreeNodeItemData } from "../interface.js";
import { findNodeData } from "./sort-test-tree-node.js";
import {
  StoryboardApi_addNode,
  StoryboardApi_batchImportNodes,
} from "@next-api-sdk/next-builder-sdk";

interface Option {
  appId: string;
}

export async function insertNode(
  treeData: TestTreeData[],
  itemNode: TreeNodeItemData,
  formData: Record<string, any>,
  direction: "up" | "down" = "down",
  options: Option
): Promise<undefined> {
  const { appId } = options || {};
  const parentKey = itemNode.parent?.instanceId;

  const parentData = findNodeData(treeData, parentKey as string);

  const children = parentData?.children || [];

  const findIndex = children.findIndex(
    (item) => item.key === itemNode.instanceId
  );

  let belowNodes;
  let insertNodeSort: number;

  if (direction === "up") {
    belowNodes = children.slice(findIndex);
    insertNodeSort = itemNode.sort as number;
  } else {
    belowNodes = children.slice(findIndex + 1);
    insertNodeSort = (itemNode.sort as number) + 1;
  }

  await StoryboardApi_addNode(appId!, {
    objectId: "UI_TEST_NODE@EASYOPS",
    instance: {
      ...formData,
      parent: itemNode.parent?.instanceId,
      sort: insertNodeSort,
    },
  });

  if (belowNodes.length > 0) {
    await StoryboardApi_batchImportNodes(appId!, {
      objectId: "UI_TEST_NODE@EASYOPS",
      keys: ["instanceId"],
      datas: belowNodes.map((item, index) => ({
        instanceId: item.data.instanceId,
        sort: insertNodeSort + 1 + index,
      })),
    });
  }
}

customElements.define("ui-test.insert-node", createProviderClass(insertNode));
