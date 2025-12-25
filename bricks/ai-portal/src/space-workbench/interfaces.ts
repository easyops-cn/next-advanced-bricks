export interface SpaceDetail {
  name: string;
  instanceId: string;
  description: string;
}

export type AttributeType =
  | "string"
  | "text"
  | "int"
  | "float"
  | "bool"
  | "date"
  | "datetime"
  | "file"
  | "enum";

export interface Attribute {
  id: string;
  name: string;
  description: string;
  required: boolean;
  type: AttributeType;
  isArray?: boolean;
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

export interface InstanceSchema {
  objectId?: string; // 模型 id
  imports?: InstanceItem[];
  deletes?: string[]; // 删除实例的列表，为 instanceId 的数组
}

export interface InstanceItem {
  /** 前端管理用的唯一标识 ID */
  _id_: string;
  /** 实例 ID(编辑时存在,新增时可能为空) */
  instanceId?: string;
  /** 实例属性数据 */
  [key: string]: any;
}

export interface ConversationItem {
  /** 会话ID */
  conversationId?: string;
  /** 项目ID */
  projectId?: string;
  /** 会话标题 */
  title?: string;
  /** 会话状态 */
  state?: string;
  /** 创建时间(时间戳) */
  startTime?: number;
  /** 会话关联的目标ID */
  goalInstanceId?: string;
  /** 创建者的用户名 */
  username?: string;
  /** 会话描述 */
  description?: string;
  /** 更新时间(时间戳) */
  updatedAt?: number;
  /** 绑定的业务流实例id列表 */
  serviceFlowIds?: string[];
}
