import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { auth } from "@next-core/easyops-runtime";
import { fireEvent } from "@testing-library/react";
import "./";
import type { EasyopsNavbarAlerts } from "./index.js";
import { i18n, initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";

jest.mock("@next-core/theme", () => ({}));
jest.mock("@next-core/runtime", () => ({
  getRuntime() {
    return {
      getMiscSettings() {
        return {
          loadTime: 3000,
        };
      },
    };
  },
}));
jest.mock("@next-core/easyops-runtime", () => ({
  auth: {
    getAuth: jest.fn(() => ({})),
  },
}));
jest.mock("@next-core/react-runtime", () => ({
  useCurrentApp() {
    return {
      isBuildPush: true,
    };
  },
}));

initializeI18n();
initializeI18n(NS, locales);

const mockGetAuth = auth.getAuth as jest.Mock<any>;

describe("nav.easyops-navbar-alerts", () => {
  test("no alerts", () => {
    const element = document.createElement(
      "nav.easyops-navbar-alerts"
    ) as EasyopsNavbarAlerts;

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(0);
    expect(element.shadowRoot?.querySelectorAll(".alert")?.length).toBe(0);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("license expire soon", async () => {
    await i18n.changeLanguage("zh");
    mockGetAuth.mockReturnValue({
      license: {
        validDaysLeft: 7,
      },
      isAdmin: true,
    });

    const element = document.createElement(
      "nav.easyops-navbar-alerts"
    ) as EasyopsNavbarAlerts;

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.querySelectorAll(".alert")?.length).toBe(1);
    expect(element.shadowRoot?.querySelector(".text")?.textContent).toBe(
      "离 License 过期还有 7 天"
    );

    fireEvent.click(element.shadowRoot?.querySelector(".icon") as HTMLElement);
    expect(element.shadowRoot?.querySelectorAll(".alert")?.length).toBe(0);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("license expire not soon", () => {
    mockGetAuth.mockReturnValue({
      license: {
        validDaysLeft: 20,
      },
      isAdmin: true,
    });

    const element = document.createElement(
      "nav.easyops-navbar-alerts"
    ) as EasyopsNavbarAlerts;

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.querySelectorAll(".alert")?.length).toBe(0);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("render alert", async () => {
    await i18n.changeLanguage("zh");
    const element = document.createElement(
      "nav.easyops-navbar-alerts"
    ) as EasyopsNavbarAlerts;

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.querySelectorAll(".alert")?.length).toBe(0);

    act(() => {
      window.dispatchEvent(
        new CustomEvent("route.render", {
          detail: { renderTime: 3456 },
        })
      );
    });
    expect(element.shadowRoot?.querySelectorAll(".alert")?.length).toBe(1);
    expect(element.shadowRoot?.querySelector(".text")?.textContent).toContain(
      "当前页面渲染时间为 3.456 秒"
    );

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("license alert uses singular and plural English forms", async () => {
    await i18n.changeLanguage("en");
    mockGetAuth.mockReturnValue({
      org: "english-org",
      license: { validDaysLeft: 1 },
      isAdmin: true,
    });

    const singular = document.createElement(
      "nav.easyops-navbar-alerts"
    ) as EasyopsNavbarAlerts;
    act(() => document.body.appendChild(singular));
    expect(singular.shadowRoot?.querySelector(".text")?.textContent).toBe(
      "License expires in 1 day"
    );
    act(() => document.body.removeChild(singular));

    mockGetAuth.mockReturnValue({
      org: "english-org",
      license: { validDaysLeft: 7 },
      isAdmin: true,
    });
    const plural = document.createElement(
      "nav.easyops-navbar-alerts"
    ) as EasyopsNavbarAlerts;
    act(() => document.body.appendChild(plural));
    expect(plural.shadowRoot?.querySelector(".text")?.textContent).toBe(
      "License expires in 7 days"
    );
    act(() => document.body.removeChild(plural));
    await i18n.changeLanguage("zh");
  });
});
