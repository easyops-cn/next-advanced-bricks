import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EventEmitter, createDecorators } from "@next-core/element";
import { unwrapProvider } from "@next-core/utils/general";
import { wrapBrick } from "@next-core/react-element";
import { useCurrentTheme } from "@next-core/react-runtime";
import { getRuntime } from "@next-core/runtime";
import { HttpAbortError } from "@next-core/http";
import { FormItemElementBase } from "@next-shared/form";
import type { FormItem, FormItemProps } from "@next-bricks/form/form-item";
import * as monaco from "monaco-editor";
import {
  initializeTokensProvider,
  languages as textmateLanguages,
} from "@next-shared/monaco-textmate";
import "@next-shared/monaco-textmate/workers.js";
import tmVsLight from "@next-shared/monaco-textmate/themes/light-modern.json";
import tmVsDark from "@next-shared/monaco-textmate/themes/dark-modern.json";
import yaml from "js-yaml";
import "@next-core/theme";
import { uniqueId, debounce } from "lodash";
import {
  EDITOR_SCROLLBAR_SIZE,
  EDITOR_PADDING_VERTICAL,
  EDITOR_LINE_HEIGHT,
  EDITOR_FONT_SIZE,
} from "./constants.js";
import {
  AdvancedCompleterMap,
  ExtraLib,
  type ExtraMarker,
  type MixedCompleter,
} from "./interfaces.js";
import { brickNextYAMLProviderCompletionItems } from "./utils/brickNextYaml.js";
import { Level } from "./utils/constants.js";
import { setEditorId } from "./utils/editorId.js";
import {
  getEmbeddedJavascriptUri,
  getBrickYamlBuiltInDeclare,
} from "./utils/jsSuggestInBrickYaml.js";
import type { EoTooltip, ToolTipProps } from "@next-bricks/basic/tooltip";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { useTranslation, initializeReactI18n } from "@next-core/i18n/react";
import { K, NS, locales } from "./i18n.js";
import type { copyToClipboard as _copyToClipboard } from "@next-bricks/basic/data-providers/copy-to-clipboard";
import type { showNotification as _showNotification } from "@next-bricks/basic/data-providers/show-notification/show-notification";
import classNames from "classnames";
import {
  MonacoCopilotProvider,
  SUPPORTED_LANGUAGES,
} from "@next-shared/monaco-copilot";
import { AiopsBaseApi_openaiChat } from "@next-api-sdk/llm-sdk";
import "./index.css";
import { EmbeddedModelContext } from "./utils/embeddedModelState.js";
import { PlaceholderContentWidget } from "./widget/Placeholder.js";
import { getRemoteYamlLinterWorker } from "./workers/yamlLinter.js";
import { getRemoteSpellCheckWorker } from "./workers/spellCheckRemoteWorker.js";
import { register as registerCel } from "./languages/cel.js";
import { register as registerCelYaml } from "./languages/cel-yaml.js";
import { register as registerCelStr } from "./languages/cel-str.js";
import {
  provideEmbeddedCelCompletionItems,
  celCommonCompletionProviderFactory,
  celSpecificCompletionProviderFactory,
} from "./utils/celCompletionProvider.js";
import {
  disposeEditor,
  isCurrentEditor,
  switchEditor,
} from "./utils/EditorService.js";
import { setExtraLibs } from "./utils/setExtraLibs.js";

initializeReactI18n(NS, locales);

monaco.editor.defineTheme(
  "tm-vs-light",
  tmVsLight as monaco.editor.IStandaloneThemeData
);
monaco.editor.defineTheme(
  "tm-vs-dark",
  tmVsDark as monaco.editor.IStandaloneThemeData
);

const TEXTMATE_THEMES = ["tm-vs-light", "tm-vs-dark"];
const DARK_THEMES = ["vs-dark", "hc-black", "tm-vs-dark"];

registerCel(monaco);
registerCelYaml(monaco);
registerCelStr(monaco);

const EMBEDDED_CEL = ["cel_yaml", "cel_str"];
const CEL_FAMILY = ["cel", ...EMBEDDED_CEL];
for (const lang of EMBEDDED_CEL) {
  monaco.languages.registerCompletionItemProvider(lang, {
    triggerCharacters: ["<"],
    provideCompletionItems: provideEmbeddedCelCompletionItems,
  });
}

for (const lang of CEL_FAMILY) {
  monaco.languages.registerCompletionItemProvider(
    lang,
    celCommonCompletionProviderFactory(lang)
  );
}

// istanbul ignore next
const { enabled: copilotEnabled, ...copilotOptions } =
  (getRuntime()?.getMiscSettings().globalMonacoEditorCopilotOptions ?? {}) as {
    enabled?: boolean;
    model?: string;
    debounce?: number;
    timeout?: number;
  };

// istanbul ignore next
if (copilotEnabled) {
  monaco.languages.registerInlineCompletionsProvider(
    SUPPORTED_LANGUAGES,
    new MonacoCopilotProvider({
      ...copilotOptions,
      async request({ model, temperature, system, prompt, signal }) {
        const response = await AiopsBaseApi_openaiChat(
          {
            model,
            temperature,
            enableSensitiveWordsFilter: false,
            stream: false,
            messages: [
              ...(system ? [{ role: "system", content: system }] : []),
              { role: "user", content: prompt },
            ],
          },
          {
            signal,
            interceptorParams: {
              ignoreLoadingBar: true,
            },
          }
        );
        return response.choices?.[0]?.message?.content?.trim();
      },
      HttpAbortError,
    })
  );
}

const { defineElement, property, event } = createDecorators();

const WrappedFormItem = wrapBrick<FormItem, FormItemProps>("eo-form-item");
const WrappedTooltip = wrapBrick<EoTooltip, ToolTipProps>("eo-tooltip");
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const copyToClipboard = unwrapProvider<typeof _copyToClipboard>(
  "basic.copy-to-clipboard"
);
const showNotification = unwrapProvider<typeof _showNotification>(
  "basic.show-notification"
);

const SPELL_CHECK = "spell_check";
const BRICK_NEXT_YAML_LINT = "brick_next_yaml_lint";
const EXTRA_MARKERS = "extra_markers";

export interface CodeEditorProps {
  name?: string;
  label?: string;
  value?: string;
  language?: string;
  theme?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  automaticLayout?: "fit-container" | "fit-content" | "none";
  minLines?: number;
  maxLines?: number;
  height?: string | number;
  completers?: monaco.languages.CompletionItem[];
  tokenConfig?: TokenConfig;
  advancedCompleters?: AdvancedCompleterMap | MixedCompleter[];
  extraLibs?: ExtraLib[];
  extraMarkers?: ExtraMarker[];
  markers?: Marker[];
  links?: string[];
  showExpandButton?: boolean;
  showCopyButton?: boolean;
  lineNumbers?: monaco.editor.LineNumbersType;
  glyphMargin?: boolean;
  validateState?: string;
  customValidationInBrickNextYaml?: boolean;
  fixedOverflowWidgets?: boolean;
  spellCheck?: boolean;
  knownWords?: string[];
  domLibsEnabled?: boolean;
  uri?: string;
}

export type { ExtraLib, ExtraMarker };

export interface Marker {
  token: string;
  level?: keyof typeof Level;
  message?: string;
  code?: {
    value: string;
    target: string;
  };
  params?: string[];
}

export type TokenConfig = {
  showDSKey?: boolean;
};

export interface CodeEditorEventsMap {
  "code.change": CustomEvent<string>;
  "user.input": CustomEvent<any>;
  "token.click": CustomEvent<string>;
}

export interface CodeEditorEventsMapping {
  onCodeChange: "code.change";
  onUserInput: "user.input";
  onTokenClick: "token.click";
}

/**
 * @description 基于 Monaco Editor 的代码编辑器构件，支持多种编程语言（typescript、yaml、brick_next_yaml、cel 等）的语法高亮与自动补全，支持作为表单项使用，支持自动布局、拼写检查、Lint 校验、标记高亮等高级功能。
 * @category form-input-advanced
 */
export
@defineElement("vs.code-editor", {
  // There are a few issues for monaco-editor with shadow DOM.
  // So we use light DOM for now.
  // See https://github.com/microsoft/monaco-editor/issues?q=is%3Aissue+is%3Aopen+shadow+dom
  shadowOptions: false,
})
class CodeEditor extends FormItemElementBase implements CodeEditorProps {
  /**
   * @description 表单字段名，用于在表单提交时标识该字段。
   */
  @property()
  accessor name: string | undefined;

  /**
   * @description 表单字段标签，显示在编辑器上方作为说明文字。
   */
  @property()
  accessor label: string | undefined;

  /**
   * @description 编辑器的当前值（代码文本内容）。
   */
  @property()
  accessor value: string | undefined;

  /**
   * @description 编辑器的编程语言，决定语法高亮和自动补全行为，支持 `typescript`、`javascript`、`yaml`、`brick_next_yaml`、`cel`、`cel_yaml`、`cel_str` 等。
   * @default "plaintext"
   */
  @property()
  accessor language: string | undefined;

  /**
   * @description 编辑器主题，`auto` 跟随系统主题自动切换，`vs` 为亮色，`vs-dark` 为暗色。
   * @default "auto"
   * @group ui
   */
  @property() accessor theme: string | undefined;

  /**
   * @description 是否为表单必填项，启用后表单提交时会校验该字段不能为空。
   */
  @property({
    type: Boolean,
  })
  accessor required: boolean | undefined;

  /**
   * @description 是否为只读模式，启用后用户无法编辑代码内容。
   */
  @property({
    type: Boolean,
  })
  accessor readOnly: boolean | undefined;

  /**
   * @description 自动布局模式：`fit-content` 根据内容高度自动调整编辑器高度（由 `minLines`/`maxLines` 控制范围），`fit-container` 自动填满父容器尺寸，`none` 不自动调整。
   */
  @property()
  accessor automaticLayout:
    | "fit-container"
    | "fit-content"
    | "none"
    | undefined;

  /**
   * @description 编辑器最小行数，与 `automaticLayout: "fit-content"` 配合使用，控制编辑器的最小显示高度。
   * @default 3
   */
  @property({ type: Number })
  accessor minLines: number | undefined;

  /**
   * @description 仅对 language 为 brick_next_yaml 有效，设置第一层属性名的自动补全。
   */
  @property({
    attribute: false,
  })
  accessor completers: monaco.languages.CompletionItem[] | undefined;

  /**
   * @description 高级自动补全配置。设置为键值对时仅对 language 为 brick_next_yaml 有效，设置任意路径的自动补全；设置为数组时当前仅对 language 为 cel 等系列语言有效。未来将统一改为数组格式，废弃键值对格式。
   */
  @property({
    attribute: false,
  })
  accessor advancedCompleters:
    | AdvancedCompleterMap
    | MixedCompleter[]
    | undefined;

  /**
   * @description 标记配置，用于在编辑器中对指定 token 进行高亮标注，并可关联错误/警告级别与提示信息，仅对 language 为 brick_next_yaml 有效。
   */
  @property({ attribute: false })
  accessor markers: Marker[] | undefined;

  /**
   * @description 可点击链接的命名空间列表，在 language 为 brick_next_yaml 时，按住 Ctrl/Cmd 点击这些关键字可触发 `token.click` 事件。
   */
  @property({ attribute: false })
  accessor links: string[] | undefined;

  /**
   * @description 编辑器最大行数，与 `automaticLayout: "fit-content"` 配合使用，控制编辑器的最大显示高度（超出后出现滚动条）。
   * @default Infinity
   */
  @property({ type: Number })
  accessor maxLines: number | undefined;

  /**
   * @description 固定高度（像素或 CSS 字符串），当 `automaticLayout` 不为 `fit-content` 时生效。
   */
  @property({ attribute: false })
  accessor height: string | number | undefined;

  /**
   * @description 表单字段自定义校验提示信息。
   */
  @property()
  accessor message: string | undefined;

  /**
   * @description 编辑器为空时显示的占位提示文字。
   */
  @property()
  accessor placeholder: string | undefined;

  /**
   * @description 是否展示展开/收起按钮，点击后编辑器全屏展开，按 Esc 键收起。
   */
  @property({ type: Boolean })
  accessor showExpandButton: boolean | undefined;

  /**
   * @description 行号显示模式，`on` 显示行号，`off` 隐藏行号，也可传入函数自定义行号格式。
   */
  @property()
  accessor lineNumbers: monaco.editor.LineNumbersType | undefined;

  /**
   * @description 自定义高亮配置，目前支持 `showDSKey` 选项，在 brick_next_yaml 中控制是否对 DS（数据源）相关的 key 进行高亮显示。
   */
  @property({
    attribute: false,
  })
  accessor tokenConfig: TokenConfig | undefined;

  /**
   * @description 在 brick_next_yaml 中是否开启嵌入 JavaScript 的语义相关校验（TypeScript 类型检查）。
   * @default false
   */
  @property({
    type: Boolean,
  })
  accessor customValidationInBrickNextYaml: boolean | undefined;

  /**
   * @description 是否展示复制按钮，点击后将编辑器内容复制到剪贴板。
   * @default true
   */
  @property({ type: Boolean })
  accessor showCopyButton: boolean | undefined;

  /**
   * @description 是否显示字形边距（Glyph Margin），启用后在行号左侧留出额外空间，可用于显示调试断点等装饰器。
   * @default false
   */
  @property({ type: Boolean })
  accessor glyphMargin: boolean | undefined;

  /**
   * @description 额外声明的 TypeScript/JavaScript lib 库，用于在 javascript/typescript/brick_next_yaml 中提供自定义类型声明和自动补全提示。
   */
  @property({
    attribute: false,
  })
  accessor extraLibs: ExtraLib[] | undefined;

  /**
   * @description 额外的编辑器标记（Marker），可在指定位置显示错误/警告/信息级别的诊断提示，与 `markers` 不同，支持通过行列坐标精确定位。
   */
  @property({
    attribute: false,
  })
  accessor extraMarkers: ExtraMarker[] | undefined;

  /**
   * @description 是否将编辑器的悬浮提示（如自动补全下拉框、悬停文档等）渲染到 body 层，避免被父容器 overflow 裁剪。
   * @default true
   */
  @property({ type: Boolean })
  accessor fixedOverflowWidgets: boolean | undefined;

  /**
   * @description 是否启用英语拼写检查，启用后会对代码中的英文单词进行拼写校验并标注错误。
   * @default true
   */
  @property({ type: Boolean })
  accessor spellCheck: boolean | undefined;

  /**
   * @description 启用拼写检查时，在系统词汇表之外额外指定的已知单词列表（全小写），这些单词不会被标记为拼写错误。
   */
  @property({ attribute: false })
  accessor knownWords: string[] | undefined;

  /**
   * @description 是否启用 DOM 相关接口的 TypeScript 自动提示（lib: ["dom"]），启用后在 javascript/typescript 中可获得浏览器 DOM API 的类型声明。
   */
  @property({ type: Boolean })
  accessor domLibsEnabled: boolean | undefined;

  /**
   * @description 编辑器模型的 URI 标识符，用于区分同一语言下的不同编辑器实例，影响 TypeScript/JavaScript 语言服务的作用域隔离。
   */
  @property()
  accessor uri: string | undefined;

  /**
   * @detail `string` — 当前编辑器的完整代码文本
   * @description 编辑器内容发生变化时触发（仅用户主动编辑触发，setValue 等程序调用不触发）。
   */
  @event({ type: "code.change" })
  accessor #codeChange!: EventEmitter<string>;

  /**
   * @detail `any` — 用户输入的内容
   * @description 用户在编辑器中输入时触发。
   */
  @event({ type: "user.input" })
  accessor #userInput!: EventEmitter<any>;

  #handleChange = (value: string) => {
    this.value = value;
    this.getFormElement()?.formStore.onChange(this.name!, value);
    this.#codeChange.emit(value);
  };

  #handleUserInput = (value: any) => {
    this.#userInput.emit(value);
  };

  /**
   * @detail `string` — 被点击的 token 文本（如 `CTX`、`FN` 等命名空间关键字）
   * @description 在 language 为 brick_next_yaml 时，用户按住 Ctrl/Cmd 键点击 `links` 中配置的关键字时触发。
   */
  @event({ type: "token.click" })
  accessor #tokenClickEvent!: EventEmitter<string>;

  #handleTokenClick = (word: string) => {
    this.#tokenClickEvent.emit(word);
  };

  #handleValidator = (value: string) => {
    if (this.language === "brick_next_yaml" || this.language === "yaml") {
      try {
        yaml.load(value);
      } catch {
        return "请填写正确的格式";
      }
    }
    return "";
  };

  connectedCallback(): void {
    // Don't override user's style settings.
    // istanbul ignore else
    if (!this.style.display) {
      this.style.display = "block";
    }
    super.connectedCallback();
  }

  render() {
    return (
      <WrappedFormItem
        exportparts="message"
        curElement={this}
        formElement={this.getFormElement()}
        name={this.name}
        label={this.label}
        required={this.required}
        helpBrick={this.helpBrick}
        labelBrick={this.labelBrick}
        notRender={this.notRender}
        validator={this.#handleValidator}
      >
        <CodeEditorComponent
          value={this.value}
          language={this.language}
          readOnly={this.readOnly}
          theme={this.theme}
          automaticLayout={this.automaticLayout}
          minLines={this.minLines}
          maxLines={this.maxLines}
          height={this.height}
          completers={this.completers}
          advancedCompleters={this.advancedCompleters}
          extraLibs={this.extraLibs}
          extraMarkers={this.extraMarkers}
          markers={this.markers}
          links={this.links}
          tokenConfig={this.tokenConfig}
          lineNumbers={this.lineNumbers}
          glyphMargin={this.glyphMargin}
          placeholder={this.placeholder}
          showCopyButton={this.showCopyButton}
          showExpandButton={this.showExpandButton}
          validateState={this.validateState}
          onChange={this.#handleChange}
          onUserInput={this.#handleUserInput}
          onTokenClick={this.#handleTokenClick}
          customValidationInBrickNextYaml={this.customValidationInBrickNextYaml}
          fixedOverflowWidgets={this.fixedOverflowWidgets}
          spellCheck={this.spellCheck}
          knownWords={this.knownWords}
          domLibsEnabled={this.domLibsEnabled}
          uri={this.uri}
        />
      </WrappedFormItem>
    );
  }
}

export function CodeEditorComponent({
  value: _value,
  language: _language,
  theme: _theme,
  minLines: _minLines,
  maxLines: _maxLines,
  height: _height,
  automaticLayout,
  completers,
  advancedCompleters,
  markers,
  readOnly,
  links,
  extraLibs,
  extraMarkers,
  tokenConfig,
  showExpandButton,
  showCopyButton = true,
  lineNumbers = "on",
  glyphMargin = false,
  placeholder,
  validateState,
  onChange,
  // onUserInput,
  onTokenClick,
  customValidationInBrickNextYaml,
  fixedOverflowWidgets: _fixedOverflowWidgets,
  spellCheck: _spellCheck,
  knownWords,
  domLibsEnabled,
  uri,
}: CodeEditorProps & {
  onChange(value: string): void;
  onUserInput: (value: any) => void;
  onTokenClick(word: string): void;
}) {
  const value = _value ?? "";
  const language = _language ?? "plaintext";
  const theme = _theme ?? "auto";
  const minLines = _minLines ?? 3;
  const maxLines = _maxLines ?? Infinity;
  const height = _height ?? 500;
  const fixedOverflowWidgets = _fixedOverflowWidgets ?? true;
  const spellCheck = _spellCheck ?? true;
  const [expanded, setExpanded] = useState(false);
  const workerId = useMemo(() => uniqueId("worker"), []);

  const { t } = useTranslation(NS);

  const containerRef = useRef<HTMLDivElement>(null);
  const decorationsCollection =
    useRef<monaco.editor.IEditorDecorationsCollection>();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const size = useRef<monaco.editor.IDimension>({
    width: 300,
    height: getContentHeightByCode(value, minLines, maxLines),
  });
  const [actualWidth, setActualWidth] = useState<string | number>();
  const [actualHeight, setActualHeight] = useState<string | number>();
  // `automaticLayout` should never change
  const automaticLayoutRef = useRef(automaticLayout);
  const systemTheme = useCurrentTheme();

  const useTextmateTheme = textmateLanguages.includes(language);
  const computedTheme = useMemo(() => {
    const candidateTheme =
      theme === "auto"
        ? systemTheme === "dark" || systemTheme === "dark-v2"
          ? "vs-dark"
          : "vs"
        : theme;
    if (useTextmateTheme && !TEXTMATE_THEMES.includes(candidateTheme)) {
      return DARK_THEMES.includes(candidateTheme)
        ? "tm-vs-dark"
        : "tm-vs-light";
    }
    return candidateTheme;
  }, [systemTheme, theme, useTextmateTheme]);
  const isDarkTheme = DARK_THEMES.includes(computedTheme);

  useEffect(() => {
    if (TEXTMATE_THEMES.includes(computedTheme)) {
      return;
    }
    const lineHighlightBackground = isDarkTheme ? "#FFFFFF0F" : "#0000000A";
    monaco.editor.defineTheme("custom-theme", {
      base: computedTheme as "vs-dark" | "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.lineHighlightBackground": `${lineHighlightBackground}`,
      },
    });
    // Currently theme is configured globally.
    // See https://github.com/microsoft/monaco-editor/issues/338
    monaco.editor.setTheme("custom-theme");
  }, [computedTheme, isDarkTheme]);

  useEffect(() => {
    monaco.editor.setTheme(computedTheme);
  }, [computedTheme]);

  useEffect(() => {
    if (editorRef.current) {
      const currentModel = editorRef.current.getModel()!;
      monaco.editor.setModelLanguage(currentModel, language);
    }
    initializeTokensProvider(language);
  }, [language]);

  useEffect(() => {
    if (language === "brick_next_yaml") {
      const provideCompletionItems = brickNextYAMLProviderCompletionItems(
        completers,
        Array.isArray(advancedCompleters) ? undefined : advancedCompleters,
        workerId,
        tokenConfig
      );
      const monacoProviderRef = monaco.languages.registerCompletionItemProvider(
        "brick_next_yaml",
        {
          provideCompletionItems,
          triggerCharacters: [".", ":", "<"],
        } as monaco.languages.CompletionItemProvider
      );
      return () => {
        monacoProviderRef.dispose();
      };
    }
  }, [completers, advancedCompleters, language, workerId, tokenConfig]);

  useEffect(() => {
    if (
      Array.isArray(advancedCompleters) &&
      advancedCompleters.length > 0 &&
      CEL_FAMILY.includes(language)
    ) {
      const disposable = monaco.languages.registerCompletionItemProvider(
        language,
        celSpecificCompletionProviderFactory(
          language,
          workerId,
          advancedCompleters
        )
      );
      return () => {
        disposable.dispose();
      };
    }
  }, [language, advancedCompleters, workerId]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const currentModel = editor.getModel();
      if (currentModel?.getValue && value !== currentModel.getValue()) {
        currentModel.setValue(value as string);
      }
    }
  }, [value]);

  useLayoutEffect(() => {
    if (automaticLayoutRef.current !== "fit-content" || !containerRef.current) {
      return;
    }

    size.current.width = containerRef.current.getBoundingClientRect().width;
    editorRef.current?.layout(size.current);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          // istanbul ignore next: compatibility
          const newWidth = entry.contentBoxSize
            ? entry.contentBoxSize[0]
              ? entry.contentBoxSize[0].inlineSize
              : (entry.contentBoxSize as unknown as ResizeObserverSize)
                  .inlineSize
            : entry.contentRect.width;
          // istanbul ignore next: compatibility
          const newHeight = entry.contentBoxSize
            ? entry.contentBoxSize[0]
              ? entry.contentBoxSize[0].blockSize
              : (entry.contentBoxSize as unknown as ResizeObserverSize)
                  .blockSize
            : entry.contentRect.height;
          if (newWidth !== size.current.width || expanded) {
            size.current.width = newWidth;
            editorRef.current?.layout({
              width: newWidth,
              height: expanded ? newHeight : size.current.height,
            });
          }
          break;
        }
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [expanded]);

  useLayoutEffect(() => {
    if (automaticLayoutRef.current !== "fit-container") {
      return;
    }

    const container = getDOMContainer(containerRef.current);
    if (!container) {
      return;
    }
    // Manually layout the editor once the container resized.
    const observer = new ResizeObserver((entries): void => {
      for (const entry of entries) {
        if (entry.target === container) {
          // istanbul ignore next: compatibility
          const newWidth = entry.contentBoxSize
            ? entry.contentBoxSize[0]
              ? entry.contentBoxSize[0].inlineSize
              : (entry.contentBoxSize as unknown as ResizeObserverSize)
                  .inlineSize
            : entry.contentRect.width;
          setActualWidth(newWidth);

          // istanbul ignore next: compatibility
          const newHeight = entry.contentBoxSize
            ? entry.contentBoxSize[0]
              ? entry.contentBoxSize[0].blockSize
              : (entry.contentBoxSize as unknown as ResizeObserverSize)
                  .blockSize
            : entry.contentRect.height;
          setActualHeight(newHeight);
        }
      }
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (
      automaticLayoutRef.current !== "fit-container" &&
      automaticLayoutRef.current !== "fit-content"
    ) {
      setActualHeight(height);
    }
  }, [height]);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.updateOptions({
      readOnly,
      lineNumbersMinChars: expanded ? 5 : 3,
    });
  }, [readOnly, expanded]);

  useEffect(() => {
    if (editorRef.current || !containerRef.current) {
      return;
    }
    const model = monaco.editor.createModel(
      value,
      language,
      uri ? monaco.Uri.parse(uri) : undefined
    );
    let embeddedModel: monaco.editor.ITextModel | undefined;
    if (language === "brick_next_yaml") {
      // 注册嵌套的 model， language 为 js
      const embeddedUri = getEmbeddedJavascriptUri(model.uri);
      embeddedModel = monaco.editor.createModel(
        value,
        "javascript",
        embeddedUri
      );
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        getBrickYamlBuiltInDeclare(),
        model.uri.toString() + "d.ts"
      );
    }

    const editor = (editorRef.current = monaco.editor.create(
      containerRef.current,
      {
        extraEditorClassName: "monaco-editor-v3",
        model,
        minimap: {
          enabled: false,
          showRegionSectionHeaders: false,
          showMarkSectionHeaders: false,
        },
        scrollBeyondLastLine: false,
        tabSize: 2,
        insertSpaces: true,
        automaticLayout: automaticLayoutRef.current !== "fit-content",
        fontSize: EDITOR_FONT_SIZE,
        lineHeight: EDITOR_LINE_HEIGHT,
        scrollbar: {
          horizontalScrollbarSize: EDITOR_SCROLLBAR_SIZE,
          verticalScrollbarSize: EDITOR_SCROLLBAR_SIZE,
          horizontalSliderSize: 8,
          verticalSliderSize: 8,
          alwaysConsumeMouseWheel: false,
        },
        padding: {
          top: EDITOR_PADDING_VERTICAL,
          // When use `fit-content`, we always plus the height with the vertical padding.
          // Thus the possible x-scrollbar will not take extra space at the bottom.
          bottom:
            automaticLayoutRef.current == "fit-content"
              ? undefined
              : EDITOR_PADDING_VERTICAL,
        },
        overviewRulerBorder: false,
        mouseWheelScrollSensitivity: 0.5,
        fixedOverflowWidgets,
        lineNumbers: lineNumbers,
        lineNumbersMinChars: 3,
        glyphMargin,
        folding: lineNumbers !== "off",
        suggest: {
          insertMode: "insert",
          preview: true,
        },
        readOnly: readOnly,
        quickSuggestions: { strings: true, other: true, comments: true },
        renderLineHighlightOnlyWhenFocus: true,
        unicodeHighlight: {
          ambiguousCharacters: false,
        },
      }
    ));

    decorationsCollection.current =
      editorRef.current.createDecorationsCollection();

    switchEditor(editor);

    return () => {
      model.dispose();
      editor.dispose();
      embeddedModel?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const languageDefaults =
    language === "typescript" ? "typescriptDefaults" : "javascriptDefaults";

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    return () => {
      disposeEditor(editor);
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const setupLanguageService = () => {
      setExtraLibs(extraLibs, { languageDefaults });

      if (
        language === "javascript" ||
        language === "typescript" ||
        language === "brick_next_yaml"
      ) {
        monaco.languages.typescript[languageDefaults].setCompilerOptions({
          allowNonTsExtensions: true,
          lib: domLibsEnabled ? undefined : ["esnext"],
          target: monaco.languages.typescript.ScriptTarget.ESNext,
          module: monaco.languages.typescript.ModuleKind.ESNext,
          moduleResolution:
            monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          jsx: monaco.languages.typescript.JsxEmit.Preserve,
          skipLibCheck: true,
          skipDefaultLibCheck: true,
        });
      }
    };

    if (isCurrentEditor(editor)) {
      setupLanguageService();
    }

    const disposable = editor.onDidFocusEditorWidget(() => {
      // Set language service for this particular editor instance
      if (switchEditor(editor)) {
        setupLanguageService();
      }
    });
    return () => {
      disposable.dispose();
    };
  }, [domLibsEnabled, extraLibs, language, languageDefaults]);

  useEffect(() => {
    const editor = editorRef.current;
    if (language === "brick_next_yaml" && editor) {
      const model = editor.getModel()!;
      const editorMouseDownEvent = editor.onMouseDown(function (e) {
        const decorations = decorationsCollection.current;
        (decorations?.getRanges?.() ?? []).forEach((range) => {
          const modKey = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
            ? "metaKey"
            : "ctrlKey";
          if (
            range &&
            e.target.position &&
            e.event[modKey] &&
            range.containsPosition(e.target.position)
          ) {
            onTokenClick(model.getValueInRange(range));
          }
        });
      });

      const mouseOverEvent = editor.onMouseMove(function (e) {
        const decorations = decorationsCollection.current;
        if (!decorations) return;
        decorations.getRanges().forEach((range) => {
          const modKey = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
            ? "metaKey"
            : "ctrlKey";
          if (
            range &&
            e.target.position &&
            e.event[modKey] &&
            range.containsPosition(e.target.position)
          ) {
            const newDecorations = decorations.getRanges().map((item) => ({
              range: item,
              options: {
                inlineClassName: range.equalsRange(item)
                  ? "highlight pointer"
                  : "highlight",
              },
            }));
            decorations.set(newDecorations);
          } else if (!e.event[modKey]) {
            const newDecorations = decorations.getRanges().map((item) => ({
              range: item,
              options: {
                inlineClassName: "highlight",
              },
            }));
            decorations.set(newDecorations);
          }
        });
      });

      return () => {
        mouseOverEvent?.dispose();
        editorMouseDownEvent?.dispose();
      };
    }
  }, [language, onTokenClick, systemTheme, theme]);

  useEffect(() => {
    const editor = editorRef.current;
    if (
      !editor ||
      !containerRef.current ||
      automaticLayoutRef.current !== "fit-content"
    ) {
      return;
    }

    const listener = editor.onDidContentSizeChange((e) => {
      if (expanded) return;
      if (e.contentHeightChanged) {
        const newHeight = fixEditorHeightWithScrollBar(
          e.contentHeight,
          minLines,
          maxLines
        );
        if (newHeight !== size.current.height) {
          size.current.height = newHeight;
          editor.layout(size.current);
        }
      }
    });

    const newHeight = fixEditorHeightWithScrollBar(
      editor.getContentHeight(),
      minLines,
      maxLines
    );
    if (newHeight !== size.current.height) {
      size.current.height = newHeight;
      editor.layout(size.current);
    }

    return () => {
      listener.dispose();
    };
  }, [maxLines, minLines, expanded]);

  // istanbul ignore next
  const embeddedModelProcessor = useCallback(
    async (model: monaco.editor.IModel, position: monaco.Position) => {
      monaco.editor.setModelMarkers(model, "semantic_validate", []);

      const prefixEvaluateOperator = model.findPreviousMatch(
        "<%[~=]?",
        position,
        true,
        false,
        null,
        false
      );

      const suffixEvaluateOperator = model.findNextMatch(
        "%>",
        position,
        false,
        false,
        null,
        false
      );

      const prefixEvaluateRange = prefixEvaluateOperator?.range;
      const suffixEvaluateRange = suffixEvaluateOperator?.range;

      if (prefixEvaluateRange && suffixEvaluateRange) {
        const range = new monaco.Range(
          prefixEvaluateRange.startLineNumber,
          prefixEvaluateRange.endColumn,
          suffixEvaluateRange.startLineNumber,
          suffixEvaluateRange.startColumn
        );

        const content = model.getValueInRange(range);
        if (range.containsPosition(position!) && !/<% | %>/.test(content)) {
          const newUri = getEmbeddedJavascriptUri(model.uri);
          const embeddedModel = monaco.editor.getModel(newUri);

          embeddedModel!.setValue(content);
          const offset = model.getOffsetAt(
            new monaco.Position(
              prefixEvaluateRange.startLineNumber,
              prefixEvaluateRange.endColumn
            )
          );

          const embeddedContext = EmbeddedModelContext.getInstance(workerId);

          embeddedContext.updateState({ content, range, offset });

          if (!customValidationInBrickNextYaml) return;

          const getWorker =
            await monaco.languages.typescript.getJavaScriptWorker();

          const worker = await getWorker(newUri);

          const diagnostics = await worker.getSemanticDiagnostics(
            newUri.toString()
          );

          const semanticMarkers = diagnostics.map((item) => {
            const finalOffset = offset + (item.start ?? 0);
            const currentPosition = model.getPositionAt(finalOffset);

            return {
              startLineNumber: currentPosition.lineNumber,
              startColumn: currentPosition.column,
              endLineNumber: currentPosition.lineNumber,
              endColumn: currentPosition.column + item.length!,
              message: item.messageText as string,
              severity: monaco.MarkerSeverity.Warning,
            };
          });

          monaco.editor.setModelMarkers(
            model,
            "semantic_validate",
            semanticMarkers
          );
        }
      }
    },
    [workerId]
  );

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    const currentModel = editorRef.current.getModel()!;
    const listener = currentModel.onDidChangeContent(async (e) => {
      setEditorId(workerId);

      if (["brick_next_yaml"].includes(language)) {
        embeddedModelProcessor(currentModel, editorRef.current!.getPosition()!);
        // debounceParse();
      }
      if (!e.isFlush) {
        onChange(currentModel.getValue());
      }
    });
    return () => {
      listener.dispose();
    };
  }, [
    /* debounceParse, */ onChange,
    workerId,
    language,
    embeddedModelProcessor,
  ]);

  useEffect(() => {
    if (expanded) {
      const fn = (e: KeyboardEvent): void => {
        if (e.key === "Escape" || e.key === "Esc") {
          window.removeEventListener("keydown", fn);
          setExpanded(false);
        }
      };
      window.addEventListener("keydown", fn);
      return () => {
        window.removeEventListener("keydown", fn);
      };
    }
  }, [expanded]);

  useEffect(() => {
    if (!editorRef.current && !placeholder) return;
    const placeholderWidget = new PlaceholderContentWidget(
      placeholder!,
      editorRef.current!,
      isDarkTheme ? "rgba(174,174,175,0.4)" : "rgba(89,89,89,0.4)"
    );

    return () => {
      placeholderWidget.dispose();
    };
  }, [placeholder, isDarkTheme]);

  const handleCopyIconClick = useCallback(() => {
    if (editorRef.current) {
      const currentModel = editorRef.current.getModel()!;
      copyToClipboard(currentModel.getValue())
        .then(() =>
          showNotification({ type: "success", message: t(K.COPY_SUCCESS) })
        )
        .catch(() =>
          showNotification({ type: "error", message: t(K.COPY_FAILED) })
        );
    }
  }, [t]);

  const handleExpandedClick = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  // istanbul ignore next
  useEffect(() => {
    const editor = editorRef.current;
    if (!(editor && language === "brick_next_yaml")) {
      return;
    }

    let ignore = false;
    const handleChange = async () => {
      const worker = await getRemoteYamlLinterWorker();
      if (ignore) {
        return;
      }
      const { lintMarkers, lintDecorations } = await worker.lint({
        source: editor.getValue(),
        links,
        markers,
      });
      const model = editor.getModel();
      if (ignore || !model) {
        return;
      }
      monaco.editor.setModelMarkers(
        model,
        BRICK_NEXT_YAML_LINT,
        lintMarkers.map(({ start, end, message, severity, code }) => {
          const startPos = model.getPositionAt(start);
          const endPos = model.getPositionAt(end);
          return {
            startLineNumber: startPos.lineNumber,
            startColumn: startPos.column,
            endLineNumber: endPos.lineNumber,
            endColumn: endPos.column,
            severity: monaco.MarkerSeverity[severity],
            message,
            code: code as monaco.editor.IMarkerData["code"],
          };
        })
      );
      decorationsCollection.current?.set(
        lintDecorations.map(({ start, end, options }) => ({
          range: monaco.Range.fromPositions(
            model.getPositionAt(start),
            model.getPositionAt(end)
          ),
          options,
        }))
      );
    };
    const debounceChange = debounce(handleChange, 200);
    const change = editor.onDidChangeModelContent(debounceChange);
    debounceChange();

    return () => {
      ignore = true;
      change.dispose();
      monaco.editor.setModelMarkers(
        editor.getModel()!,
        BRICK_NEXT_YAML_LINT,
        []
      );
    };
  }, [language, links, markers, theme, workerId]);

  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (!model || !extraMarkers?.length) {
      return;
    }
    monaco.editor.setModelMarkers(
      model,
      EXTRA_MARKERS,
      extraMarkers.map(({ severity, ...rest }) => ({
        ...rest,
        severity: monaco.MarkerSeverity[severity],
      }))
    );
    return () => {
      monaco.editor.setModelMarkers(model, EXTRA_MARKERS, []);
    };
  }, [extraMarkers]);

  // istanbul ignore next
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !spellCheck) {
      return;
    }

    let ignore = false;
    const handleChange = async () => {
      const worker = await getRemoteSpellCheckWorker();
      if (ignore) {
        return;
      }
      const { markers: spellCheckMarkers } = await worker.spellCheck({
        source: editor.getValue(),
        knownWords,
      });
      const model = editor.getModel();
      if (ignore || !model) {
        return;
      }
      monaco.editor.setModelMarkers(
        model,
        SPELL_CHECK,
        spellCheckMarkers.map(({ start, end, message, severity }) => {
          const startPos = model.getPositionAt(start);
          const endPos = model.getPositionAt(end);
          return {
            startLineNumber: startPos.lineNumber,
            startColumn: startPos.column,
            endLineNumber: endPos.lineNumber,
            endColumn: endPos.column,
            severity: monaco.MarkerSeverity[severity],
            message,
          };
        })
      );
    };
    const debounceChange = debounce(handleChange, 200);
    const change = editor.onDidChangeModelContent(debounceChange);
    debounceChange();

    return () => {
      ignore = true;
      change.dispose();
      monaco.editor.setModelMarkers(editor.getModel()!, SPELL_CHECK, []);
    };
  }, [spellCheck, knownWords]);

  return (
    <div
      className={classNames("code-editor-wrapper", {
        expanded,
        error: validateState === "error",
      })}
    >
      <div
        ref={containerRef}
        style={{
          height: expanded ? "100%" : actualHeight,
          width: expanded ? "100%" : actualWidth,
          overflow: expanded ? "scroll" : "",
        }}
      />
      <div className="toolbar-wrapper">
        <div className="toolbar sticky">
          {showCopyButton && (
            <WrappedTooltip content={t(K.COPY) as string}>
              <WrappedIcon
                className="copy-icon"
                icon="copy"
                lib="antd"
                theme="outlined"
                onClick={handleCopyIconClick}
              />
            </WrappedTooltip>
          )}
          {showExpandButton && (
            <WrappedTooltip
              content={(expanded ? t(K.COLLAPSE) : t(K.EXPAND)) as string}
            >
              <WrappedIcon
                className="expand-icon"
                icon={expanded ? "compress" : "expand"}
                lib="antd"
                theme="outlined"
                onClick={handleExpandedClick}
              />
            </WrappedTooltip>
          )}
        </div>
      </div>
    </div>
  );
}

function getContentHeightByCode(
  code: string,
  minLines: number,
  maxLines: number
): number {
  return getContentHeightByLines(
    Math.min(maxLines, Math.max(minLines, code.split("\n").length))
  );
}

function fixEditorHeightWithScrollBar(
  contentHeight: number,
  minLines: number,
  maxLines: number
): number {
  let fixedHeight = contentHeight;
  if ((contentHeight - EDITOR_PADDING_VERTICAL) % EDITOR_LINE_HEIGHT === 0) {
    fixedHeight = contentHeight + EDITOR_SCROLLBAR_SIZE;
  }
  return Math.min(
    getContentHeightByLines(maxLines),
    Math.max(fixedHeight, getContentHeightByLines(minLines))
  );
}

function getContentHeightByLines(lines: number): number {
  return (
    lines * EDITOR_LINE_HEIGHT + EDITOR_SCROLLBAR_SIZE + EDITOR_PADDING_VERTICAL
  );
}

/** Get the direct DOM container of `vs.code-editor` */
function getDOMContainer(element: HTMLElement | null) {
  let brick = element;
  while (brick) {
    const found = brick.tagName.toLowerCase() === "vs.code-editor";
    brick = brick.parentElement;
    if (found) {
      return brick;
    }
  }
}
