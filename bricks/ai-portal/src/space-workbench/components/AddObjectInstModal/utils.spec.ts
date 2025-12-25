import { describe, test, expect } from "@jest/globals";
import { mergeInstanceSchema } from "./utils";
import { InstanceSchema } from "../../interfaces";

describe("mergeInstanceSchema", () => {
  test("应该在没有之前的 schema 时返回当前 schema 并添加 _id_", () => {
    const currentSchema: InstanceSchema = {
      objectId: "obj-1",
      imports: [
        { instanceId: "inst-1", name: "实例1", _id_: "" },
        { name: "新实例", _id_: "" },
      ],
    };

    const result = mergeInstanceSchema(null, currentSchema);

    expect(result.objectId).toBe("obj-1");
    expect(result.imports).toHaveLength(2);
    expect(result.imports?.[0]._id_).toBeTruthy();
    expect(result.imports?.[1]._id_).toBeTruthy();
  });

  test("应该使用 instanceId 作为 _id_ 当它存在时", () => {
    const currentSchema: InstanceSchema = {
      imports: [{ instanceId: "inst-1", name: "实例1", _id_: "" }],
    };

    const result = mergeInstanceSchema(null, currentSchema);

    expect(result.imports?.[0]._id_).toBe("inst-1");
  });

  test("应该生成临时 ID 当 instanceId 不存在时", () => {
    const currentSchema: InstanceSchema = {
      imports: [{ name: "新实例", _id_: "" }],
    };

    const result = mergeInstanceSchema(null, currentSchema);

    expect(result.imports?.[0]._id_).toMatch(/^temp_\d+_[a-z0-9]+$/);
  });

  test("应该过滤掉需要删除的实例", () => {
    const prevSchema: InstanceSchema = {
      imports: [
        { _id_: "id-1", instanceId: "inst-1", name: "实例1" },
        { _id_: "id-2", instanceId: "inst-2", name: "实例2" },
      ],
    };

    const currentSchema: InstanceSchema = {
      deletes: ["inst-1"],
    };

    const result = mergeInstanceSchema(prevSchema, currentSchema);

    expect(result.imports).toHaveLength(1);
    expect(result.imports?.[0].instanceId).toBe("inst-2");
  });

  test("应该更新现有实例的数据", () => {
    const prevSchema: InstanceSchema = {
      imports: [{ _id_: "id-1", instanceId: "inst-1", name: "旧名称" }],
    };

    const currentSchema: InstanceSchema = {
      imports: [{ instanceId: "inst-1", name: "新名称", _id_: "" }],
    };

    const result = mergeInstanceSchema(prevSchema, currentSchema);

    expect(result.imports).toHaveLength(1);
    expect(result.imports?.[0]._id_).toBe("id-1"); // 保留原有的 _id_
    expect(result.imports?.[0].name).toBe("新名称"); // 更新数据
  });

  test("应该添加新实例到已有列表", () => {
    const prevSchema: InstanceSchema = {
      imports: [{ _id_: "id-1", instanceId: "inst-1", name: "实例1" }],
    };

    const currentSchema: InstanceSchema = {
      imports: [{ name: "新实例", _id_: "" }],
    };

    const result = mergeInstanceSchema(prevSchema, currentSchema);

    expect(result.imports).toHaveLength(2);
    expect(
      result.imports?.find((item) => item.instanceId === "inst-1")
    ).toBeDefined();
    expect(
      result.imports?.find((item) => item.name === "新实例")
    ).toBeDefined();
  });

  test("应该合并 deletes 列表并去重", () => {
    const prevSchema: InstanceSchema = {
      imports: [],
      deletes: ["inst-1", "inst-2"],
    };

    const currentSchema: InstanceSchema = {
      deletes: ["inst-2", "inst-3"],
    };

    const result = mergeInstanceSchema(prevSchema, currentSchema);

    expect(result.deletes).toHaveLength(3);
    expect(result.deletes).toContain("inst-1");
    expect(result.deletes).toContain("inst-2");
    expect(result.deletes).toContain("inst-3");
  });

  test("应该保留当前 schema 的 objectId", () => {
    const prevSchema: InstanceSchema = {
      objectId: "obj-old",
      imports: [],
    };

    const currentSchema: InstanceSchema = {
      objectId: "obj-new",
      imports: [],
    };

    const result = mergeInstanceSchema(prevSchema, currentSchema);

    expect(result.objectId).toBe("obj-new");
  });

  test("应该处理复杂的合并场景", () => {
    const prevSchema: InstanceSchema = {
      objectId: "obj-1",
      imports: [
        { _id_: "id-1", instanceId: "inst-1", name: "实例1", status: "old" },
        { _id_: "id-2", instanceId: "inst-2", name: "实例2" },
        { _id_: "id-3", name: "临时实例" },
      ],
      deletes: ["inst-4"],
    };

    const currentSchema: InstanceSchema = {
      objectId: "obj-1",
      imports: [
        { instanceId: "inst-1", name: "实例1", status: "new", _id_: "" }, // 更新已有
        { name: "新临时实例", _id_: "" }, // 新增临时
      ],
      deletes: ["inst-2", "inst-5"],
    };

    const result = mergeInstanceSchema(prevSchema, currentSchema);

    // 检查 objectId
    expect(result.objectId).toBe("obj-1");

    // 检查 imports 长度: inst-1(更新), id-3(保留), 新临时实例(新增), 不包含 inst-2(被删除)
    expect(result.imports).toHaveLength(3);

    // 检查 inst-1 被更新
    const inst1 = result.imports?.find((item) => item.instanceId === "inst-1");
    expect(inst1).toBeDefined();
    expect(inst1?._id_).toBe("id-1"); // 保留原 _id_
    expect(inst1?.status).toBe("new"); // 数据被更新

    // 检查临时实例被保留
    const tempInst = result.imports?.find((item) => item._id_ === "id-3");
    expect(tempInst).toBeDefined();

    // 检查新实例被添加
    const newTempInst = result.imports?.find(
      (item) => item.name === "新临时实例"
    );
    expect(newTempInst).toBeDefined();
    expect(newTempInst?._id_).toMatch(/^temp_\d+_[a-z0-9]+$/);

    // 检查 inst-2 不在结果中
    expect(
      result.imports?.find((item) => item.instanceId === "inst-2")
    ).toBeUndefined();

    // 检查 deletes 列表
    expect(result.deletes).toHaveLength(3);
    expect(result.deletes).toContain("inst-4");
    expect(result.deletes).toContain("inst-2");
    expect(result.deletes).toContain("inst-5");
  });
});
