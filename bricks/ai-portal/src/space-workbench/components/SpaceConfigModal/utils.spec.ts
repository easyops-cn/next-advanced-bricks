import { describe, test, expect } from "@jest/globals";
import { mergeConfigSchema, handleModifyActivity } from "./utils";

describe("utils", () => {
  describe("mergeConfigSchema", () => {
    test("应该合并业务对象", () => {
      const prevSchema = {
        businessObjects: [
          { objectId: "obj-1", objectName: "对象1", description: "描述1" },
        ],
        objectRelations: [],
        businessFlows: [],
      };

      const currentSchema = {
        businessObjects: [
          { objectId: "obj-2", objectName: "对象2", description: "描述2" },
        ],
        objectRelations: [],
        businessFlows: [],
      };

      const result = mergeConfigSchema(prevSchema, currentSchema);

      expect(result.businessObjects?.length).toBe(2);
      expect(result.businessObjects).toContainEqual(
        prevSchema.businessObjects[0]
      );
      expect(result.businessObjects).toContainEqual(
        currentSchema.businessObjects[0]
      );
    });

    test("应该删除指定的业务对象", () => {
      const prevSchema = {
        businessObjects: [
          { objectId: "obj-1", objectName: "对象1", description: "描述1" },
          { objectId: "obj-2", objectName: "对象2", description: "描述2" },
        ],
        objectRelations: [],
        businessFlows: [],
      };

      const currentSchema = {
        deleteObjects: ["obj-1"],
        businessObjects: [],
        objectRelations: [],
        businessFlows: [],
      };

      const result = mergeConfigSchema(prevSchema, currentSchema);

      expect(result.businessObjects?.length).toBe(1);
      expect(result.businessObjects?.[0].objectId).toBe("obj-2");
    });

    test("应该更新现有的业务对象", () => {
      const prevSchema = {
        businessObjects: [
          { objectId: "obj-1", objectName: "对象1", description: "旧描述" },
        ],
        objectRelations: [],
        businessFlows: [],
      };

      const currentSchema = {
        businessObjects: [
          { objectId: "obj-1", objectName: "对象1", description: "新描述" },
        ],
        objectRelations: [],
        businessFlows: [],
      };

      const result = mergeConfigSchema(prevSchema, currentSchema);

      expect(result.businessObjects?.length).toBe(1);
      expect(result.businessObjects?.[0].description).toBe("新描述");
    });

    test("应该删除指定的对象关系", () => {
      const prevSchema = {
        businessObjects: [],
        objectRelations: [
          {
            name: "rel-1",
            description: "关系1",
            relation_id: "rel-1",
            left_object_id: "obj-1",
            right_object_id: "obj-2",
            left_id: "left-1",
            right_id: "right-1",
          },
          {
            name: "rel-2",
            description: "关系2",
            relation_id: "rel-2",
            left_object_id: "obj-1",
            right_object_id: "obj-2",
            left_id: "left-1",
            right_id: "right-1",
          },
        ],
        businessFlows: [],
      };

      const currentSchema = {
        deleteRelations: ["rel-1"],
        businessObjects: [],
        objectRelations: [],
        businessFlows: [],
      };

      const result = mergeConfigSchema(prevSchema, currentSchema);

      expect(result.objectRelations?.length).toBe(1);
      expect(result.objectRelations?.[0].name).toBe("rel-2");
    });

    test("应该合并对象关系", () => {
      const prevSchema = {
        businessObjects: [],
        objectRelations: [
          {
            name: "rel-1",
            description: "关系1",
            relation_id: "rel-1",
            left_object_id: "obj-1",
            right_object_id: "obj-2",
            left_id: "left-1",
            right_id: "right-1",
          },
        ],
        businessFlows: [],
      };

      const currentSchema = {
        businessObjects: [],
        objectRelations: [
          {
            name: "rel-2",
            description: "关系2",
            relation_id: "rel-2",
            left_object_id: "obj-1",
            right_object_id: "obj-2",
            left_id: "left-1",
            right_id: "right-1",
          },
        ],
        businessFlows: [],
      };

      const result = mergeConfigSchema(prevSchema, currentSchema);

      expect(result.objectRelations?.length).toBe(2);
      expect(result.objectRelations).toContainEqual(
        prevSchema.objectRelations[0]
      );
      expect(result.objectRelations).toContainEqual(
        currentSchema.objectRelations[0]
      );
    });

    test("应该删除指定的业务流", () => {
      const prevSchema = {
        businessObjects: [],
        objectRelations: [],
        businessFlows: [
          { instanceId: "flow-1", name: "流程1", description: "描述1" },
          { instanceId: "flow-2", name: "流程2", description: "描述2" },
        ],
      };

      const currentSchema = {
        deleteFlows: ["流程1"],
        businessObjects: [],
        objectRelations: [],
        businessFlows: [],
      };

      const result = mergeConfigSchema(prevSchema, currentSchema);

      expect(result.businessFlows?.length).toBe(1);
      expect(result.businessFlows?.[0].name).toBe("流程2");
    });

    test("应该合并业务流", () => {
      const prevSchema = {
        businessObjects: [],
        objectRelations: [],
        businessFlows: [
          { instanceId: "flow-1", name: "流程1", description: "描述1" },
        ],
      };

      const currentSchema = {
        businessObjects: [],
        objectRelations: [],
        businessFlows: [
          { instanceId: "flow-2", name: "流程2", description: "描述2" },
        ],
      };

      const result = mergeConfigSchema(prevSchema, currentSchema);

      expect(result.businessFlows?.length).toBe(2);
      expect(result.businessFlows).toContainEqual(prevSchema.businessFlows[0]);
      expect(result.businessFlows).toContainEqual(
        currentSchema.businessFlows[0]
      );
    });

    test("应该处理 prevSchema 字段为 undefined 的情况", () => {
      const prevSchema = {
        businessObjects: undefined,
        objectRelations: undefined,
        businessFlows: undefined,
      } as any;

      const currentSchema = {
        businessObjects: [
          { objectId: "obj-1", objectName: "对象1", description: "描述1" },
        ],
        objectRelations: [],
        businessFlows: [],
      };

      const result = mergeConfigSchema(prevSchema, currentSchema);

      expect(result.businessObjects?.length).toBe(1);
      expect(result.objectRelations?.length).toBe(0);
      expect(result.businessFlows?.length).toBe(0);
    });
  });

  describe("handleModifyActivity", () => {
    test("应该修改指定的活动", () => {
      const prevSchema = {
        businessObjects: [],
        objectRelations: [],
        businessFlows: [
          {
            instanceId: "flow-1",
            name: "流程1",
            description: "描述",
            spec: [
              {
                name: "阶段1",
                serviceFlowActivities: [
                  {
                    id: "act-1",
                    name: "活动1",
                    description: "旧描述",
                    aiEmployeeId: "ai-1",
                  },
                ],
              },
            ],
          },
        ],
      };

      const newActivity = {
        id: "act-1",
        name: "活动1",
        description: "新描述",
        aiEmployeeId: "ai-2",
      };

      const result = handleModifyActivity(prevSchema, "阶段1", newActivity);

      expect(
        result.businessFlows[0].spec?.[0].serviceFlowActivities?.[0].description
      ).toBe("新描述");
      expect(
        result.businessFlows[0].spec?.[0].serviceFlowActivities?.[0]
          .aiEmployeeId
      ).toBe("ai-2");
    });

    test("应该在找不到活动时返回原 schema", () => {
      const prevSchema = {
        businessObjects: [],
        objectRelations: [],
        businessFlows: [
          {
            instanceId: "flow-1",
            name: "流程1",
            description: "描述",
            spec: [
              {
                name: "阶段1",
                serviceFlowActivities: [],
              },
            ],
          },
        ],
      };

      const newActivity = {
        id: "act-1",
        name: "不存在的活动",
        description: "描述",
        aiEmployeeId: "ai-1",
      };

      const result = handleModifyActivity(prevSchema, "阶段1", newActivity);

      expect(result).toEqual(prevSchema);
    });

    test("应该跳过没有 spec 的流程", () => {
      const prevSchema = {
        businessObjects: [],
        objectRelations: [],
        businessFlows: [
          {
            instanceId: "flow-1",
            name: "流程1",
            description: "描述",
          } as any,
        ],
      };

      const newActivity = {
        id: "act-1",
        name: "活动1",
        description: "描述",
        aiEmployeeId: "ai-1",
      };

      const result = handleModifyActivity(prevSchema, "阶段1", newActivity);

      expect(result).toEqual(prevSchema);
    });

    test("应该跳过 spec 为空数组的流程", () => {
      const prevSchema = {
        businessObjects: [],
        objectRelations: [],
        businessFlows: [
          {
            instanceId: "flow-1",
            name: "流程1",
            description: "描述",
            spec: [],
          },
        ],
      };

      const newActivity = {
        id: "act-1",
        name: "活动1",
        description: "描述",
        aiEmployeeId: "ai-1",
      };

      const result = handleModifyActivity(prevSchema, "阶段1", newActivity);

      expect(result).toEqual(prevSchema);
    });

    test("应该跳过找不到匹配 stage 的流程", () => {
      const prevSchema = {
        businessObjects: [],
        objectRelations: [],
        businessFlows: [
          {
            instanceId: "flow-1",
            name: "流程1",
            description: "描述",
            spec: [
              {
                name: "阶段2",
                serviceFlowActivities: [
                  {
                    id: "act-1",
                    name: "活动1",
                    description: "描述",
                    aiEmployeeId: "ai-1",
                  },
                ],
              },
            ],
          },
        ],
      };

      const newActivity = {
        id: "act-1",
        name: "活动1",
        description: "新描述",
        aiEmployeeId: "ai-2",
      };

      const result = handleModifyActivity(prevSchema, "阶段1", newActivity);

      expect(result).toEqual(prevSchema);
    });

    test("应该处理 serviceFlowActivities 为 undefined 的情况", () => {
      const prevSchema = {
        businessObjects: [],
        objectRelations: [],
        businessFlows: [
          {
            instanceId: "flow-1",
            name: "流程1",
            description: "描述",
            spec: [
              {
                name: "阶段1",
              } as any,
            ],
          },
        ],
      };

      const newActivity = {
        id: "act-1",
        name: "活动1",
        description: "描述",
        aiEmployeeId: "ai-1",
      };

      const result = handleModifyActivity(prevSchema, "阶段1", newActivity);

      expect(result).toEqual(prevSchema);
    });
  });
});
