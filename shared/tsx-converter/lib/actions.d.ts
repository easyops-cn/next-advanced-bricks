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

/** 返回一个有状态的值和一个更新它的函数。 */
declare const useState: <T>(
  initialValue?: T
) => [value: T, setter: (value: T) => void];

/** 返回一个可变的 ref 对象，其 `.current` 属性初始化为传入的参数 (`initialValue`) */
declare const useRef: <T>(initialValue: T) => {
  current: T;
};

/** 异步获取资源，返回获取到的数据、以及一个重新拉取数据的函数 */
declare const useResource: <T = any>(
  fetcher: () => Promise<T>,
  options?: {
    // 不启用则直接返回 fallback
    enabled?: boolean;
    fallback?: unknown;
  }
) => [data: T, refetch: () => void];

/** 获取当前的 URL search 参数 */
declare const useQuery: () => {
  readonly [key: string]: string | undefined;
};

/** 更新当前的 URL search 参数 */
declare const pushQuery: (
  newQuery: Record<string, string | null>,
  options?: UpdateQueryOptions
) => void;

interface UpdateQueryOptions {
  clear?: boolean; // 是否清除已有参数，默认 false
  notify?: boolean; // 是否通知路由变化，默认 true
}

/** 调用指定的工具函数 */
declare const callTool: <T = any, P = any>(
  conversationId: string,
  stepId: string,
  params: P
) => Promise<T>;

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
