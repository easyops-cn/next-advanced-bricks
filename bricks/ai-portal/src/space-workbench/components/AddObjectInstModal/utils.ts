import { InstanceSchema } from "../../interfaces";

/**
 * 为实例生成唯一的 _id_ 标识
 * 优先使用 instanceId，如果没有则生成临时 ID
 */
function generateInstanceId(instance: any): string {
  if (instance._id_) {
    return instance._id_;
  }
  if (instance.instanceId) {
    return instance.instanceId;
  }
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function mergeInstanceSchema(
  prevInstanceSchema: InstanceSchema | null,
  currentInstanceSchema: InstanceSchema
): InstanceSchema {
  // 如果没有之前的 schema，直接返回当前的 schema(添加 _id_)
  if (!prevInstanceSchema) {
    return {
      ...currentInstanceSchema,
      imports: currentInstanceSchema.imports?.map((item) => ({
        ...item,
        _id_: generateInstanceId(item),
      })),
    };
  }

  // 获取要删除的实例ID集合
  const deleteIds = new Set(currentInstanceSchema.deletes || []);

  // 基于之前的 imports 创建映射表，key 为 _id_
  const importMap = new Map<string, any>();

  // 先将之前的 imports 加入映射表（排除需要删除的实例）
  prevInstanceSchema.imports?.forEach((item) => {
    if (item._id_ && !deleteIds.has(item.instanceId || "")) {
      importMap.set(item._id_, item);
    }
  });

  // 处理当前的 imports：新增或更新
  currentInstanceSchema.imports?.forEach((item) => {
    // 为实例生成或保留 _id_
    const instanceId = generateInstanceId(item);
    const instanceWithId = { ...item, _id_: instanceId };

    if (item.instanceId) {
      // 有 instanceId：更新现有实例
      // 查找是否已存在相同 instanceId 的实例
      const existingEntry = Array.from(importMap.entries()).find(
        ([_, existingItem]) => existingItem.instanceId === item.instanceId
      );
      if (existingEntry) {
        // 更新现有实例，保留原有的 _id_
        importMap.set(existingEntry[0], {
          ...instanceWithId,
          _id_: existingEntry[0],
        });
      } else {
        // 新的已存在实例
        importMap.set(instanceId, instanceWithId);
      }
    } else {
      // 没有 instanceId：新增实例
      importMap.set(instanceId, instanceWithId);
    }
  });

  // 合并 deletes 列表（去重）
  const mergedDeletes = new Set([
    ...(prevInstanceSchema.deletes || []),
    ...(currentInstanceSchema.deletes || []),
  ]);

  // 构建最终的结果
  return {
    objectId: currentInstanceSchema.objectId || prevInstanceSchema.objectId,
    imports: Array.from(importMap.values()),
    deletes: Array.from(mergedDeletes),
  };
}
