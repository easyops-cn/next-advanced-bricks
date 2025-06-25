import * as runtime from "@next-core/runtime";
import { flowApi } from "@next-core/easyops-runtime";
import { capture } from "./capture.js";
import {
  setPreviewFromOrigin,
  startInspecting,
  stopInspecting,
} from "./inspector.js";
import _connect from "./connect.js";
jest.mock("@next-core/runtime");
jest.mock("@next-core/easyops-runtime");
jest.mock("./inspector.js");

jest.mock("./capture.js");
jest.mock("./collectUsedContracts.js");
const historyListeners = new Set<(loc: string) => void>();
const history = {
  location: {
    pathname: "/a",
  },
  createHref(loc: runtime.NextLocation) {
    return `/next${loc.pathname}`;
  },
  listen(fn: any) {
    historyListeners.add(fn);
  },
  push(pathname: string) {
    this.location = {
      pathname,
    };
    for (const fn of historyListeners) {
      fn(this.location);
    }
  },
  reload: jest.fn(),
  goForward: jest.fn(),
  goBack: jest.fn(),
} as any;
jest.spyOn(runtime, "getHistory").mockReturnValue(history);
// jest.spyOn(runtime.__secret_internals, "updateStoryboard").mockImplementation();

jest.spyOn(flowApi, "collectDebugContract");
jest
  .spyOn(runtime.__secret_internals, "updateTemplatePreviewSettings")
  .mockImplementation();
jest
  .spyOn(runtime.__secret_internals, "updateStoryboardByRoute")
  .mockImplementation();
jest
  .spyOn(runtime.__secret_internals, "updateStoryboardByTemplate")
  .mockImplementation();
jest
  .spyOn(runtime.__secret_internals, "updateStoryboardBySnippet")
  .mockImplementation();
// jest.spyOn(runtime.__secret_internals, "updateFormPreviewSettings").mockImplementation();
jest
  .spyOn(runtime, "matchPath")
  .mockImplementation((pathname, options) =>
    pathname === options.path ? ({} as any) : null
  );
jest.spyOn(runtime.__secret_internals, "getContextValue").mockImplementation();
jest
  .spyOn(runtime.__secret_internals, "getAllContextValues")
  .mockImplementation();

jest.spyOn(runtime.__secret_internals, "getLegalRuntimeValue").mockReturnValue({
  app: { homepage: "/cmdb" },
  sys: { username: "easyops" },
  query: new URLSearchParams("a=x"),
} as any);

(runtime.__secret_internals as any).updateFormPreviewSettings = jest.fn();

const realTimeDataInspectHooks: any = [];
jest
  .spyOn(runtime.__secret_internals, "addRealTimeDataInspectHook")
  .mockImplementation((hook) => {
    realTimeDataInspectHooks.push(hook);
  });
jest.spyOn(runtime.__secret_internals, "setRealTimeDataInspectRoot");

const mockCapture = capture as jest.Mock;

const parentPostMessage = jest.fn();
// Must delete it first in Jest.
delete (window as any).parent;
window.parent = {
  postMessage: parentPostMessage,
} as any;

const addEventListener = jest.spyOn(window, "addEventListener");

customElements.define(
  "eo-page-view",
  class extends HTMLElement {
    connectedCallback() {
      const shadowRoot = this.attachShadow({ mode: "open" });
      const content = document.createElement("div");
      content.className = "content";
      shadowRoot.appendChild(content);
    }
  }
);

customElements.define(
  "eo-with-brick-in-shadow",
  class extends HTMLElement {
    connectedCallback() {
      const shadowRoot = this.attachShadow({ mode: "open" });
      const content = document.createElement("div");
      content.dataset.iid = "i-02";
      shadowRoot.appendChild(content);
    }
  }
);

describe("connect", () => {
  let connect: typeof _connect;
  const realLocation = window.location;

  beforeEach(() => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const m = require("./connect.js");
      connect = m.default;
    });
    document.body.replaceChildren();
  });

  beforeAll(() => {
    delete (window as any).location;
    (window as any).location = {
      href: "http://localhost/",
      origin: "http://localhost",
      reload: jest.fn(),
    } as unknown as Location;
  });

  afterAll(() => {
    (window as any).location = realLocation;
  });

  it("should work", async () => {
    const brick = document.createElement("div");
    brick.dataset.iid = "i-01";
    document.body.appendChild(brick);

    const mainElement = document.createElement("div");
    mainElement.setAttribute("id", "main-mount-point");

    const span = document.createElement("span");
    span.dataset.tplStateStoreId = "tpl-state-8";

    mainElement.appendChild(span);
    document.body.appendChild(mainElement);

    connect("http://localhost:8081", {
      routePath: "/a",
      routeExact: true,
      appId: "my-app",
      templateId: "my-tpl",
    });
    expect(history.reload).toHaveBeenCalledTimes(1);
    expect(setPreviewFromOrigin).toHaveBeenCalledWith("http://localhost:8081");
    expect(parentPostMessage).toHaveBeenCalledTimes(4);
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      1,
      {
        sender: "previewer",
        type: "preview-started",
      },
      "http://localhost:8081"
    );
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      2,
      {
        sender: "previewer",
        type: "url-change",
        url: "http://localhost/next/a",
      },
      "http://localhost:8081"
    );
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      3,
      {
        sender: "previewer",
        type: "route-match-change",
        match: true,
      },
      "http://localhost:8081"
    );

    history.push("/b");
    expect(parentPostMessage).toHaveBeenCalledTimes(6);

    expect(parentPostMessage).toHaveBeenNthCalledWith(
      4,
      {
        sender: "previewer",
        type: "inspect-runtime-data-value",
        data: {
          app: { homepage: "/cmdb" },
          sys: { username: "easyops" },
          query: { a: "x" },
        },
      },
      "http://localhost:8081"
    );

    expect(parentPostMessage).toHaveBeenNthCalledWith(
      5,
      {
        sender: "previewer",
        type: "url-change",
        url: "http://localhost/next/b",
      },
      "http://localhost:8081"
    );
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      6,
      {
        sender: "previewer",
        type: "route-match-change",
        match: false,
      },
      "http://localhost:8081"
    );

    // Ignore re-start.
    connect("http://localhost:8081", { appId: "test" });
    expect(parentPostMessage).toHaveBeenCalledTimes(6);

    const listener = addEventListener.mock.calls[0][1] as EventListener;
    listener({
      // From different origin.
      origin: "http://localhost:3000",
      data: {
        sender: "preview-container",
        type: "toggle-inspecting",
      },
    } as any);
    listener({
      // Data is null.
      origin: "http://localhost:8081",
      data: null,
    } as any);
    listener({
      // Unknown type.
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "unknown",
      },
    } as any);
    listener({
      // No `forwardedFor`.
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "hover-on-brick",
        iid: "i-01",
      },
    } as any);
    listener({
      // Unexpected sender.
      origin: "http://localhost:8081",
      data: {
        sender: "builder",
        type: "toggle-inspecting",
      },
    } as any);
    expect(startInspecting).not.toHaveBeenCalled();
    expect(stopInspecting).not.toHaveBeenCalled();

    // Hover on brick.
    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "hover-on-brick",
        forwardedFor: "builder",
        iid: "i-01",
      },
    } as any);
    expect(parentPostMessage).toHaveBeenCalledTimes(7);
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      7,
      {
        sender: "previewer",
        type: "highlight-brick",
        highlightType: "hover",
        outlines: [{ width: 0, height: 0, left: 0, top: 0 }],
        iid: "i-01",
      },
      "http://localhost:8081"
    );

    // Select brick.
    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "select-brick",
        forwardedFor: "builder",
        iid: "i-01",
      },
    } as any);
    expect(parentPostMessage).toHaveBeenCalledTimes(8);
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      8,
      {
        sender: "previewer",
        type: "highlight-brick",
        highlightType: "active",
        outlines: [{ width: 0, height: 0, left: 0, top: 0 }],
        iid: "i-01",
      },
      "http://localhost:8081"
    );

    // Unselect brick.
    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "select-brick",
        forwardedFor: "builder",
        iid: null,
      },
    } as any);
    expect(parentPostMessage).toHaveBeenCalledTimes(9);
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      9,
      {
        sender: "previewer",
        type: "highlight-brick",
        highlightType: "active",
        outlines: [],
        iid: null,
      },
      "http://localhost:8081"
    );

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "toggle-inspecting",
        enabled: true,
      },
    } as any);
    expect(startInspecting).toHaveBeenCalledTimes(1);

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "toggle-inspecting",
        enabled: false,
      },
    } as any);
    expect(stopInspecting).toHaveBeenCalledTimes(1);

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "reload",
      },
    } as any);
    expect(window.location.reload).toHaveBeenCalledTimes(1);

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "refresh",
        storyboardPatch: { routes: [] },
      },
    } as any);
    expect(runtime.__secret_internals.updateStoryboard).toHaveBeenCalledWith(
      "my-app",
      {
        routes: [],
      }
    );
    expect(history.reload).toHaveBeenCalledTimes(2);

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "refresh",
        storyboardPatch: { routes: [] },
        settings: {
          properties: { dataTest: "good" },
        },
      },
    } as any);
    expect(
      runtime.__secret_internals.updateTemplatePreviewSettings
    ).toHaveBeenCalledWith("my-app", "my-tpl", {
      properties: { dataTest: "good" },
    });
    expect(history.reload).toHaveBeenCalledTimes(3);

    mockCapture.mockResolvedValueOnce("data:image/png;base64");
    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "capture",
        maxWidth: 200,
        maxHeight: 150,
      },
    } as any);
    expect(capture).toHaveBeenNthCalledWith(1, 200, 150);
    expect(parentPostMessage).toHaveBeenCalledTimes(9);
    await (global as any).flushPromises();
    expect(parentPostMessage).toHaveBeenCalledTimes(10);
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      10,
      {
        sender: "previewer",
        type: "capture-ok",
        screenshot: "data:image/png;base64",
      },
      "http://localhost:8081"
    );

    mockCapture.mockRejectedValueOnce(null);
    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "capture",
        maxWidth: 400,
        maxHeight: 300,
      },
    } as any);
    expect(capture).toHaveBeenNthCalledWith(2, 400, 300);
    expect(parentPostMessage).toHaveBeenCalledTimes(10);
    await (global as any).flushPromises();
    expect(parentPostMessage).toHaveBeenCalledTimes(11);
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      11,
      {
        sender: "previewer",
        type: "capture-failed",
      },
      "http://localhost:8081"
    );

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "hover-on-context",
        forwardedFor: "builder",
        highlightNodes: [
          {
            iid: "i-01",
            alias: "test",
          },
        ],
      },
    } as any);
    expect(parentPostMessage).toHaveBeenCalledTimes(12);
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      12,
      {
        sender: "previewer",
        type: "highlight-context",
        outlines: [{ width: 0, height: 0, left: 0, top: 0, alias: "test" }],
      },
      "http://localhost:8081"
    );

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "refresh",
        storyboardPatch: { routes: [] },
        options: {
          updateStoryboardType: "route",
        },
      },
    } as any);

    expect(runtime.__secret_internals.updateStoryboardByRoute).toHaveBeenCalledWith(
      "my-app",
      {
        routes: [],
      }
    );

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "refresh",
        storyboardPatch: { routes: [] },
        options: {
          updateStoryboardType: "template",
          settings: {
            properties: {
              textContent: 123,
            },
          },
        },
      },
    } as any);

    expect(
      runtime.__secret_internals.updateStoryboardByTemplate
    ).toHaveBeenCalledWith(
      "my-app",
      {
        routes: [],
      },
      {
        properties: {
          textContent: 123,
        },
      }
    );

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "refresh",
        storyboardPatch: { snippetId: "test-snippet", bricks: [] },
        options: {
          updateStoryboardType: "snippet",
        },
      },
    } as any);

    expect(runtime.__secret_internals.updateStoryboardBySnippet).toHaveBeenCalledWith(
      "my-app",
      {
        snippetId: "test-snippet",
        bricks: [],
      }
    );

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "refresh",
        storyboardPatch: { formSchema: {}, fieldList: [] },
        options: {
          updateStoryboardType: "form",
        },
      },
    } as any);

    // expect(runtime.__secret_internals.updateFormPreviewSettings).toHaveBeenCalledWith(
    //   "my-app",
    //   undefined,
    //   { formSchema: {}, fieldList: [] }
    // );

    // listener({
    //   origin: "http://localhost:8081",
    //   data: {
    //     sender: "preview-container",
    //     type: "back",
    //   },
    // } as any);

    // expect(history.goBack).toHaveBeenCalledTimes(1);

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "forward",
      },
    } as any);

    expect(history.goForward).toHaveBeenCalledTimes(1);

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "inspect-data-value",
        name: "pageSize",
        option: {
          dataType: "context",
        },
      },
    } as any);

    expect(runtime.__secret_internals.getContextValue).toHaveBeenLastCalledWith(
      "pageSize",
      {
        tplStateStoreId: undefined,
      }
    );

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "inspect-data-value",
        name: undefined,
        option: {
          dataType: "context",
        },
      },
    } as any);

    expect(
      runtime.__secret_internals.getAllContextValues
    ).toHaveBeenLastCalledWith({
      tplStateStoreId: undefined,
    });

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "inspect-data-value",
        name: "name",
        option: {
          dataType: "state",
        },
      },
    } as any);

    expect(runtime.__secret_internals.getContextValue).toHaveBeenLastCalledWith(
      "name",
      {
        tplStateStoreId: "tpl-state-8",
      }
    );

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "inspect-data-value",
        name: undefined,
        option: {
          dataType: "state",
        },
      },
    } as any);

    expect(
      runtime.__secret_internals.getAllContextValues
    ).toHaveBeenLastCalledWith({
      tplStateStoreId: "tpl-state-8",
    });

    span.dataset.tplStateStoreId = "";

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "inspect-data-value",
        name: "name",
        option: {
          dataType: "state",
        },
      },
    } as any);

    expect(parentPostMessage).toHaveBeenNthCalledWith(
      17,
      {
        sender: "previewer",
        type: "inspect-data-value-error",
        data: {
          error: {
            message: "tplStateStoreId not found, unable to preview STATE value",
          },
        },
      },
      "http://localhost:8081"
    );

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "debug-data-value",
        debugData: {
          value: "<% 1 + 1 %>",
        },
        options: {
          dataType: "context",
        },
      },
    } as any);

    expect(runtime.__secret_internals.debugDataValue).toHaveBeenLastCalledWith(
      {
        value: "<% 1 + 1 %>",
      },
      { tplStateStoreId: undefined }
    );

    span.dataset.tplStateStoreId = "tpl-state-8";
    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "debug-data-value",
        debugData: {
          resolve: {
            useProvider: "easyops.cmdb.instance@postSearch:1.0.0",
            args: ["APP"],
          },
        },
        contractData: {
          name: "postSearch",
          namespaceId: "easyops.cmdb.instance",
          version: "1.0.0",
          endpoint: {
            method: "POST",
            uri: "/api/cmdb",
          },
        },
        options: {
          dataType: "state",
        },
      },
    } as any);

    expect(runtime.__secret_internals.debugDataValue).toHaveBeenLastCalledWith(
      {
        resolve: {
          useProvider: "easyops.cmdb.instance@postSearch:1.0.0",
          args: ["APP"],
        },
      },
      { tplStateStoreId: "tpl-state-8" }
    );

    jest
      .spyOn(runtime.__secret_internals, "debugDataValue")
      .mockRejectedValueOnce(new Error("error"));
    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "debug-data-value",
        debugData: {
          resolve: {
            useProvider: "easyops.cmdb.instance@postSearch:1.0.0",
            args: ["<% STATE.AppId %>"],
          },
        },
        contractData: {
          name: "postSearch",
          namespaceId: "easyops.cmdb.instance",
          version: "1.0.0",
          endpoint: {
            method: "POST",
            uri: "/api/cmdb",
          },
        },
        options: {
          dataType: "state",
        },
      },
    } as any);

    await (global as any).flushPromises();

    expect(parentPostMessage).toHaveBeenNthCalledWith(
      20,
      {
        sender: "previewer",
        type: "debug-data-value-error",
        data: {
          message: "error",
        },
      },
      "http://localhost:8081"
    );

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "excute-proxy-method",
        proxyMethodArgs: ["div", "getAttributeNames"],
      },
    } as any);
    expect(parentPostMessage).toHaveBeenNthCalledWith(21, {
      data: {
        method: "getAttributeNames",
        res: ["data-iid"],
      },
      sender: "previewer",
      type: "excute-proxy-method-success",
    });

    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "excute-proxy-method",
        proxyMethodArgs: ["div", "test"],
      },
    } as any);

    expect(parentPostMessage).toHaveBeenNthCalledWith(22, {
      data: {
        method: "test",
        res: "document.body.querySelector(...)[method] is not a function",
      },
      sender: "previewer",
      type: "excute-proxy-method-error",
    });

    for (const hook of realTimeDataInspectHooks) {
      hook({
        changeType: "initialize",
        detail: {
          data: { a: 1 },
        },
      });
    }

    for (const hook of realTimeDataInspectHooks) {
      hook({
        changeType: "update",
        detail: {
          name: "a",
          value: 2,
        },
      });
    }

    expect(
      runtime.__secret_internals.setRealTimeDataInspectRoot
    ).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new CustomEvent("route.render"));
    expect(
      runtime.__secret_internals.setRealTimeDataInspectRoot
    ).toHaveBeenCalledTimes(2);
  });

  it("should handle bricks in shadow DOM", async () => {
    const withBrickInShadow = document.createElement("eo-with-brick-in-shadow");
    document.body.appendChild(withBrickInShadow);

    connect("http://localhost:8081", {
      routePath: "/a",
      routeExact: true,
      appId: "my-app",
    });

    expect(parentPostMessage).toHaveBeenCalledTimes(4);

    const listener = addEventListener.mock.calls[0][1] as EventListener;

    // Hover on brick.
    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "hover-on-brick",
        forwardedFor: "builder",
        iid: "i-02",
      },
    } as any);
    expect(parentPostMessage).toHaveBeenCalledTimes(5);
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      5,
      {
        sender: "previewer",
        type: "highlight-brick",
        highlightType: "hover",
        outlines: [{ width: 0, height: 0, left: 0, top: 0 }],
        iid: "i-02",
      },
      "http://localhost:8081"
    );
  });

  it("should handle content scroll", async () => {
    const pageView = document.createElement("eo-page-view");
    document.body.appendChild(pageView);

    const brick = document.createElement("div");
    brick.dataset.iid = "i-01";
    pageView.appendChild(brick);

    connect("http://localhost:8081", {
      routePath: "/a",
      routeExact: true,
      appId: "my-app",
      templateId: "my-tpl",
    });

    expect(parentPostMessage).toHaveBeenCalledTimes(4);

    const listener = addEventListener.mock.calls[0][1] as EventListener;

    // Hover on brick.
    listener({
      origin: "http://localhost:8081",
      data: {
        sender: "preview-container",
        type: "hover-on-brick",
        forwardedFor: "builder",
        iid: "i-01",
      },
    } as any);
    expect(parentPostMessage).toHaveBeenCalledTimes(5);
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      5,
      {
        sender: "previewer",
        type: "highlight-brick",
        highlightType: "hover",
        outlines: [
          { width: 0, height: 0, left: 0, top: 0, hasContentScroll: true },
        ],
        iid: "i-01",
      },
      "http://localhost:8081"
    );

    pageView.shadowRoot
      ?.querySelector(".content")
      ?.dispatchEvent(new Event("scroll"));
    expect(parentPostMessage).toHaveBeenCalledTimes(6);
    expect(parentPostMessage).toHaveBeenNthCalledWith(
      6,
      {
        sender: "previewer",
        type: "content-scroll",
        scroll: {
          x: 0,
          y: 0,
        },
      },
      "http://localhost:8081"
    );
  });
});
