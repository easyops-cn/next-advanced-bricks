import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { EoCmdbInstanceSelect } from "./index.js";

jest.mock("@next-core/theme", () => ({}));
jest.mock("@next-core/react-runtime", () => ({
  useCurrentTheme: () => "light",
}));

const mockOnChange = jest.fn();
const mockOptionsChange = jest.fn();

jest.mock("./CmdbInstanceSelectInternal", () => ({
  CmdbInstanceSelect: jest.fn().mockImplementation((props: any) => {
    if (props.onChange) {
      mockOnChange.mockImplementation(props.onChange);
    }
    if (props.optionsChange) {
      mockOptionsChange.mockImplementation(props.optionsChange);
    }
    return null;
  }),
}));

describe("eo-cmdb-instance-select", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.label = "Select Instance";
    element.objectId = "HOST";
    element.value = "test-instance-id";
    element.placeholder = "Please select an instance";

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(0);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("required field", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.label = "Required Instance";
    element.objectId = "HOST";
    element.required = true;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.required).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("disabled state", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.disabled = true;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.disabled).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("multiple mode", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instances";
    element.objectId = "HOST";
    element.mode = "multiple";
    element.value = ["id1", "id2"];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.mode).toBe("multiple");
    expect(element.value).toEqual(["id1", "id2"]);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("change event", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";

    const changeHandler = jest.fn();
    const changeV2Handler = jest.fn();

    element.addEventListener("change", changeHandler as any);
    element.addEventListener("change.v2", changeV2Handler as any);

    act(() => {
      document.body.appendChild(element);
    });

    // Simulate change by calling the handler directly
    act(() => {
      mockOnChange("test-value", { value: "test-value", label: "Test Label" });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(element.value).toBe("test-value");
    expect(changeHandler).toHaveBeenCalled();
    expect(changeV2Handler).toHaveBeenCalled();

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("options change event", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";

    const optionsChangeHandler = jest.fn();
    element.addEventListener("options.change", optionsChangeHandler as any);

    act(() => {
      document.body.appendChild(element);
    });

    // Simulate options change by calling the handler directly
    act(() => {
      mockOptionsChange([{ value: "opt1", label: "Option 1" }]);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(optionsChangeHandler).toHaveBeenCalled();

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("allow clear", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.allowClear = true;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.allowClear).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("custom fields", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.fields = {
      label: "hostname",
      value: "instanceId",
    };

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.fields).toEqual({
      label: "hostname",
      value: "instanceId",
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("instance query filter", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.instanceQuery = {
      status: { $eq: "running" },
    };

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.instanceQuery).toEqual({
      status: { $eq: "running" },
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("page size configuration", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.pageSize = 50;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.pageSize).toBe(50);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("minimum input length", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.minimumInputLength = 3;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.minimumInputLength).toBe(3);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("extra search keys", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.extraSearchKey = ["ip", "hostname"];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.extraSearchKey).toEqual(["ip", "hostname"]);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("extra fields", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.extraFields = ["status", "region"];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.extraFields).toEqual(["status", "region"]);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("popover position type", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.popoverPositionType = "parent";

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.popoverPositionType).toBe("parent");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("multi label display", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.isMultiLabel = true;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.isMultiLabel).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("show search tip", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.showSearchTip = true;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.showSearchTip).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("custom label template", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.labelTemplate = "${hostname} (${ip})";

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.labelTemplate).toBe("${hostname} (${ip})");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("input box style", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.inputBoxStyle = { width: "300px", border: "1px solid red" };

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.inputBoxStyle).toEqual({
      width: "300px",
      border: "1px solid red",
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("permission filter", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.permission = ["read", "update"];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.permission).toEqual(["read", "update"]);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("show tooltip", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.showTooltip = true;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.showTooltip).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("ignore missing field error", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.ignoreMissingFieldError = true;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.ignoreMissingFieldError).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("show key field", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.showKeyField = true;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.showKeyField).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("dropdown match select width", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.dropdownMatchSelectWidth = false;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.dropdownMatchSelectWidth).toBe(false);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("dropdown style", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.dropdownStyle = { maxHeight: "400px" };

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.dropdownStyle).toEqual({ maxHeight: "400px" });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("blur after value changed", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.blurAfterValueChanged = true;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.blurAfterValueChanged).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("sort configuration", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.sort = [{ hostname: 1 }, { ip: -1 }];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.sort).toEqual([{ hostname: 1 }, { ip: -1 }]);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("external CMDB API", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.useExternalCmdbApi = true;
    element.externalSourceId = "external-source-1";

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.useExternalCmdbApi).toBe(true);
    expect(element.externalSourceId).toBe("external-source-1");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("value update", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";
    element.value = "initial-value";

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.value).toBe("initial-value");

    act(() => {
      element.value = "updated-value";
    });

    expect(element.value).toBe("updated-value");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("multiple values update", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instances";
    element.objectId = "HOST";
    element.mode = "multiple";
    element.value = ["id1", "id2"];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.value).toEqual(["id1", "id2"]);

    act(() => {
      element.value = ["id1", "id2", "id3"];
    });

    expect(element.value).toEqual(["id1", "id2", "id3"]);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("change event without option parameter", async () => {
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";

    const changeV2Handler = jest.fn();
    element.addEventListener("change.v2", changeV2Handler as any);

    act(() => {
      document.body.appendChild(element);
    });

    // Simulate change without option parameter
    act(() => {
      mockOnChange("test-value-no-option", undefined);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(element.value).toBe("test-value-no-option");
    expect(changeV2Handler).toHaveBeenCalled();
    const eventDetail = (changeV2Handler.mock.calls[0][0] as CustomEvent)
      .detail;
    expect(eventDetail).toEqual({ value: "test-value-no-option" });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("change event triggers form validation reset", async () => {
    const mockFormElement = {
      resetValidateState: jest.fn(),
    };

    // Mock getFormElement
    const element = document.createElement(
      "eo-cmdb-instance-select"
    ) as EoCmdbInstanceSelect;

    element.name = "instance";
    element.objectId = "HOST";

    // Override getFormElement to return mock
    element.getFormElement = jest.fn(() => mockFormElement as any);

    act(() => {
      document.body.appendChild(element);
    });

    // Simulate change
    act(() => {
      mockOnChange("new-value", { value: "new-value", label: "New Value" });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFormElement.resetValidateState).toHaveBeenCalled();

    act(() => {
      document.body.removeChild(element);
    });
  });
});
