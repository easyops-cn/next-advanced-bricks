import { describe, test, expect, jest } from "@jest/globals";
import { fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import "./";
import type { EoDirectoryTree } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("eo-directory-tree", () => {
  test("basic usage", async () => {
    const onExpand = jest.fn();
    const onSelect = jest.fn();
    const element = document.createElement(
      "eo-directory-tree"
    ) as EoDirectoryTree;
    element.data = [
      {
        key: "0",
        title: "第一层级 - 0",
      },
      {
        key: "1",
        title: "第一层级 - 1",
        children: [
          {
            key: "1-0",
            title: "第二层级 - 0",
          },
          {
            key: "1-1",
            title: "第二层级 - 1",
            children: [
              {
                key: "1-1-0",
                title: "第三层级 - 0",
              },
              {
                key: "1-1-1",
                title: "第三层级 - 1",
              },
              {
                key: "1-1-2",
                title: "第三层级 - 2",
              },
            ],
          },
          {
            key: "1-3",
            title: "第二层级 - 3",
          },
        ],
      },
      {
        key: "2",
        title: "第一层级 - 2",
      },
      {
        key: "3",
        title: "第一层级 - 3",
      },
      {
        key: "4",
        title: "第一层级 - 4",
      },
    ];
    element.directoryTitle = "目录名称标题";
    element.searchable = true;
    element.addEventListener("expand", onExpand);
    element.addEventListener("select", onSelect);

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.querySelector(".tree")).toMatchInlineSnapshot(`
<div
  class="tree"
>
  <eo-directory-tree-leaf
    class=""
    depth="0"
  >
    <span
      title="第一层级 - 0"
    >
      第一层级 - 0
    </span>
  </eo-directory-tree-leaf>
  <eo-directory-tree-internal-node
    class=""
    depth="0"
  >
    <span
      slot="label"
      title="第一层级 - 1"
    >
      第一层级 - 1
    </span>
  </eo-directory-tree-internal-node>
  <eo-directory-tree-leaf
    class=""
    depth="0"
  >
    <span
      title="第一层级 - 2"
    >
      第一层级 - 2
    </span>
  </eo-directory-tree-leaf>
  <eo-directory-tree-leaf
    class=""
    depth="0"
  >
    <span
      title="第一层级 - 3"
    >
      第一层级 - 3
    </span>
  </eo-directory-tree-leaf>
  <eo-directory-tree-leaf
    class=""
    depth="0"
  >
    <span
      title="第一层级 - 4"
    >
      第一层级 - 4
    </span>
  </eo-directory-tree-leaf>
</div>
`);

    await act(async () => {
      fireEvent(
        element.shadowRoot?.querySelectorAll(
          "eo-directory-tree-leaf"
        )[0] as HTMLElement,
        new CustomEvent("select")
      );
    });
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          keys: ["0"],
        }),
      })
    );

    // Expand a node
    await act(async () => {
      fireEvent(
        element.shadowRoot?.querySelectorAll(
          "eo-directory-tree-internal-node"
        )[0] as HTMLElement,
        new CustomEvent("expand", { detail: true })
      );
    });
    expect(onExpand).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          keys: ["1"],
        }),
      })
    );

    // Collapse a node
    await act(async () => {
      fireEvent(
        element.shadowRoot?.querySelectorAll(
          "eo-directory-tree-internal-node"
        )[0] as HTMLElement,
        new CustomEvent("expand", { detail: false })
      );
    });
    expect(onExpand).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          keys: [],
        }),
      })
    );

    await act(async () => {
      fireEvent(
        element.shadowRoot?.querySelector(".directory-search") as HTMLElement,
        new CustomEvent("search", { detail: "第二层级" })
      );
    });
    expect(element.shadowRoot?.querySelector(".tree")).toMatchInlineSnapshot(`
<div
  class="tree"
>
  <eo-directory-tree-internal-node
    class=""
    depth="0"
    expanded=""
  >
    <span
      slot="label"
      title="第一层级 - 1"
    >
      第一层级 - 1
    </span>
  </eo-directory-tree-internal-node>
  <eo-directory-tree-leaf
    class=""
    depth="1"
  >
    <span
      title="第二层级 - 0"
    >
      第二层级 - 0
    </span>
  </eo-directory-tree-leaf>
  <eo-directory-tree-internal-node
    class=""
    depth="1"
  >
    <span
      slot="label"
      title="第二层级 - 1"
    >
      第二层级 - 1
    </span>
  </eo-directory-tree-internal-node>
  <eo-directory-tree-leaf
    class=""
    depth="1"
  >
    <span
      title="第二层级 - 3"
    >
      第二层级 - 3
    </span>
  </eo-directory-tree-leaf>
</div>
`);

    await act(async () => {
      element.selectedKeys = ["1-1-0"];
      element.expandAccordingToSelectedKeys();
    });
    expect(element.shadowRoot?.querySelector(".tree")).toMatchInlineSnapshot(`
<div
  class="tree"
>
  <eo-directory-tree-internal-node
    class=""
    depth="0"
    expanded=""
  >
    <span
      slot="label"
      title="第一层级 - 1"
    >
      第一层级 - 1
    </span>
  </eo-directory-tree-internal-node>
  <eo-directory-tree-leaf
    class=""
    depth="1"
  >
    <span
      title="第二层级 - 0"
    >
      第二层级 - 0
    </span>
  </eo-directory-tree-leaf>
  <eo-directory-tree-internal-node
    class=""
    depth="1"
    expanded=""
  >
    <span
      slot="label"
      title="第二层级 - 1"
    >
      第二层级 - 1
    </span>
  </eo-directory-tree-internal-node>
  <eo-directory-tree-leaf
    class=""
    depth="2"
    selected=""
  >
    <span
      title="第三层级 - 0"
    >
      第三层级 - 0
    </span>
  </eo-directory-tree-leaf>
  <eo-directory-tree-leaf
    class=""
    depth="2"
  >
    <span
      title="第三层级 - 1"
    >
      第三层级 - 1
    </span>
  </eo-directory-tree-leaf>
  <eo-directory-tree-leaf
    class=""
    depth="2"
  >
    <span
      title="第三层级 - 2"
    >
      第三层级 - 2
    </span>
  </eo-directory-tree-leaf>
  <eo-directory-tree-leaf
    class=""
    depth="1"
  >
    <span
      title="第二层级 - 3"
    >
      第二层级 - 3
    </span>
  </eo-directory-tree-leaf>
</div>
`);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("internalNodeSelectable", async () => {
    const element = document.createElement(
      "eo-directory-tree"
    ) as EoDirectoryTree;
    element.data = [
      {
        key: "0",
        title: "第一层级 - 0",
      },
      {
        key: "1",
        title: "第一层级 - 1",
        children: [
          {
            key: "1-0",
            title: "第二层级 - 0",
          },
        ],
      },
      {
        key: "2",
        title: "第一层级 - 2",
      },
    ];
    element.suffixBrick = {
      when: "hover",
      useBrick: {
        brick: "hr",
      },
    };
    element.internalNodeSelectable = true;
    const onSelect = jest.fn();
    element.addEventListener("select", onSelect);

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.querySelector(".tree")).toMatchInlineSnapshot(`
<div
  class="tree"
>
  <eo-directory-tree-leaf
    class="show-suffix-when-hover"
    depth="0"
  >
    <span
      title="第一层级 - 0"
    >
      第一层级 - 0
    </span>
    <div
      class="suffix"
      slot="suffix"
    />
  </eo-directory-tree-leaf>
  <eo-directory-tree-internal-node
    class="show-suffix-when-hover"
    depth="0"
    selectable=""
  >
    <span
      slot="label"
      title="第一层级 - 1"
    >
      第一层级 - 1
    </span>
    <div
      class="suffix"
      slot="suffix"
    />
  </eo-directory-tree-internal-node>
  <eo-directory-tree-leaf
    class="show-suffix-when-hover"
    depth="0"
  >
    <span
      title="第一层级 - 2"
    >
      第一层级 - 2
    </span>
    <div
      class="suffix"
      slot="suffix"
    />
  </eo-directory-tree-leaf>
</div>
`);

    // Select an internal node
    await act(async () => {
      fireEvent(
        element.shadowRoot?.querySelectorAll(
          "eo-directory-tree-internal-node"
        )[0] as HTMLElement,
        new CustomEvent("select")
      );
    });
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          keys: ["1"],
        }),
      })
    );

    act(() => {
      document.body.removeChild(element);
    });
  });
});
