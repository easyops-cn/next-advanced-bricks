import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { getByText, fireEvent } from "@testing-library/dom";
import "./";
import type { EoTree } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

function getNodesOtherThanStyle(node: NodeList): Node[] {
  return [...node].filter((node) => (node as Element).tagName !== "STYLE");
}

const treeData = [
  {
    title: "parent 1",
    key: "0-0",
    children: [
      {
        title: "intermediate 1-0",
        key: "0-0-0",
        children: [
          {
            title: "leaf a",
            key: "0-0-0-0",
          },
          {
            title: "leaf b",
            key: "0-0-0-1",
          },
        ],
      },
      {
        title: "intermediate 1-1",
        key: "0-0-1",
        children: [{ title: "leaf c", key: "0-0-1-0" }],
      },
    ],
  },
];

describe("eo-tree", () => {
  test("basic usage", async () => {
    const element = document.createElement("eo-tree") as EoTree;
    element.checkable = true;
    element.selectable = false;
    element.defaultExpandAll = true;
    element.dataSource = treeData;
    element.titleSuffixBrick = {
      useBrick: {
        brick: "span",
        properties: {
          className: "title-suffix-brick",
        },
      },
    };

    const onCheck = jest.fn();
    const onCheckDetail = jest.fn();

    element.addEventListener("check", (e) =>
      onCheck((e as CustomEvent).detail)
    );
    element.addEventListener("check.detail", (e) =>
      onCheckDetail((e as CustomEvent).detail)
    );

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      fireEvent.click(
        getByText(element.shadowRoot!.querySelector(".ant-tree")!, "leaf a")
      );
    });

    expect(onCheck).toHaveBeenCalledTimes(1);
    expect(onCheckDetail).toHaveBeenCalledTimes(1);
    expect(onCheck).toHaveBeenCalledWith(["0-0-0-0"]);
    expect(onCheckDetail).toHaveBeenCalledWith({
      checkedKeys: ["0-0-0-0"],
      halfCheckedKeys: ["0-0-0", "0-0"],
    });

    act(() => {
      document.body.removeChild(element);
    });

    // Antd comonent will inject styles that will not be removed.
    // Even if setted `autoClear` https://github.com/ant-design/cssinjs?tab=readme-ov-file#styleprovider
    expect(getNodesOtherThanStyle(element.shadowRoot!.childNodes).length).toBe(
      0
    );
  });

  test("switcher icon and dark theme", async () => {
    const element = document.createElement("eo-tree") as EoTree;
    element.expandedKeys = [];
    element.checkedKeys = [];
    element.dataSource = treeData;
    act(() => {
      document.body.appendChild(element);
    });

    // Switcher icon defaults to caret by auto if `showLine` is not setted.
    expect(
      element.shadowRoot
        ?.querySelector(".ant-tree-switcher-icon")
        ?.classList.contains("anticon-caret-down")
    ).toBe(true);

    // Change switcher icon to chevron.
    element.switcherIcon = "chevron";
    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(
      element.shadowRoot
        ?.querySelector(".ant-tree-switcher-icon")
        ?.classList.contains("anticon-down")
    ).toBe(true);

    // Hide switcher icon
    element.switcherIcon = false;
    await act(async () => {
      await (global as any).flushPromises();
    });
    expect(element.shadowRoot?.querySelector(".ant-tree-switcher-icon")).toBe(
      null
    );

    // Change theme
    act(() => {
      window.dispatchEvent(
        new CustomEvent("theme.change", { detail: "dark-v2" })
      );
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("expand", async () => {
    const element = document.createElement("eo-tree") as EoTree;
    element.dataSource = treeData;

    const onExpand = jest.fn();

    element.addEventListener("expand", (e) =>
      onExpand((e as CustomEvent).detail)
    );

    act(() => {
      document.body.appendChild(element);
    });

    expect(
      element.shadowRoot
        ?.querySelector(".ant-tree-switcher")
        ?.classList.contains("ant-tree-switcher_open")
    ).toBe(false);

    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector(".ant-tree-switcher")!);
    });

    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(onExpand).toHaveBeenCalledWith(["0-0"]);

    expect(
      element.shadowRoot
        ?.querySelector(".ant-tree-switcher")
        ?.classList.contains("ant-tree-switcher_open")
    ).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });
});
