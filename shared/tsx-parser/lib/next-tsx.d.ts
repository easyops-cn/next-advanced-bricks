/** 返回一个有状态的值和一个更新它的函数。 */
export const useState: <T>(
  initialValue?: T
) => [value: T, setter: Dispatch<SetStateAction<T>>];

export type Dispatch<A> = (value: A) => void;

export type SetStateAction<S> = S | ((prevState: S) => S);

/** 异步获取资源，返回获取到的数据、以及一个重新拉取数据的函数 */
export const useResource: <T = any>(
  fetcher: () => Promise<T>,
  options?: {
    // 不启用则直接返回 fallback
    enabled?: boolean;
    fallback?: unknown;
  }
) => [data: T, refetch: () => void];

/** 返回一个可变的 ref 对象，其 `.current` 属性初始化为传入的参数 (`initialValue`) */
export const useRef: <T>(initialValue: T) => {
  current: T;
};

/** 获取当前应用的信息 */
export const useApp: () => App;

export interface App {
  id: string;
  name: string;
  homepage: string;
  config: Record<string, any>;
}

/** 获取当前的 URL search 参数 */
export const useQuery: () => {
  readonly [key: string]: string | undefined;
};

/** 获取当前的 URL path 参数 */
export const usePathParams: () => {
  readonly [key: string]: string | undefined;
};

/** 获取用于进行导航跳转的对象 */
export const useHistory: () => History;

export interface History {
  push: (url: string) => void;
  replace: (url: string) => void;
  reload: () => void;
  pushQuery: UpdateQuery;
  replaceQuery: UpdateQuery;
}

export type UpdateQuery = (
  newQuery: Record<string, string | null>,
  options?: {
    clear?: boolean; // 是否清除已有参数，默认 false
    notify?: boolean; // 是否通知路由变化，默认 true
  }
) => void;

export const useLocation: () => {
  href: string;
  origin: string;
  host: string;
  hostname: string;
};

/** 获取当前用户的信息 */
export const useAuth: () => {
  username: string;
  userInstanceId: string;
  isAdmin: boolean;
};

/** 接收一个 Context 对象，返回其当前的值 */
export const useContext: <T>(context: Context<T>) => T;

/** 创建一个 Context 来跨组件传递数据 */
export const createContext: <T>(defaultValue?: T) => Context<T>;

export interface Context<T> {
  /** 提供 Context 数据的组件 */
  Provider: (props: { value: T; children: React.ReactNode }) => any;
}

/**
 * 按 key 获取翻译后的文本。
 * 可传递变量用于替换文本中的占位符（形如 `{{ propName }}`）。
 */
export const translate: (
  key: string,
  variables?: Record<string, unknown>
) => string;

export const translateByRecord: (record: Record<string, string>) => string;

/** 调用指定的 Provider 接口 */
export const callApi: <T extends keyof ContractMap>(
  api: T,
  params: Parameters<ContractMap[T]>[0]
) => Promise<ReturnType<ContractMap[T]>>;

/** 调用指定的 HTTP 接口 */
export const callHttp: <T = any>(url: string, init?: RequestInit) => Promise<T>;

/** 调用指定的工具函数 */
export const callTool: <T = any, P = any>(
  conversationId: string,
  stepId: string,
  params: P
) => Promise<T>;

/** 提示用户操作结果 */
export const showMessage: (options: {
  type: "success" | "error" | "warn" | "info";
  content: string;
}) => void;

/** 弹出对话框 */
export const showDialog: (options: {
  type?: "success" | "error" | "warn" | "info" | "confirm" | "delete";
  title?: string;
  content: string;
  danger?: boolean;
  /**
   * 配合 type: delete 使用，用户需要输入期望值才能进行操作。
   * 在 content 中可以使用 `{{ expect }}` 占位符来显示期望值。
   */
  expect?: string;
}) => Promise<void>;

/** 拷贝一段文本 */
export const copyText: (text: string) => Promise<void>;

/**
 * 平台部署的基础路径，通常为 `/next/`。
 *
 * 对于大部分组件，设置 url 时不需要带上该前缀，但在某些需要使用完整 URL 的场景下需要使用该常量进行拼接。
 */
export const BASE_URL: string;
