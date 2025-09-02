import { createProviderClass } from "@next-core/utils/general";
import { NodeGraphData, TreeNodeItemData, TestTreeData } from "../interface.js";
import { findNodeData } from "./sort-test-tree-node.js";
import { isEmpty, pick } from "lodash";
import { StoryboardApi_addNode } from "@next-api-sdk/next-builder-sdk";

const basicFields = ["name", "label", "sort", "type", "params"];

interface Option {
  appId: string;
}

async function createChildrenNode(
  parentData: TreeNodeItemData,
  nodes: NodeGraphData[],
  treeData: TestTreeData[],
  options?: Option
): Promise<void> {
  const { appId } = options || {};

  const responseNodes = (await Promise.all(
    nodes.map((node) =>
      StoryboardApi_addNode(appId!, {
        objectId: "UI_TEST_NODE@EASYOPS",
        instance: {
          ...pick(node, basicFields),
          parent: parentData?.instanceId,
        },
      }).then((r) => r.instance)
    )
  )) as TreeNodeItemData[];

  let index = 0;
  for (const item of nodes) {
    const findNode = findNodeData(treeData, item.instanceId)?.data;

    if (!isEmpty(findNode?.children)) {
      await createChildrenNode(
        responseNodes[index],
        findNode!.children as NodeGraphData[],
        treeData,
        options
      );
    }
    index += 1;
  }
}

export async function cloneNodes(
  clonedData: TreeNodeItemData,
  parentData: TreeNodeItemData,
  treeData: TestTreeData[],
  options?: Option
): Promise<void> {
  const { appId } = options || {};

  const instanceData = (
    await StoryboardApi_addNode(appId!, {
      objectId: "UI_TEST_NODE@EASYOPS",
      instance: {
        ...pick(clonedData, basicFields),
        sort: parentData.children?.length
          ? (parentData.children[parentData.children.length - 1].sort ?? 0) + 1
          : 0,
        parent: parentData.instanceId,
      },
    })
  ).instance;

  // istanbul ignore else
  if (!isEmpty(clonedData.children)) {
    await createChildrenNode(
      instanceData as TreeNodeItemData,
      clonedData.children as NodeGraphData[],
      treeData,
      options
    );
  }
}

customElements.define("ui-test.clone-nodes", createProviderClass(cloneNodes));
