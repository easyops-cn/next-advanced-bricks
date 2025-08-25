/** 提示用户操作结果 */
declare const showMessage: (options: {
  type: "success" | "error";
  content: string;
}) => void;

/** 刷新指定的数据源 */
declare const refresh: (dataSource: unknown) => void;

/** 调用指定的接口 */
declare const callApi: <T extends keyof ContractMap>(
  api: T,
  params: Parameters<ContractMap[T]>[0],
  metadata?: { objectId?: string | null }
) => Promise<ReturnType<ContractMap[T]>>;

/** 获取指定的组件 */
declare const getComponent: <T extends keyof ComponentInstanceMap>(
  name: T,
  id: string
) => ComponentInstanceMap[T];

interface ComponentInstanceMap {
  Form: {
    validate: () => void;
    reset: () => void;
  };
  Modal: {
    open: () => void;
  };
}
