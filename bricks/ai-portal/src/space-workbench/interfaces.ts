export interface SpaceDetail {
  name: string;
  instanceId: string;
  description: string;
}

export interface Knowledge {
  instanceId: string;
  name: string;
  description?: string;
  time?: number;
  user?: string;
  openApiUrl?: string;
  state?: string;
  content?: string;
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

export interface BusinessObjectGroup {
  objectId: string;
  objectName: string;
  instances: BusinessInstance[];
}

export interface BusinessInstance {
  instanceId: string;
  name?: string;
  status?: string;
  mtime: number;
  ctime: number;
  [key: string]: any;
}

export interface KnowledgeItem {
  /** 文档实例ID（主键） */
  instanceId?: string;
  /** 文档名称 */
  name?: string;
  /** 文档描述 */
  description?: string;
  /** 所属elevo项目ID */
  projectId?: string;
  /** 文档内容（与openApiUrl二选一） */
  content?: string;
  /** OpenAPI文档URL（与content二选一） */
  openApiUrl?: string;
  /** 何时使用该知识的描述 */
  useCondition?: string;
  /** 状态，可选值：active, inactive */
  state?: string;
  /** 知识片段数量 */
  knowledgeCount?: number;
  /** 创建者 */
  creator?: string;
  /** 创建时间 */
  ctime?: string;
  /** 修改时间 */
  mtime?: string;
  /** 修改者 */
  modifier?: string;
}
