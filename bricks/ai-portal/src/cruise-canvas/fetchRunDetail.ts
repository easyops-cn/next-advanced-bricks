import { cloneDeep } from "lodash";
import type { RawNode } from "./interfaces";

export interface RunDetail {
  runId: string;
  nodes: RawNode[];
  finished?: boolean;
}

const mockNodes: RawNode[] = [
  {
    id: "2",
    parent: "1",
    type: "instruction",
    content: "深度搜素内部知识库，确认手机银行系统包含的逻辑组件和部署要求",
  },
  { id: "3", parent: "2", type: "group", groupChildren: ["4", "5"] },
  {
    id: "4",
    parent: "2",
    type: "tool",
    tag: "online search",
    title: "《手机银行系统》",
    content:
      "依据内部知识库，手机银行系统的逻辑组件包含用户认证，交易接入和理财中心三个模块组成。",
  },
  {
    id: "5",
    parent: "2",
    type: "tool",
    tag: "online search",
    title: "《XX公司运维管理文件》",
    content:
      "依据《XX公司运维管理文件》该系统的重要等级为一级，可用性要求99.999%，MTTR为小于3分钟，该系统部署需要实现异地容灾，建议采用双中心部署，且单中心内核心模块无单点。",
  },
  {
    id: "7",
    parent: "3",
    type: "tool",
    tag: "summarize",
    content:
      "依据内部知识库，手机银行系统的逻辑组件包含用户认证，交易接入和理财中心三个模块组成。依据《XX公司运维管理文件》该系统的重要等级为一级，可用性要求99.999%，MTTR为小于3分钟，该系统部署需要实现异地容灾，建议采用双中心部署，且单中心内核心模块无单点。",
  },
  {
    id: "8",
    parent: "7",
    type: "instruction",
    content: "深度搜素CMDB给出资源的纳管现状",
  },
  {
    id: "9",
    parent: "8",
    type: "summarize",
    title: "总结",
    content:
      "基于CMDB查询手机银行的资源纳管情况，纳管现状总结如下：\n\n实例数据的完整性\n1. 系统录入（已完成）\n2. 模块录入（部分完成），交易接入模块未录入\n3. 环境录入（已完成）\n4. 主机录入（部分完成），交易接入模块主机未录入\n5. 部署实例录入（部分完成），交易接入模块的部署实例未录入\n\n关系数据的完整性\n1. 系统和模块（部分完成），系统和交易接入模块的关系未建立\n2. 系统和环境（√）\n3. 模块和主机（部分完成）\n4. ...",
  },
  {
    id: "10",
    parent: "9",
    type: "instruction",
    content:
      "利用深度思考能力，给出手机银行系统的资源纳管优化方案，该方案用户可以微调或确认",
  },
  {
    id: "11",
    parent: "10",
    type: "tool",
    tag: "ask user more",
    content:
      "- 交易接入模块的录入；\n- 系统和交易接入模块的关系创建 ；\n- 部署实例自动采集特征录入。",
  },
  {
    id: "12",
    parent: "11",
    type: "instruction",
    content: "在CMDB中完成手机银行系统的资源纳管",
  },
  {
    id: "13",
    parent: "12",
    type: "tool",
    tag: "ask user confirm",
    content: "方案执行的过程信息",
  },
  {
    id: "14",
    parent: "13",
    type: "instruction",
    content: "生成纳管后手机银行系统的逻辑架构和部署架构图",
  },
  {
    id: "15",
    parent: "14",
    type: "tool",
    tag: "topology",
    content: "https://example.com/topology",
  },
  {
    id: "16",
    parent: "15",
    type: "summarize",
    title: "综合分析",
    finished: true,
    content:
      "该手机银行系统的资源纳管已经完成，本次纳管新增了交易接入模块和该模块相关的主机，以及部署实例信息，模块的纳管建议和架构管理平台打通，部署实例的纳管建议和自动发布平台打通，以便自动完成数据变更，确保数据的准确性，降低架构维护成本。",
  },
];

let step = 0;

export function resetFetchRunDetail() {
  step = 0;
}

export async function fetchRunDetail(runId: string, requirement: string): Promise<RunDetail> {
  const startNode: RawNode = {
    id: "1",
    type: "requirement",
    content: requirement,
  };

  const nodes = [startNode, ...cloneDeep(mockNodes.slice(0, step))];
  const lastNode = nodes[nodes.length - 1];
  if (lastNode.type === "instruction") {
    lastNode.executing = true;
  }
  if (nodes.length > 1) {
    const previousNode = nodes[nodes.length - 2];
    if (previousNode.type === "instruction") {
      previousNode.executing = false;
    }
  }

  step += lastNode.type === "group" ? 2 : 1;

  return {
    runId,
    nodes,
    finished: lastNode.finished,
  };
}
