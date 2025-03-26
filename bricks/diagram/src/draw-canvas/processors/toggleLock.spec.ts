import { describe, expect, it } from "@jest/globals";
import { toggleLock } from "./toggleLock";
import type { ActiveTarget, NodeCell } from "../interfaces";

describe("toggleLock", () => {
  it("should lock unlocked targets when type is 'toggle'", () => {
    const target = { type: "node", id: "cell-1" } as ActiveTarget;
    const cells = [
      { type: "node", id: "cell-1", view: { locked: false } },
      { type: "node", id: "cell-2", view: { locked: true } },
    ] as NodeCell[];

    const { newCells, updates } = toggleLock(target, "toggle", cells, []) as {
      newCells: NodeCell[] | null;
      updates: NodeCell[];
    };

    expect(newCells).not.toBeNull();
    expect(newCells?.[0].view.locked).toBe(true);
    expect(newCells?.[1].view.locked).toBe(true);
    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBe("cell-1");
    expect(updates[0].view.locked).toBe(true);
  });

  it("should lock unlocked targets when type is 'lock'", () => {
    const target = { type: "node", id: "cell-1" } as ActiveTarget;
    const cells = [
      { type: "node", id: "cell-1", view: { locked: false } },
      { type: "node", id: "cell-2", view: { locked: true } },
    ] as NodeCell[];

    const { newCells, updates } = toggleLock(target, "lock", cells, []) as {
      newCells: NodeCell[] | null;
      updates: NodeCell[];
    };

    expect(newCells).not.toBeNull();
    expect(newCells?.[0].view.locked).toBe(true);
    expect(newCells?.[1].view.locked).toBe(true);
    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBe("cell-1");
    expect(updates[0].view.locked).toBe(true);
  });

  it("should unlock locked targets when type is 'toggle' and all targets are locked", () => {
    const target = {
      type: "multi",
      targets: [
        { type: "node", id: "cell-1" },
        { type: "node", id: "cell-2" },
      ],
    } as ActiveTarget;
    const cells = [
      { type: "node", id: "cell-1", view: { locked: true } },
      { type: "node", id: "cell-2", view: { locked: true } },
    ] as NodeCell[];

    const { newCells, updates } = toggleLock(target, "toggle", cells, []) as {
      newCells: NodeCell[] | null;
      updates: NodeCell[];
    };

    expect(newCells).not.toBeNull();
    expect(newCells?.[0].view.locked).toBe(false);
    expect(newCells?.[1].view.locked).toBe(false);
    expect(updates).toHaveLength(2);
    expect(updates[0].id).toBe("cell-1");
    expect(updates[0].view.locked).toBe(false);
    expect(updates[1].id).toBe("cell-2");
    expect(updates[1].view.locked).toBe(false);
  });

  it("should unlock locked targets when type is 'unlock'", () => {
    const target = { type: "node", id: "cell-1" } as ActiveTarget;
    const cells = [
      { type: "node", id: "cell-1", view: { locked: true } },
      { type: "node", id: "cell-2", view: { locked: false } },
    ] as NodeCell[];

    const { newCells, updates } = toggleLock(target, "unlock", cells, []) as {
      newCells: NodeCell[] | null;
      updates: NodeCell[];
    };

    expect(newCells).not.toBeNull();
    expect(newCells?.[0].view.locked).toBe(false);
    expect(newCells?.[1].view.locked).toBe(false);
    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBe("cell-1");
    expect(updates[0].view.locked).toBe(false);
  });

  it("should not change cells if no matching targets found", () => {
    const target = { type: "node", id: "non-existent" } as ActiveTarget;
    const cells = [
      { type: "node", id: "cell-1", view: { locked: false } },
      { type: "node", id: "cell-2", view: { locked: true } },
    ] as NodeCell[];

    const { newCells, updates } = toggleLock(target, "toggle", cells, []) as {
      newCells: NodeCell[] | null;
      updates: NodeCell[];
    };

    expect(newCells).toBeNull();
    expect(updates).toHaveLength(0);
  });

  it("should skip cells in locked containers", () => {
    const target = { type: "node", id: "cell-2" } as ActiveTarget;
    const cells = [
      {
        type: "node",
        id: "cell-1",
        view: { locked: false },
        containerId: "container-1",
      },
      {
        type: "node",
        id: "cell-2",
        view: { locked: true },
        containerId: "container-2",
      },
    ] as NodeCell[];
    const lockedContainerIds = ["container-1"];

    const { newCells, updates } = toggleLock(
      target,
      "toggle",
      cells,
      lockedContainerIds
    ) as {
      newCells: NodeCell[] | null;
      updates: NodeCell[];
    };

    expect(newCells).not.toBeNull();
    expect(newCells?.[1].view.locked).toBe(false);
    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBe("cell-2");
    expect(updates[0].view.locked).toBe(false);
  });

  it("should return null for newCells when no changes are needed", () => {
    const target = { type: "node", id: "cell-1" } as ActiveTarget;
    const cells = [
      { type: "node", id: "cell-1", view: { locked: true } },
    ] as NodeCell[];

    const { newCells, updates } = toggleLock(target, "lock", cells, []) as {
      newCells: NodeCell[] | null;
      updates: NodeCell[];
    };

    expect(newCells).toBeNull();
    expect(updates).toHaveLength(0);
  });

  it("should handle locked container", () => {
    const target = { type: "node", id: "cell-1" } as ActiveTarget;
    const cells = [
      { type: "container", id: "container-1", view: { locked: true } },
      { type: "container", id: "container-2", view: { locked: false } },
      {
        type: "node",
        id: "cell-1",
        view: { locked: false },
        containerId: "container-1",
      },
      {
        type: "node",
        id: "cell-2",
        view: { locked: true },
        containerId: "container-2",
      },
    ] as NodeCell[];
    const lockedContainerIds = ["container-1"];

    const { newCells, updates } = toggleLock(
      target,
      "toggle",
      cells,
      lockedContainerIds
    ) as {
      newCells: NodeCell[] | null;
      updates: NodeCell[];
    };

    expect(newCells).toBeNull();
    expect(updates).toHaveLength(0);
  });
});
