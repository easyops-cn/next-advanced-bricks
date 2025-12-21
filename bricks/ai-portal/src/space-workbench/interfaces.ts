export interface SpaceDetail {
  name: string;
  instanceId: string;
  description: string;
}

interface Attribute {
  id: string;
  name: string;
  description: string;
  required: boolean;
  type: string;
}

interface ObjectRelation {
  relation_id: string;
  name: string;
  description: string;
  left_object_id: string;
  right_object_id: string;
  left_id: string;
  right_id: string;
}
export interface BusinessObject {
  objectId: string;
  objectName: string;
  description: string;
  lifecycle?: string;
  attributes?: Attribute[];
  relations?: ObjectRelation[];
}

export interface BusinessFlow {
  instanceId: string;
  name: string;
  description: string;
  prerequisite?: string;
  needConfirm?: boolean;
  spec?: Spec[];
}

export interface Activity {
  aiEmployeeId: string; // 负责数字人
  description: string; // 活动描述
  hilRules?: string; // HITL 规则
  hilUser?: string; // HITL介入用户
  name: string; // 活动名称
}
interface Spec {
  name: string;
  serviceFlowActivities?: Activity[];
}

export interface SpaceConfigSchema {
  businessObjects: BusinessObject[];
  objectRelations: ObjectRelation[];
  businessFlows: BusinessFlow[];
  deleteObjects?: string[]; // 需要删除的业务对象 objectId 列表
  deleteRelations?: string[]; // 需要删除的关系 name 列表
  deleteFlows?: string[]; // 需要删除的业务流程 name 列表
}

export type ViewType = "visual" | "json";
