/** 提示用户操作结果 */
declare const showMessage: (options: {
  type: "success" | "error";
  content: string;
}) => void;

/** 刷新指定的数据源 */
declare const refresh: (dataSource: unknown) => void;

/** 调用指定的 Provider 接口 */
declare const callApi: <T extends keyof ContractMap>(
  api: T,
  params: Parameters<ContractMap[T]>[0]
) => Promise<ReturnType<ContractMap[T]>>;

/** 调用指定的 HTTP 接口 */
declare const callHttp: <T = any>(
  url: string,
  init?: RequestInit
) => Promise<T>;

declare const useState: <T>(
  initialValue?: T
) => [value: T, setter: (value: T) => void];

declare const useResource: <T = any>(
  fetcher: () => Promise<T>,
  options?: {
    // 不启用则直接返回 fallback
    enabled?: boolean;
    fallback?: unknown;
  }
) => [data: T, refetch: () => void];

/** 数据实体 SDK */
declare namespace Entity {
  export function list(
    entity: string,
    params?: {
      fields: string[];
      filter?: object[];
      page?: number;
      pageSize?: number;
    }
  ): Promise<{
    page: number;
    pageSize: number;
    total: number;
    list: object[];
  }>;

  export function get(entity: string, id: string): Promise<object | null>;
}

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
