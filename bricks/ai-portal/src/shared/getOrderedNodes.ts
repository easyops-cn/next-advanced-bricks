export interface GeneralNode {
  id: string;
  upstream?: string[];
  parent?: string;
  hidden?: boolean;
}

export function getOrderedNodes<T extends GeneralNode>(
  nodes: T[],
  rootId?: string
) {
  const map = new Map<string, T>();
  const downstreamMap = new Map<string, string[]>();
  const roots: string[] = [];
  const childMap: Map<string, string> = new Map();

  // Ignore sub nodes
  for (const node of nodes) {
    map.set(node.id, node);
    if (node.parent /*  && node.id !== rootId */) {
      childMap.set(node.parent, node.id);
    }
  }

  // Setup downstream relations
  for (const node of nodes) {
    for (const up of node.upstream ?? []) {
      let downstream = downstreamMap.get(up);
      if (!downstream) {
        downstreamMap.set(up, (downstream = []));
      }
      downstream.push(node.id);
    }

    if (node.id === rootId || (!node.parent && !node.upstream?.length)) {
      roots.push(node.id);
    }
  }

  // Get BFS order of nodes
  const list: string[] = [];
  const visitedNodes = new Set<string>();
  const queue: string[] = [...roots];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visitedNodes.has(id)) {
      continue;
    }
    visitedNodes.add(id);
    list.push(id);
    const downstream = downstreamMap.get(id);
    if (downstream?.length) {
      queue.push(...downstream);
    }
  }

  return { list, map, childMap };
}
