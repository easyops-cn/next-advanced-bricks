import { describe, test, expect, jest } from "@jest/globals";
import { fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import "./";
import type { PageArchNode } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("visual-builder.page-arch-node", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "visual-builder.page-arch-node"
    ) as PageArchNode;
    element.label = "Page A";
    const onLabelEditingChange = jest.fn();
    element.addEventListener("label.editing.change", (e) =>
      onLabelEditingChange((e as CustomEvent).detail)
    );
    const onLabelChange = jest.fn();
    element.addEventListener("label.change", (e) =>
      onLabelChange((e as CustomEvent).detail)
    );
    const onChildAppend = jest.fn();
    element.addEventListener("child.append", (e) =>
      onChildAppend((e as CustomEvent).detail)
    );
    const onNodeClick = jest.fn();
    element.addEventListener("node.click", onNodeClick);
    const onNodeDoubleClick = jest.fn();
    element.addEventListener("node.dblclick", onNodeDoubleClick);
    const onNodeContextMenu = jest.fn();
    element.addEventListener("node.contextmenu", onNodeContextMenu);

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes).toMatchInlineSnapshot(`
      NodeList [
        <style>
          styles.shadow.css
        </style>,
        <div
          class="node page"
          style="height: 130px;"
        >
          <input
            class="label-input"
            value="Page A"
          />
          <div
            class="label"
          >
            Page A
          </div>
          <div
            class="thumbnail-container"
            style="height: 98px;"
          >
            <div
              class="thumbnail-placeholder"
            >
              <eo-icon
                icon="ellipsis"
                lib="antd"
              />
            </div>
          </div>
        </div>,
        <div
          class="add-button"
          role="button"
        >
          <eo-icon
            icon="plus"
            lib="fa"
          />
        </div>,
      ]
    `);

    // Enable editing label
    expect(
      element.shadowRoot
        ?.querySelector(".node")
        ?.classList.contains("editing-label")
    ).toBe(false);
    act(() => {
      fireEvent.dblClick(element.shadowRoot?.querySelector(".label"));
    });
    expect(
      element.shadowRoot
        ?.querySelector(".node")
        ?.classList.contains("editing-label")
    ).toBe(true);
    expect(onLabelEditingChange).toHaveBeenCalledTimes(1);
    expect(onLabelEditingChange).toHaveBeenCalledWith(true);

    act(() => {
      fireEvent.dblClick(element.shadowRoot?.querySelector(".label-input"));
    });
    expect(onNodeDoubleClick).not.toHaveBeenCalled();

    // Rename label
    act(() => {
      fireEvent.change(element.shadowRoot?.querySelector(".label-input"), {
        target: { value: "New Name" },
      });
    });
    expect(element.shadowRoot?.querySelector(".label")?.textContent).toBe(
      "New Name"
    );

    // Unrelated keydown
    act(() => {
      fireEvent.keyDown(element.shadowRoot?.querySelector(".label-input"), {
        key: "ArrowRight",
      });
    });
    expect(onLabelChange).toHaveBeenCalledTimes(0);

    act(() => {
      fireEvent.keyDown(element.shadowRoot?.querySelector(".label-input"), {
        key: "Enter",
      });
    });
    expect(onLabelChange).toHaveBeenCalledTimes(1);
    expect(onLabelChange).toHaveBeenCalledWith("New Name");

    act(() => {
      fireEvent.click(element.shadowRoot?.querySelector(".add-button"));
    });
    expect(onChildAppend).toHaveBeenCalledTimes(1);
    expect(onNodeClick).not.toHaveBeenCalled();

    act(() => {
      fireEvent.click(element.shadowRoot?.querySelector(".node"));
    });
    expect(onNodeClick).toHaveBeenCalledTimes(1);

    act(() => {
      fireEvent.dblClick(element.shadowRoot?.querySelector(".node"));
    });
    expect(onNodeDoubleClick).toHaveBeenCalledTimes(1);

    act(() => {
      fireEvent.contextMenu(element.shadowRoot?.querySelector(".node"));
    });
    expect(onNodeContextMenu).toHaveBeenCalledTimes(1);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("type board", async () => {
    const element = document.createElement(
      "visual-builder.page-arch-node"
    ) as PageArchNode;
    element.type = "board";
    element.label = "Board B";
    element.autoFocusOnce = "id-1";

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(
      element.shadowRoot?.querySelector(".node")?.classList.contains("board")
    ).toBe(true);

    // Auto focus
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
    expect(
      element.shadowRoot
        ?.querySelector(".node")
        ?.classList.contains("editing-label")
    ).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("external", async () => {
    const element = document.createElement(
      "visual-builder.page-arch-node"
    ) as PageArchNode;
    element.type = "page";
    element.label = "Link c";
    element.external = {
      label: "External X",
      id: "x",
    };
    const onExternalClick = jest.fn();
    element.addEventListener("external.click", (e) =>
      onExternalClick((e as CustomEvent).detail)
    );
    const onNodeClick = jest.fn();
    element.addEventListener("node.click", onNodeClick);

    act(() => {
      document.body.appendChild(element);
    });
    expect(
      element.shadowRoot?.querySelector(".external-label")?.textContent
    ).toBe("External X");

    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector(".external"));
    });
    expect(onExternalClick).toHaveBeenCalledWith({
      label: "External X",
      id: "x",
    });
    expect(onNodeClick).not.toHaveBeenCalled();

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("sub-nodes event", async () => {
    const element = document.createElement(
      "visual-builder.page-arch-node"
    ) as PageArchNode;
    element.type = "page";
    element.label = "Link c";
    element.subNodes = [
      {
        label: "Sub Node A",
        id: "a",
      },
    ];
    const onNodeDoubleClick = jest.fn();
    element.addEventListener("node.dblclick", onNodeDoubleClick);
    const onNodeContextMenu = jest.fn();
    element.addEventListener("node.contextmenu", onNodeContextMenu);
    const onSubNodeDoubleClick = jest.fn();
    element.addEventListener("subNode.dblclick", (e) => {
      onSubNodeDoubleClick((e as CustomEvent).detail);
    });
    const onSubNodeContextMenu = jest.fn();
    element.addEventListener("subNode.contextmenu", (e) => {
      onSubNodeContextMenu((e as CustomEvent).detail);
    });

    act(() => {
      document.body.appendChild(element);
    });

    expect(
      element.shadowRoot?.querySelector(".sub-nodes").childElementCount
    ).toBe(1);
    expect(
      (element.shadowRoot?.querySelector(".node") as HTMLElement).style.height
    ).toBe("130px");
    expect(
      (element.shadowRoot?.querySelector(".thumbnail-container") as HTMLElement)
        .style.height
    ).toBe("98px");

    act(() => {
      fireEvent.dblClick(element.shadowRoot!.querySelector(".sub-node"));
    });
    expect(onNodeDoubleClick).not.toHaveBeenCalled();
    expect(onSubNodeDoubleClick).toHaveBeenCalledWith({
      label: "Sub Node A",
      id: "a",
    });

    act(() => {
      fireEvent.contextMenu(element.shadowRoot!.querySelector(".sub-node"), {
        clientX: 100,
        clientY: 100,
      });
    });
    expect(onNodeContextMenu).not.toHaveBeenCalled();
    expect(onSubNodeContextMenu).toHaveBeenCalledWith({
      node: {
        label: "Sub Node A",
        id: "a",
      },
      clientX: 100,
      clientY: 100,
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("two rows of sub-nodes", async () => {
    const element = document.createElement(
      "visual-builder.page-arch-node"
    ) as PageArchNode;
    element.type = "page";
    element.label = "Link c";
    element.subNodes = [
      {
        label: "Sub Node A",
        id: "a",
      },
      {
        label: "Sub Node B",
        id: "b",
      },
      {
        label: "Sub Node C",
        id: "c",
      },
      {
        label: "Sub Node D",
        id: "d",
      },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    expect(
      element.shadowRoot?.querySelector(".sub-nodes").childElementCount
    ).toBe(4);
    expect(
      (element.shadowRoot?.querySelector(".node") as HTMLElement).style.height
    ).toBe("168px");
    expect(
      (element.shadowRoot?.querySelector(".thumbnail-container") as HTMLElement)
        .style.height
    ).toBe("136px");

    act(() => {
      document.body.removeChild(element);
    });
  });
});
