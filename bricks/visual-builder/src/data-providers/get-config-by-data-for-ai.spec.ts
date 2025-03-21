import { describe, test, expect } from "@jest/globals";
import { InstanceApi_postSearchV3 } from "@next-api-sdk/cmdb-sdk";
import { getConfigByDataForAi } from "./get-config-by-data-for-ai.js";

jest.mock("@next-api-sdk/cmdb-sdk");

const consoleWarn = jest.spyOn(console, "warn");

describe("getConfigByDataForAi", () => {
  beforeEach(() => {
    (InstanceApi_postSearchV3 as jest.Mock).mockReset();
  });

  test("should return null when data is undefined", async () => {
    expect(await getConfigByDataForAi(undefined)).toBeNull();
  });

  test("should return null when data is null", async () => {
    expect(await getConfigByDataForAi(null)).toBeNull();
  });

  test("should return null when data.value is null", async () => {
    expect(
      await getConfigByDataForAi({ name: "test", value: null })
    ).toBeNull();
  });

  test("should return list config when data.value is a non-empty array", async () => {
    const data = {
      name: "test",
      value: [
        {
          _object_id: "1",
          attr1: "value1",
          attr2: "value2",
          attr3: "value3",
        },
      ],
    };
    (InstanceApi_postSearchV3 as jest.Mock).mockResolvedValue({
      list: [
        {
          attrList: [{ id: "attr2", name: "Attr 2" }],
          metricGroups: [{ group: "group1", metrics: ["metric1"] }],
        },
      ],
    });

    const config = await getConfigByDataForAi(data);
    expect(config).toEqual({
      type: "list",
      attrList: [
        // Attr 1 is excluded because it is not in the attrList of the object
        { id: "attr2", name: "Attr 2" },
      ],
      metricGroups: [{ group: "group1", metrics: ["metric1"] }],
      dataList: [
        {
          _object_id: "1",
          attr1: "value1",
          attr2: "value2",
          attr3: "value3",
        },
      ],
      containerOptions: [
        { label: "表格", value: "table" },
        { label: "卡片列表", value: "cards" },
        // { label: "图表", value: "chart" },
      ],
    });
  });

  test("should return unknown when object not found", async () => {
    consoleWarn.mockImplementationOnce(() => {});
    const data = {
      name: "test",
      value: [
        {
          _object_id: "1",
          attr1: "value1",
          attr2: "value2",
        },
      ],
    };
    (InstanceApi_postSearchV3 as jest.Mock).mockResolvedValue({
      list: [],
    });

    const config = await getConfigByDataForAi(data);
    expect(config).toEqual({
      type: "unknown",
      attrList: [],
      metricGroups: [],
      dataList: [
        {
          _object_id: "1",
          attr1: "value1",
          attr2: "value2",
        },
      ],
      containerOptions: [],
    });
    expect(consoleWarn).toHaveBeenCalledWith(
      "Can not find object by objectId:",
      "1"
    );
  });

  test("should return unknown config when data.value is an empty array", async () => {
    consoleWarn.mockImplementationOnce(() => {});
    const data = {
      name: "test",
      value: [] as unknown[],
    };

    const config = await getConfigByDataForAi(data);
    expect(config).toEqual({
      type: "unknown",
      attrList: [],
      metricGroups: [],
      dataList: [],
      containerOptions: [],
    });
    expect(consoleWarn).toHaveBeenCalledWith(
      "Can not detect objectId with data:",
      data
    );
  });

  test("should warn when no _object_id in data", async () => {
    consoleWarn.mockImplementationOnce(() => {});
    const data = {
      name: "test",
      value: [
        {
          attr1: "value1",
          attr2: "value2",
        },
      ],
    };

    const config = await getConfigByDataForAi(data);
    expect(config).toEqual({
      type: "list",
      attrList: [
        { id: "attr1", name: "attr1" },
        { id: "attr2", name: "attr2" },
      ],
      metricGroups: [],
      dataList: [
        {
          attr1: "value1",
          attr2: "value2",
        },
      ],
      containerOptions: [
        { label: "表格", value: "table" },
        { label: "卡片列表", value: "cards" },
        // { label: "图表", value: "chart" },
      ],
    });
    expect(consoleWarn).toHaveBeenCalledWith(
      "Can not detect objectId with data:",
      data
    );
  });

  test("should return list-with-pagination config when data.value is a paginated list", async () => {
    const data = {
      name: "test",
      value: {
        list: [{ _object_id: "1", attr1: "value1", attr2: "value2" }],
        page: 1,
        total: 1,
        pageSize: 10,
      },
    };
    (InstanceApi_postSearchV3 as jest.Mock).mockResolvedValue({
      list: [
        {
          attrList: [
            { id: "attr1", name: "Attr 1" },
            { id: "attr2", name: "Attr 2" },
          ],
          metricGroups: [{ group: "group1", metrics: ["metric1"] }],
        },
      ],
    });

    const config = await getConfigByDataForAi(data);
    expect(config).toEqual({
      type: "list-with-pagination",
      attrList: [
        { id: "attr1", name: "Attr 1" },
        { id: "attr2", name: "Attr 2" },
      ],
      metricGroups: [{ group: "group1", metrics: ["metric1"] }],
      dataList: [{ _object_id: "1", attr1: "value1", attr2: "value2" }],
      containerOptions: [
        { label: "表格", value: "table", settings: { pagination: true } },
        { label: "卡片列表", value: "cards", settings: { pagination: true } },
        // { label: "图表", value: "chart", settings: { pagination: true } },
      ],
    });
  });

  test("should handle parentObjectIds", async () => {
    const data = {
      name: "test",
      value: {
        list: [
          {
            _object_id: "1",
            attr1: "value1",
            attr2: "value2",
            attr3: "value3",
          },
        ],
        page: 1,
        total: 1,
        page_size: 10,
      },
    };
    (InstanceApi_postSearchV3 as jest.Mock).mockImplementation(
      (_id, options: { query: { objectId: string } }) => {
        switch (options.query.objectId) {
          case "1":
            return Promise.resolve({
              list: [
                {
                  attrList: [{ id: "attr1", name: "Attr 1" }],
                  parentObjectIds: ["2", "3"],
                  metricGroups: [{ group: "group1", metrics: ["metric1"] }],
                },
              ],
            });
          case "2":
            return Promise.resolve({
              list: [
                {
                  attrList: [{ id: "attr2", name: "Attr 2" }],
                },
              ],
            });
          case "3":
            return Promise.resolve({
              list: [
                {
                  attrList: [{ id: "attr3", name: "Attr 3" }],
                },
              ],
            });
        }
      }
    );

    const config = await getConfigByDataForAi(data);
    expect(config).toEqual({
      type: "list-with-pagination",
      attrList: [
        { id: "attr2", name: "Attr 2" },
        { id: "attr3", name: "Attr 3" },
        { id: "attr1", name: "Attr 1" },
      ],
      metricGroups: [{ group: "group1", metrics: ["metric1"] }],
      dataList: [
        {
          _object_id: "1",
          attr1: "value1",
          attr2: "value2",
          attr3: "value3",
        },
      ],
      containerOptions: [
        {
          label: "表格",
          value: "table",
          settings: { pagination: true, fields: { pageSize: "page_size" } },
        },
        {
          label: "卡片列表",
          value: "cards",
          settings: { pagination: true, fields: { pageSize: "page_size" } },
        },
      ],
    });
  });

  test("should return unknown config when data.value is an empty paginated list", async () => {
    consoleWarn.mockImplementationOnce(() => {});
    const data = {
      name: "test",
      value: { list: [] as unknown[], page: 1, total: 0 },
    };

    const config = await getConfigByDataForAi(data);
    expect(config).toEqual({
      type: "unknown",
      attrList: [],
      metricGroups: [],
      dataList: [],
      containerOptions: [],
    });
    expect(consoleWarn).toHaveBeenCalledWith(
      "Can not detect objectId with data:",
      data
    );
  });

  test("should return object config when data.value is a single object", async () => {
    const data = {
      name: "test",
      value: { _object_id: "1", attr1: "value1", attr2: "value2" },
    };
    (InstanceApi_postSearchV3 as jest.Mock).mockResolvedValue({
      list: [
        {
          attrList: [
            { id: "attr1", name: "Attr 1" },
            { id: "attr2", name: "Attr 2" },
          ],
          metricGroups: [{ group: "group1", metrics: ["metric1"] }],
        },
      ],
    });

    const config = await getConfigByDataForAi(data);
    expect(config).toEqual({
      type: "object",
      attrList: [
        { id: "attr1", name: "Attr 1" },
        { id: "attr2", name: "Attr 2" },
      ],
      metricGroups: [{ group: "group1", metrics: ["metric1"] }],
      dataList: [{ _object_id: "1", attr1: "value1", attr2: "value2" }],
      containerOptions: [{ label: "属性详情", value: "descriptions" }],
    });
  });

  test("should return unknown config when data.value is not recognized", async () => {
    consoleWarn.mockImplementationOnce(() => {});
    const data = { name: "test", value: "unknown" };
    const config = await getConfigByDataForAi(data);
    expect(config).toEqual({
      type: "unknown",
      attrList: [],
      metricGroups: [],
      dataList: [],
      containerOptions: [],
    });
    expect(consoleWarn).toHaveBeenCalledWith(
      "Can not detect objectId with data:",
      data
    );
  });

  test("should handle time series data correctly", async () => {
    const data = {
      name: "test",
      value: [
        {
          _object_id: "1",
          time: 1636372800000,
          cpu_usage: 75.5,
          "Memory Usage": 1024,
          attr1: "value1",
        },
      ],
    };

    (InstanceApi_postSearchV3 as jest.Mock).mockImplementation((objectType) => {
      if (objectType === "MODEL_OBJECT") {
        return Promise.resolve({
          list: [
            {
              attrList: [{ id: "attr1", name: "Attr 1" }],
              metricGroups: [
                {
                  group: "performance",
                  metrics: ["cpu_usage", "memory_usage"],
                },
              ],
            },
          ],
        });
      } else if (objectType === "_COLLECTOR_ALIAS_METRIC") {
        return Promise.resolve({
          list: [
            {
              name: "cpu_usage",
              displayName: "CPU Usage",
              unit: "%",
              dataType: "float",
            },
            {
              name: "memory_usage",
              displayName: "Memory Usage",
              unit: "MB",
              dataType: "float",
            },
            {
              name: "system_load",
            },
          ],
        });
      }
    });

    const config = await getConfigByDataForAi(data);

    expect(config).toEqual({
      type: "list",
      attrList: [
        { id: "attr1", name: "Attr 1" },
        {
          id: "cpu_usage",
          name: "CPU Usage",
          metricKey: "cpu_usage",
          unit: "%",
          candidates: expect.any(Array),
        },
        {
          id: "memory_usage",
          name: "Memory Usage",
          metricKey: "Memory Usage",
          unit: "MB",
          candidates: expect.any(Array),
        },
      ],
      metricGroups: [
        { group: "performance", metrics: ["cpu_usage", "memory_usage"] },
      ],
      dataList: [
        {
          _object_id: "1",
          time: 1636372800000,
          cpu_usage: 75.5,
          "Memory Usage": 1024,
          attr1: "value1",
        },
      ],
      containerOptions: [
        { label: "表格", value: "table" },
        { label: "卡片列表", value: "cards" },
        { label: "图表", value: "chart", prefer: true },
        { label: "组合图表", value: "grouped-chart", prefer: false },
      ],
    });
  });

  test("should handle time series data with list correctly", async () => {
    const data = {
      name: "test",
      value: {
        list: [
          {
            _object_id: "1",
            time: 1636372800000,
            cpu_usage: 75.5,
            "Memory Usage": 1024,
            attr1: "value1",
          },
        ],
      },
    };

    (InstanceApi_postSearchV3 as jest.Mock).mockImplementation((objectType) => {
      if (objectType === "MODEL_OBJECT") {
        return Promise.resolve({
          list: [
            {
              attrList: [{ id: "attr1", name: "Attr 1" }],
              metricGroups: [
                {
                  group: "performance",
                  metrics: ["cpu_usage", "memory_usage"],
                },
              ],
            },
          ],
        });
      } else if (objectType === "_COLLECTOR_ALIAS_METRIC") {
        return Promise.resolve({
          list: [
            {
              name: "cpu_usage",
              displayName: "CPU Usage",
              unit: "%",
              dataType: "float",
            },
            {
              name: "memory_usage",
              displayName: "Memory Usage",
              unit: "MB",
              dataType: "float",
            },
            {
              name: "system_load",
            },
          ],
        });
      }
    });

    const config = await getConfigByDataForAi(data);

    expect(config).toEqual({
      type: "list-with-wrapper",
      attrList: [
        { id: "attr1", name: "Attr 1" },
        {
          id: "cpu_usage",
          name: "CPU Usage",
          metricKey: "cpu_usage",
          unit: "%",
          candidates: expect.any(Array),
        },
        {
          id: "memory_usage",
          name: "Memory Usage",
          metricKey: "Memory Usage",
          unit: "MB",
          candidates: expect.any(Array),
        },
      ],
      metricGroups: [
        { group: "performance", metrics: ["cpu_usage", "memory_usage"] },
      ],
      dataList: [
        {
          _object_id: "1",
          time: 1636372800000,
          cpu_usage: 75.5,
          "Memory Usage": 1024,
          attr1: "value1",
        },
      ],
      containerOptions: [
        { label: "属性详情", value: "descriptions" },
        { label: "表格", value: "table", settings: { wrapper: true } },
        { label: "卡片列表", value: "cards", settings: { wrapper: true } },
        {
          label: "图表",
          value: "chart",
          prefer: true,
          settings: { wrapper: true },
        },
        {
          label: "组合图表",
          value: "grouped-chart",
          prefer: false,
          settings: { wrapper: true },
        },
      ],
    });
  });

  test("should return unknown config when data.value is an array of non-object", async () => {
    consoleWarn.mockImplementationOnce(() => {});
    const data = { name: "test", value: [1] };

    const config = await getConfigByDataForAi(data);
    expect(config).toEqual({
      type: "unknown",
      attrList: [],
      metricGroups: [],
      dataList: [1],
      containerOptions: [],
    });
    expect(consoleWarn).toHaveBeenCalledWith(
      "Can not detect objectId with data:",
      data
    );
  });
});
