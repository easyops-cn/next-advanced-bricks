import { describe, test, expect } from "@jest/globals";
import { getUnrelatedCells } from "./getUnrelatedCells";
import type { ActiveTarget, Cell } from "../interfaces";

describe("getUnrelatedCells", () => {
  const cells = [
    { id: "1", type: "node" },
    { id: "2", type: "node" },
    { id: "3", type: "node" },
    { id: "4", type: "node" },
    { id: "4", type: "edge", source: "1", target: "2" },
    { id: "5", type: "edge", source: "2", target: "3" },
    { id: "6", type: "edge", source: "3", target: "4" },
    { id: "7", type: "edge", source: "4", target: "1" },
    { id: "8", type: "decorator" },
    { id: "9", type: "decorator" },
  ] as Cell[];

  test("active target is node", () => {
    const activeTarget = { type: "node", id: "2" } as ActiveTarget;
    const unrelated = getUnrelatedCells(cells, null, activeTarget);
    expect(unrelated).toEqual([
      { id: "6", type: "edge", source: "3", target: "4" },
      { id: "7", type: "edge", source: "4", target: "1" },
      { id: "8", type: "decorator" },
      { id: "9", type: "decorator" },
      { id: "4", type: "node" },
    ]);
  });

  test("active target is node with chain scope", () => {
    const activeTarget = { type: "node", id: "center" } as ActiveTarget;
    const unrelated = getUnrelatedCells(
      [
        { id: "up-2", type: "node" },
        { id: "up-1", type: "node" },
        { id: "center", type: "node" },
        { id: "down-1", type: "node" },
        { id: "down-2", type: "node" },
        { id: "up-side", type: "node" },
        { id: "down-side", type: "node" },
        { id: "isolated-1", type: "node" },
        { id: "isolated-2", type: "node" },
        { id: "edge-up-2", type: "edge", source: "up-2", target: "up-1" },
        { id: "edge-up-1", type: "edge", source: "up-1", target: "center" },
        {
          id: "edge-down-1",
          type: "edge",
          source: "center",
          target: "down-1",
        },
        {
          id: "edge-down-2",
          type: "edge",
          source: "down-1",
          target: "down-2",
        },
        { id: "edge-up-side", type: "edge", source: "up-1", target: "up-side" },
        {
          id: "edge-down-side",
          type: "edge",
          source: "down-side",
          target: "down-1",
        },
        {
          id: "edge-isolated",
          type: "edge",
          source: "isolated-1",
          target: "isolated-2",
        },
        { id: "decorator-1", type: "decorator" },
      ] as Cell[],
      null,
      activeTarget,
      undefined,
      "chain"
    );
    expect(unrelated).toEqual([
      { id: "edge-up-side", type: "edge", source: "up-1", target: "up-side" },
      {
        id: "edge-down-side",
        type: "edge",
        source: "down-side",
        target: "down-1",
      },
      {
        id: "edge-isolated",
        type: "edge",
        source: "isolated-1",
        target: "isolated-2",
      },
      { id: "decorator-1", type: "decorator" },
      { id: "up-side", type: "node" },
      { id: "down-side", type: "node" },
      { id: "isolated-1", type: "node" },
      { id: "isolated-2", type: "node" },
    ]);
  });

  test("active target is edge", () => {
    const activeTarget = {
      type: "edge",
      source: "1",
      target: "2",
    } as ActiveTarget;
    const unrelated = getUnrelatedCells(cells, null, activeTarget);
    expect(unrelated).toEqual([
      { id: "3", type: "node" },
      { id: "4", type: "node" },
      { id: "5", type: "edge", source: "2", target: "3" },
      { id: "6", type: "edge", source: "3", target: "4" },
      { id: "7", type: "edge", source: "4", target: "1" },
      { id: "8", type: "decorator" },
      { id: "9", type: "decorator" },
    ]);
  });

  test("active target is decorator", () => {
    const activeTarget = { id: "8", type: "decorator" } as ActiveTarget;
    const unrelated = getUnrelatedCells(cells, null, activeTarget);
    expect(unrelated).toEqual([]);
  });

  test("active target is null", () => {
    const unrelated = getUnrelatedCells(cells, null, null);
    expect(unrelated).toEqual([]);
  });

  test("connect line state is not null", () => {
    const connectLineState = { source: { id: "1" } } as any;
    const unrelated = getUnrelatedCells(cells, connectLineState, null);
    expect(unrelated).toEqual([
      { id: "2", type: "node" },
      { id: "4", type: "edge", source: "1", target: "2" },
      { id: "5", type: "edge", source: "2", target: "3" },
      { id: "6", type: "edge", source: "3", target: "4" },
      { id: "7", type: "edge", source: "4", target: "1" },
      { id: "8", type: "decorator" },
      { id: "9", type: "decorator" },
    ]);
  });

  test("connect line state is area", () => {
    const connectLineState = { source: { id: "8" } } as any;
    const unrelated = getUnrelatedCells(cells, connectLineState, null, true);
    expect(unrelated).toEqual([
      { id: "4", type: "edge", source: "1", target: "2" },
      { id: "5", type: "edge", source: "2", target: "3" },
      { id: "6", type: "edge", source: "3", target: "4" },
      { id: "7", type: "edge", source: "4", target: "1" },
    ]);
  });

  test("multiple active targets", () => {
    const unrelated = getUnrelatedCells(cells, null, {
      type: "multi",
      targets: [
        { type: "node", id: "1" },
        { type: "decorator", id: "8" },
      ],
    });
    expect(unrelated).toEqual([
      { id: "5", type: "edge", source: "2", target: "3" },
      { id: "6", type: "edge", source: "3", target: "4" },
      { id: "9", type: "decorator" },
      { id: "3", type: "node" },
    ]);
  });

  test("multiple active targets with chain scope", () => {
    const graph = [
      { id: "up-2", type: "node" },
      { id: "up-1", type: "node" },
      { id: "center", type: "node" },
      { id: "down-1", type: "node" },
      { id: "down-2", type: "node" },
      { id: "up-side", type: "node" },
      { id: "down-side", type: "node" },
      { id: "edge-up-2", type: "edge", source: "up-2", target: "up-1" },
      { id: "edge-up-1", type: "edge", source: "up-1", target: "center" },
      {
        id: "edge-down-1",
        type: "edge",
        source: "center",
        target: "down-1",
      },
      {
        id: "edge-down-2",
        type: "edge",
        source: "down-1",
        target: "down-2",
      },
      { id: "edge-up-side", type: "edge", source: "up-1", target: "up-side" },
      {
        id: "edge-down-side",
        type: "edge",
        source: "down-side",
        target: "down-1",
      },
    ] as Cell[];
    const unrelated = getUnrelatedCells(
      graph,
      null,
      {
        type: "multi",
        targets: [{ type: "node", id: "center" }],
      },
      undefined,
      "chain"
    );
    expect(unrelated).toEqual([
      { id: "edge-up-side", type: "edge", source: "up-1", target: "up-side" },
      {
        id: "edge-down-side",
        type: "edge",
        source: "down-side",
        target: "down-1",
      },
      { id: "up-side", type: "node" },
      { id: "down-side", type: "node" },
    ]);
  });

  test("multiple precomputed chain targets should not expand to side branches", () => {
    const graph = [
      { id: "up-2", type: "node" },
      { id: "up-1", type: "node" },
      { id: "center", type: "node" },
      { id: "down-1", type: "node" },
      { id: "down-2", type: "node" },
      { id: "up-side", type: "node" },
      { id: "down-side", type: "node" },
      { id: "edge-up-2", type: "edge", source: "up-2", target: "up-1" },
      { id: "edge-up-1", type: "edge", source: "up-1", target: "center" },
      {
        id: "edge-down-1",
        type: "edge",
        source: "center",
        target: "down-1",
      },
      {
        id: "edge-down-2",
        type: "edge",
        source: "down-1",
        target: "down-2",
      },
      { id: "edge-up-side", type: "edge", source: "up-1", target: "up-side" },
      {
        id: "edge-down-side",
        type: "edge",
        source: "down-side",
        target: "down-1",
      },
    ] as Cell[];
    const unrelated = getUnrelatedCells(
      graph,
      null,
      {
        type: "multi",
        targets: [
          { type: "node", id: "up-2" },
          { type: "node", id: "up-1" },
          { type: "node", id: "center" },
          { type: "node", id: "down-1" },
          { type: "node", id: "down-2" },
          { type: "edge", source: "up-2", target: "up-1" },
          { type: "edge", source: "up-1", target: "center" },
          { type: "edge", source: "center", target: "down-1" },
          { type: "edge", source: "down-1", target: "down-2" },
        ],
      },
      undefined,
      "chain"
    );
    expect(unrelated).toEqual([
      { id: "up-side", type: "node" },
      { id: "down-side", type: "node" },
      { id: "edge-up-side", type: "edge", source: "up-1", target: "up-side" },
      {
        id: "edge-down-side",
        type: "edge",
        source: "down-side",
        target: "down-1",
      },
    ]);
  });
});
