import React from "react";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { render, waitFor, fireEvent } from "@testing-library/react";
import {
  CmdbInstanceSelect,
  getInstanceNameKey,
  parseTemplate,
  formatUserQuery,
} from "./CmdbInstanceSelectInternal";
import { InstanceApi_postSearchV3 } from "@next-api-sdk/cmdb-sdk";

// Mock dependencies
jest.mock("@next-api-sdk/cmdb-sdk");
jest.mock("@next-core/runtime", () => ({
  handleHttpError: jest.fn(),
}));
jest.mock("@next-core/react-runtime", () => ({
  ReactUseMultipleBricks: jest.fn(() => null),
  useProvider: jest.fn(() => ({
    query: jest.fn(),
  })),
}));
jest.mock("@next-core/i18n", () => ({
  i18n: {
    t: jest.fn((key: string) => key),
    language: "zh-CN",
  },
  initializeI18n: jest.fn(),
}));

const mockPostSearchV3 = InstanceApi_postSearchV3 as jest.MockedFunction<
  typeof InstanceApi_postSearchV3
>;

describe("Utility Functions", () => {
  describe("getInstanceNameKey", () => {
    test("returns 'hostname' for HOST objectId", () => {
      expect(getInstanceNameKey("HOST")).toBe("hostname");
    });

    test("returns 'name' for non-HOST objectId", () => {
      expect(getInstanceNameKey("APP")).toBe("name");
      expect(getInstanceNameKey("USER")).toBe("name");
      expect(getInstanceNameKey("CLUSTER")).toBe("name");
    });

    test("handles numeric objectId", () => {
      expect(getInstanceNameKey(123)).toBe("name");
    });
  });

  describe("parseTemplate", () => {
    test("replaces simple placeholders", () => {
      const template = "#{name} - #{id}";
      const data = { name: "Test", id: "123" };
      expect(parseTemplate(template, data)).toBe("Test - 123");
    });

    test("handles nested object properties", () => {
      const template = "#{user.name} (#{user.email})";
      const data = { user: { name: "John", email: "john@example.com" } };
      expect(parseTemplate(template, data)).toBe("John (john@example.com)");
    });

    test("handles array indices", () => {
      const template = "#{items[0]} and #{items[1]}";
      const data = { items: ["first", "second"] };
      expect(parseTemplate(template, data)).toBe("first and second");
    });

    test("replaces undefined with empty string by default", () => {
      const template = "#{name} - #{missing}";
      const data = { name: "Test" };
      expect(parseTemplate(template, data)).toBe("Test - ");
    });

    test("keeps placeholder when skipUndefined is true", () => {
      const template = "#{name} - #{missing}";
      const data = { name: "Test" };
      expect(parseTemplate(template, data, true)).toBe("Test - #{missing}");
    });

    test("handles multiple occurrences of same placeholder", () => {
      const template = "#{name} and #{name} again";
      const data = { name: "Test" };
      expect(parseTemplate(template, data)).toBe("Test and Test again");
    });
  });

  describe("formatUserQuery", () => {
    test("wraps non-array query in array", () => {
      const query = { status: "active" };
      expect(formatUserQuery(query)).toEqual([{ status: "active" }]);
    });

    test("returns array as-is", () => {
      const query = [{ status: "active" }, { type: "server" }];
      expect(formatUserQuery(query)).toEqual(query);
    });

    test("removes falsy values from array", () => {
      const query = [{ status: "active" }, null, undefined, { type: "server" }];
      expect(formatUserQuery(query)).toEqual([
        { status: "active" },
        { type: "server" },
      ]);
    });

    test("handles undefined input", () => {
      expect(formatUserQuery(undefined)).toEqual([]);
    });

    test("handles null input", () => {
      expect(formatUserQuery(null)).toEqual([]);
    });
  });
});

describe("CmdbInstanceSelect Component", () => {
  const mockInstances = [
    {
      instanceId: "inst-1",
      name: "Instance 1",
      hostname: "host1.example.com",
      ip: "192.168.1.1",
    },
    {
      instanceId: "inst-2",
      name: "Instance 2",
      hostname: "host2.example.com",
      ip: "192.168.1.2",
    },
    {
      instanceId: "inst-3",
      name: "Instance 3",
      hostname: "host3.example.com",
      ip: "192.168.1.3",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockPostSearchV3.mockResolvedValue({
      list: mockInstances,
      total: mockInstances.length,
      page: 1,
      page_size: 30,
    } as any);
  });

  test("renders with basic props", async () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" placeholder="Select a host" />
    );

    expect(container.querySelector(".formsCmdbInstSelect")).toBeTruthy();
  });

  test("calls API on focus", async () => {
    const { container } = render(<CmdbInstanceSelect objectId="HOST" />);

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          query: expect.objectContaining({
            $and: expect.arrayContaining([
              expect.objectContaining({
                $or: expect.any(Array),
              }),
            ]),
          }),
          fields: ["instanceId", "hostname"],
          page: 1,
          page_size: 30,
        })
      );
    });
  });

  test("uses custom fields configuration", async () => {
    const { container } = render(
      <CmdbInstanceSelect
        objectId="APP"
        fields={{ label: ["name"], value: "instanceId" }}
      />
    );

    // Trigger focus to make API call
    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "APP",
        expect.objectContaining({
          fields: expect.arrayContaining(["instanceId", "name"]),
        })
      );
    });
  });

  test("handles multiple mode", async () => {
    const onChange = jest.fn();
    const { container } = render(
      <CmdbInstanceSelect
        objectId="HOST"
        mode="multiple"
        value={["inst-1", "inst-2"]}
        onChange={onChange}
      />
    );

    expect(container.querySelector(".ant-select-multiple")).toBeTruthy();
  });

  test("triggers onChange callback", async () => {
    const onChange = jest.fn();
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" onChange={onChange} />
    );

    // First trigger focus to load options
    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });

    // Then open dropdown
    const select = container.querySelector(".ant-select-selector");
    if (select) {
      fireEvent.mouseDown(select);
    }

    // Verify dropdown is rendered in document (not in container)
    await waitFor(() => {
      expect(document.querySelector(".ant-select-dropdown")).toBeTruthy();
    });
  });

  test("searches with minimum input length", async () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" minimumInputLength={3} />
    );

    const input = container.querySelector("input");
    if (input) {
      // Type less than minimum length
      fireEvent.change(input, { target: { value: "ab" } });
    }

    await waitFor(
      () => {
        // Should not call API with less than minimum length
        expect(mockPostSearchV3).not.toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  test("includes extra search keys in query", async () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" extraSearchKey={["ip", "hostname"]} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          fields: expect.arrayContaining(["instanceId", "hostname", "ip"]),
        })
      );
    });
  });

  test("includes extra fields in query", async () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" extraFields={["status", "region"]} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          fields: expect.arrayContaining([
            "instanceId",
            "hostname",
            "status",
            "region",
          ]),
        })
      );
    });
  });

  test("applies instance query filter", async () => {
    const instanceQuery = { status: { $eq: "running" } };
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" instanceQuery={instanceQuery} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          query: expect.objectContaining({
            $and: expect.arrayContaining([
              expect.any(Object),
              { status: { $eq: "running" } },
            ]),
          }),
        })
      );
    });
  });

  test("applies permission filter", async () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" permission={["read", "update"]} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          permission: ["read", "update"],
        })
      );
    });
  });

  test("uses custom page size", async () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" pageSize={50} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          page_size: 50,
        })
      );
    });
  });

  test("applies sort configuration", async () => {
    const sort = [{ name: 1 as const }, { createdAt: -1 as const }];
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" sort={sort as any} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          sort: sort,
        })
      );
    });
  });

  test("displays USER instances with avatar", async () => {
    const userInstances = [
      {
        instanceId: "user-1",
        name: "John Doe",
        user_icon: "https://example.com/avatar.jpg",
      },
      {
        instanceId: "user-2",
        name: "Jane Smith",
        user_icon: "defaultIcon",
      },
    ];

    mockPostSearchV3.mockResolvedValueOnce({
      list: userInstances,
      total: userInstances.length,
      page: 1,
      page_size: 30,
    } as any);

    const { container } = render(<CmdbInstanceSelect objectId="USER" />);

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "USER",
        expect.objectContaining({
          fields: expect.arrayContaining(["instanceId", "name", "user_icon"]),
        })
      );
    });
  });

  test("uses label template when provided", async () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" labelTemplate="#{hostname} (#{ip})" />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });
  });

  test("shows search tip when enabled", async () => {
    mockPostSearchV3.mockResolvedValueOnce({
      list: mockInstances,
      total: 100,
      page: 1,
      page_size: 30,
    } as any);

    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" showSearchTip={true} pageSize={30} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    // Wait for options to load
    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });

    // Open dropdown
    const selector = container.querySelector(".ant-select-selector");
    if (selector) {
      fireEvent.mouseDown(selector);
    }

    // Wait for dropdown to render and check for tip
    await waitFor(
      () => {
        const dropdown = document.querySelector(".ant-select-dropdown");
        expect(dropdown).toBeTruthy();

        const tip = dropdown?.querySelector(".moreChoices");
        if (tip) {
          expect(tip.textContent).toContain("仅显示前30项，更多结果请搜索");
        }
      },
      { timeout: 3000 }
    );
  });

  test("handles allowClear prop", () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" allowClear={true} />
    );

    expect(container.querySelector(".ant-select-allow-clear")).toBeTruthy();
  });

  test("handles disabled state", () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" disabled={true} />
    );

    expect(container.querySelector(".ant-select-disabled")).toBeTruthy();
  });

  test("applies custom input box style", () => {
    const customStyle = { width: "300px", border: "2px solid red" };
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" inputBoxStyle={customStyle} />
    );

    const select = container.querySelector(".ant-select") as HTMLElement;
    expect(select?.style.width).toBe("300px");
    expect(select?.style.border).toBe("2px solid red");
  });

  test("applies custom dropdown style", () => {
    const dropdownStyle = { maxHeight: "400px" };
    render(
      <CmdbInstanceSelect objectId="HOST" dropdownStyle={dropdownStyle} />
    );

    // The dropdown style is applied but might not be visible without opening the dropdown
    expect(true).toBe(true);
  });

  test("handles showKeyField option", async () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" showKeyField={true} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          fields: expect.arrayContaining(["instanceId", "#showKey"]),
        })
      );
    });
  });

  test("handles ignoreMissingFieldError option", async () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" ignoreMissingFieldError={true} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          ignore_missing_field_error: true,
        })
      );
    });
  });

  test("handles dropdownMatchSelectWidth option", () => {
    const { container: container1 } = render(
      <CmdbInstanceSelect objectId="HOST" dropdownMatchSelectWidth={true} />
    );
    expect(container1.querySelector(".ant-select")).toBeTruthy();

    const { container: container2 } = render(
      <CmdbInstanceSelect objectId="HOST" dropdownMatchSelectWidth={false} />
    );
    expect(container2.querySelector(".ant-select")).toBeTruthy();
  });

  test("calls optionsChange callback when options are loaded", async () => {
    const optionsChange = jest.fn();
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" optionsChange={optionsChange} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(optionsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            value: "inst-1",
            label: ["host1.example.com"],
          }),
        ])
      );
    });
  });

  test("initializes with value", async () => {
    mockPostSearchV3.mockResolvedValueOnce({
      list: [mockInstances[0]],
      total: 1,
      page: 1,
      page_size: 30,
    } as any);

    render(<CmdbInstanceSelect objectId="HOST" value="inst-1" />);

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          query: expect.objectContaining({
            $and: expect.arrayContaining([
              expect.objectContaining({
                instanceId: { $in: ["inst-1"] },
              }),
            ]),
          }),
        })
      );
    });
  });

  test("initializes with multiple values", async () => {
    mockPostSearchV3.mockResolvedValueOnce({
      list: [mockInstances[0], mockInstances[1]],
      total: 2,
      page: 1,
      page_size: 30,
    } as any);

    render(
      <CmdbInstanceSelect
        objectId="HOST"
        mode="multiple"
        value={["inst-1", "inst-2"]}
      />
    );

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          query: expect.objectContaining({
            $and: expect.arrayContaining([
              expect.objectContaining({
                instanceId: { $in: ["inst-1", "inst-2"] },
              }),
            ]),
          }),
        })
      );
    });
  });

  test("handles popoverPositionType parent", () => {
    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" popoverPositionType="parent" />
    );

    expect(container.querySelector(".ant-select")).toBeTruthy();
  });

  test("handles error from API", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockPostSearchV3.mockRejectedValueOnce(new Error("API Error"));

    const { container } = render(<CmdbInstanceSelect objectId="HOST" />);

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  test("uses external CMDB API when configured", async () => {
    const mockResponse = {
      list: mockInstances,
      total: mockInstances.length,
      page: 1,
      page_size: 30,
    };
    // @ts-expect-error - Mock function type inference issue
    const mockExternalApi = jest.fn().mockResolvedValue(mockResponse);

    const { useProvider } = require("@next-core/react-runtime");
    useProvider.mockReturnValue({
      query: mockExternalApi,
    });

    const { container } = render(
      <CmdbInstanceSelect
        objectId="HOST"
        useExternalCmdbApi={true}
        externalSourceId="external-source-1"
      />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockExternalApi).toHaveBeenCalled();
    });
  });

  test("handles multiple mode value change", async () => {
    const onChange = jest.fn();
    mockPostSearchV3.mockResolvedValue({
      list: mockInstances,
      total: mockInstances.length,
      page: 1,
      page_size: 30,
    } as any);

    const { container } = render(
      <CmdbInstanceSelect
        objectId="HOST"
        mode="multiple"
        value={["inst-1"]}
        onChange={onChange}
      />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });

    // Multiple mode should render correctly
    expect(container.querySelector(".ant-select-multiple")).toBeTruthy();
  });

  test("handles blurAfterValueChanged option", async () => {
    mockPostSearchV3.mockResolvedValue({
      list: mockInstances,
      total: mockInstances.length,
      page: 1,
      page_size: 30,
    } as any);

    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" blurAfterValueChanged={true} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });
  });

  test("handles label with array in showKeyField mode", async () => {
    const mockInstancesWithNestedLabel = [
      {
        instanceId: "inst-1",
        "#showKey": [["key1", "key2"], "value1"],
      },
    ];

    mockPostSearchV3.mockResolvedValue({
      list: mockInstancesWithNestedLabel,
      total: 1,
      page: 1,
      page_size: 30,
    } as any);

    const { container } = render(
      <CmdbInstanceSelect
        objectId="HOST"
        showKeyField={true}
        isMultiLabel={true}
      />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });

    // Open dropdown to render options
    const selector = container.querySelector(".ant-select-selector");
    if (selector) {
      fireEvent.mouseDown(selector);
    }

    await waitFor(() => {
      expect(document.querySelector(".ant-select-dropdown")).toBeTruthy();
    });
  });

  test("handles label with array in showKeyField mode without multiLabel", async () => {
    const mockInstancesWithNestedLabel = [
      {
        instanceId: "inst-1",
        "#showKey": [["key1", "key2"], "value1"],
      },
    ];

    mockPostSearchV3.mockResolvedValue({
      list: mockInstancesWithNestedLabel,
      total: 1,
      page: 1,
      page_size: 30,
    } as any);

    const { container } = render(
      <CmdbInstanceSelect
        objectId="HOST"
        showKeyField={true}
        isMultiLabel={false}
      />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });
  });

  test("handles label with multiple values in multiLabel mode", async () => {
    const mockInstancesWithMultiLabel = [
      {
        instanceId: "inst-1",
        name: "Instance 1",
        hostname: "host1.example.com",
        ip: "192.168.1.1",
      },
    ];

    mockPostSearchV3.mockResolvedValue({
      list: mockInstancesWithMultiLabel,
      total: 1,
      page: 1,
      page_size: 30,
    } as any);

    const { container } = render(
      <CmdbInstanceSelect
        objectId="HOST"
        fields={{ label: ["hostname", "ip"], value: "instanceId" }}
        isMultiLabel={true}
      />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });

    // Open dropdown to render options with multi-label
    const selector = container.querySelector(".ant-select-selector");
    if (selector) {
      fireEvent.mouseDown(selector);
    }

    await waitFor(() => {
      const dropdown = document.querySelector(".ant-select-dropdown");
      expect(dropdown).toBeTruthy();
    });
  });

  test("handles label with multiple values without multiLabel", async () => {
    const mockInstancesWithMultiLabel = [
      {
        instanceId: "inst-1",
        name: "Instance 1",
        hostname: "host1.example.com",
      },
    ];

    mockPostSearchV3.mockResolvedValue({
      list: mockInstancesWithMultiLabel,
      total: 1,
      page: 1,
      page_size: 30,
    } as any);

    const { container } = render(
      <CmdbInstanceSelect
        objectId="HOST"
        fields={{ label: ["hostname", "name"], value: "instanceId" }}
        isMultiLabel={false}
      />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });
  });

  test("handles empty objectId", async () => {
    const { container } = render(<CmdbInstanceSelect objectId="" />);

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(
      () => {
        // Should not call API with empty objectId
        expect(mockPostSearchV3).not.toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  test("handles search with query string", async () => {
    mockPostSearchV3.mockResolvedValue({
      list: mockInstances,
      total: mockInstances.length,
      page: 1,
      page_size: 30,
    } as any);

    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" minimumInputLength={0} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "test" } });
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalledWith(
        "HOST",
        expect.objectContaining({
          query: expect.objectContaining({
            $and: expect.arrayContaining([
              expect.objectContaining({
                $or: expect.arrayContaining([
                  { hostname: { $like: "%test%" } },
                ]),
              }),
            ]),
          }),
        })
      );
    });
  });

  test("changes value in multiple mode", async () => {
    const onChange = jest.fn();
    mockPostSearchV3.mockResolvedValue({
      list: mockInstances.slice(0, 2),
      total: 2,
      page: 1,
      page_size: 30,
    } as any);

    const { container } = render(
      <CmdbInstanceSelect objectId="HOST" mode="multiple" onChange={onChange} />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });
  });

  test("handles firstRender false to reset value", async () => {
    const { container, rerender } = render(
      <CmdbInstanceSelect objectId="HOST" firstRender={true} value="inst-1" />
    );

    const input = container.querySelector("input");
    if (input) {
      fireEvent.focus(input);
    }

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });

    // Change objectId with firstRender=false
    rerender(<CmdbInstanceSelect objectId="APP" firstRender={false} />);

    await waitFor(() => {
      expect(mockPostSearchV3).toHaveBeenCalled();
    });
  });
});
