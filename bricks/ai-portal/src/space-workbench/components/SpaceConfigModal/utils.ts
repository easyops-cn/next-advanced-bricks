import { Activity, SpaceConfigSchema } from "../../interfaces";

export function mergeConfigSchema(
  prevSchema: SpaceConfigSchema,
  currentEditSchema: SpaceConfigSchema
): SpaceConfigSchema {
  // 先处理删除操作，然后再合并新增/更新的项
  // 删除 businessObjects
  let mergedBusinessObjects = [...(prevSchema.businessObjects || [])];
  if (currentEditSchema.deleteObjects?.length) {
    mergedBusinessObjects = mergedBusinessObjects.filter(
      (obj) => !currentEditSchema.deleteObjects?.includes(obj.objectId)
    );
  }

  // 删除 objectRelations
  let mergedObjectRelations = [...(prevSchema.objectRelations || [])];
  if (currentEditSchema.deleteRelations?.length) {
    mergedObjectRelations = mergedObjectRelations.filter(
      (rel) => !currentEditSchema.deleteRelations?.includes(rel.name)
    );
  }

  // 删除 businessFlows
  let mergedBusinessFlows = [...(prevSchema.businessFlows || [])];
  if (currentEditSchema.deleteFlows?.length) {
    mergedBusinessFlows = mergedBusinessFlows.filter(
      (flow) => !currentEditSchema.deleteFlows?.includes(flow.name)
    );
  }

  // 合并 businessObjects（找到覆盖，找不到新增）
  if (currentEditSchema.businessObjects?.length) {
    const existingObjectMap = new Map(
      mergedBusinessObjects.map((obj) => [obj.objectId, obj])
    );
    currentEditSchema.businessObjects.forEach((obj) => {
      existingObjectMap.set(obj.objectId, obj);
    });
    mergedBusinessObjects = Array.from(existingObjectMap.values());
  }

  // 合并 objectRelations（找到覆盖，找不到新增）
  if (currentEditSchema.objectRelations?.length) {
    const existingRelationMap = new Map(
      mergedObjectRelations.map((rel) => [rel.name, rel])
    );
    currentEditSchema.objectRelations.forEach((rel) => {
      existingRelationMap.set(rel.name, rel);
    });
    mergedObjectRelations = Array.from(existingRelationMap.values());
  }

  // 合并 businessFlows（找到覆盖，找不到新增）
  if (currentEditSchema.businessFlows?.length) {
    const existingFlowMap = new Map(
      mergedBusinessFlows.map((flow) => [flow.name, flow])
    );
    currentEditSchema.businessFlows.forEach((flow) => {
      existingFlowMap.set(flow.name, flow);
    });
    mergedBusinessFlows = Array.from(existingFlowMap.values());
  }

  // 更新 configSchema
  return {
    businessObjects: mergedBusinessObjects,
    objectRelations: mergedObjectRelations,
    businessFlows: mergedBusinessFlows,
    deleteObjects: currentEditSchema.deleteObjects,
    deleteRelations: currentEditSchema.deleteRelations,
    deleteFlows: currentEditSchema.deleteFlows,
  };
}

export function handleModifyActivity(
  prevSchema: SpaceConfigSchema,
  stageName: string,
  newActivity: Activity
): SpaceConfigSchema {
  let hasModified = false;

  // 创建 businessFlows 的深拷贝
  const updatedBusinessFlows = prevSchema.businessFlows.map((flow) => {
    // 如果当前流程没有 spec,跳过
    if (!flow.spec || flow.spec.length === 0) {
      return flow;
    }

    // 查找匹配的 stage
    const stageIndex = flow.spec.findIndex((spec) => spec.name === stageName);
    if (stageIndex === -1) {
      // 当前流程中没有匹配的 stage,返回原流程
      return flow;
    }

    // 找到匹配的 stage,检查其中的 activities
    const targetStage = flow.spec[stageIndex];
    const activities = targetStage.serviceFlowActivities || [];

    // 查找同名的 activity
    const activityIndex = activities.findIndex(
      (activity) => activity.name === newActivity.name
    );

    if (activityIndex === -1) {
      // 没有找到同名 activity,返回原流程
      return flow;
    }

    // 找到了同名 activity,进行更新
    hasModified = true;
    const updatedActivities = [...activities];
    updatedActivities[activityIndex] = newActivity;

    // 更新 spec
    const updatedSpec = [...flow.spec];
    updatedSpec[stageIndex] = {
      ...targetStage,
      serviceFlowActivities: updatedActivities,
    };

    // 返回更新后的 flow
    return {
      ...flow,
      spec: updatedSpec,
    };
  });

  // 如果没有任何修改,打印警告并返回原 schema
  if (!hasModified) {
    // eslint-disable-next-line no-console
    console.warn(
      `Activity "${newActivity.name}" not found in stage "${stageName}" across all business flows.`
    );
    return prevSchema;
  }

  // 返回更新后的 schema
  return {
    ...prevSchema,
    businessFlows: updatedBusinessFlows,
  };
}
