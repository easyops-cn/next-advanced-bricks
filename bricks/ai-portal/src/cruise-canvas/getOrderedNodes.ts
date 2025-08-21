export interface GeneralNode {
  id: string;
  upstream?: string[];
  parent?: string;
  hidden?: boolean;
}

export interface GetOrderedNodesOptions {
  showHiddenNodes?: boolean;
}

export function getOrderedNodes<T extends GeneralNode>(
  nodes: T[] | null | undefined,
  options?: GetOrderedNodesOptions
) {
  const fixedNodes = nodes ?? [];
  const map = new Map<string, T>();
  const childrenMap = new Map<string, string[]>();
  let downstreamMap = new Map<string, string[]>();
  let roots: string[] = [];
  const rootChildren: string[] = [];
  const levels = new Map<string, number>();
  const hiddenNodeIds = new Set<string>();
  const showHiddenNodes = options?.showHiddenNodes;

  // Setup children relations
  for (const node of fixedNodes) {
    map.set(node.id, node);
    // TODO: remove mock
    if (!showHiddenNodes && node.hidden) {
      hiddenNodeIds.add(node.id);
    }
    if (node.parent) {
      let children = childrenMap.get(node.parent);
      if (!children) {
        childrenMap.set(node.parent, (children = []));
      }
      children.push(node.id);
    } else {
      rootChildren.push(node.id);
    }
  }

  // Setup downstream relations
  for (const node of fixedNodes) {
    for (const up of node.upstream ?? []) {
      let downstream = downstreamMap.get(up);
      if (!downstream) {
        downstreamMap.set(up, (downstream = []));
      }
      downstream.push(node.id);
    }

    if (
      !node.parent &&
      !node.upstream?.length &&
      (showHiddenNodes || !node.hidden)
    ) {
      roots.push(node.id);
    }
  }

  // Convert children to flat downstream
  const alignDownstreamMap = (children: string[], level: number) => {
    for (const nodeId of children) {
      levels.set(nodeId, level);
      const subChildren = childrenMap.get(nodeId);
      const downstream = downstreamMap.get(nodeId);

      if (subChildren) {
        const directSubChildren = subChildren.filter((child) => {
          const childNode = map.get(child)!;
          return !childNode.upstream?.length;
        });

        const leafSubChildren = downstream
          ? subChildren.filter((child) => {
              return !downstreamMap.has(child);
            })
          : [];

        downstreamMap.set(nodeId, directSubChildren);

        for (const child of leafSubChildren) {
          downstreamMap.set(child, [...downstream!]);
        }

        alignDownstreamMap(subChildren, level + 1);
      }
    }
  };

  alignDownstreamMap(rootChildren, 0);

  // Remove hidden nodes, and reconnect related downstream connections.
  let fullDownstreamMap: Map<string, string[]> | undefined;
  if (!showHiddenNodes && hiddenNodeIds.size > 0) {
    const findVisibleDownstreams = (downstreams: string[]): string[] => {
      return downstreams.flatMap((nodeId) => {
        const node = map.get(nodeId)!;
        if (node.hidden) {
          const nextDownstreams = downstreamMap.get(nodeId);
          return nextDownstreams ? findVisibleDownstreams(nextDownstreams) : [];
        }
        return nodeId;
      });
    };

    const newDownstreamMap = new Map<string, string[]>();

    const fixDownstreams = (visibleDownstreams: string[]) => {
      for (const id of visibleDownstreams) {
        const downstreams = downstreamMap.get(id);
        if (downstreams) {
          const visibleDownstreams = findVisibleDownstreams(downstreams);
          newDownstreamMap.set(id, visibleDownstreams);
          fixDownstreams(visibleDownstreams);
        }
      }
    };

    roots = findVisibleDownstreams(roots);
    fixDownstreams(roots);
    fullDownstreamMap = downstreamMap;
    downstreamMap = newDownstreamMap;
  }

  // Get BFS order of nodes
  const list: string[] = [];
  const visitedNodes = new Set<string>();
  const queue: string[] = [...roots];
  const leaves: string[] = [];
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
    } else {
      leaves.push(id);
    }
  }

  return { list, map, levels, roots, leaves, downstreamMap, fullDownstreamMap };
}
