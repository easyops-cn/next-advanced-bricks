/* eslint-disable no-console */
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
import { FormItemElementBase } from "@next-shared/form";
import type { FormItem, FormItemProps } from "@next-bricks/form/form-item";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import { register as registerJavaScript } from "@next-core/monaco-contributions/javascript";
import { register as registerTypeScript } from "@next-core/monaco-contributions/typescript";
import { register as registerYaml } from "@next-core/monaco-contributions/yaml";
import { register as registerHtml } from "@next-core/monaco-contributions/html";
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
  type MixedCompleter,
} from "./interfaces.js";
import { brickNextYAMLProviderCompletionItems } from "./utils/brickNextYaml.js";
import { Level } from "./utils/constants.js";
import { setEditorId } from "./utils/editorId.js";
import {
  getEmbeddedJavascriptUri,
  getBrickYamlBuiltInDeclare,
} from "./utils/jsSuggestInBrickYaml.js";
import { addExtraLibs } from "./utils/addExtraLibs.js";
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

initializeReactI18n(NS, locales);

registerJavaScript(monaco);
registerTypeScript(monaco);
registerYaml(monaco, "brick_next_yaml");
registerHtml(monaco);
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

monaco.languages.registerInlineCompletionsProvider("typescript", {
  async provideInlineCompletions(model, position, context, token) {
    console.log("Try to provide inline completions");
    const nearby = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: position.column - 2,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    if (token.isCancellationRequested) {
      console.log("isCancellationRequested");
      return;
    }

    token.onCancellationRequested(() => {
      console.log("onCancellationRequested");
    });

    if (nearby === "  ") {
      console.log("oops");
      return {
        items: [
          {
            insertText: `if (!groups) {
    return undefined;
  }

  return groups.filter(group => {
    const presentMetrics = group.metrics.filter(metric => metricSets.has(metric));
    return presentMetrics.length > 1;
  });`,
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
          },
        ],
      };
    }

    console.log("missed");
    return;
  },
  freeInlineCompletions() {
    // noop
    console.log("freeInlineCompletions");
  },
});

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
}

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

/**
 * 构件代码编辑器
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
  @property()
  accessor name: string | undefined;

  @property()
  accessor label: string | undefined;

  @property()
  accessor value: string | undefined;

  /**
   * @default "plaintext"
   */
  @property()
  accessor language: string | undefined;

  /**
   * 主题，支持 `"auto" | "vs" | "vs-dark"`
   *
   * @default "auto"
   * @group ui
   */
  @property() accessor theme: string | undefined;

  @property({
    type: Boolean,
  })
  accessor required: boolean | undefined;

  @property({
    type: Boolean,
  })
  accessor readOnly: boolean | undefined;

  @property()
  accessor automaticLayout:
    | "fit-container"
    | "fit-content"
    | "none"
    | undefined;

  /**
   * @default 3
   */
  @property({ type: Number })
  accessor minLines: number | undefined;

  /**
   * 仅对 language 为 brick_next_yaml 有效，设置第一层属性名的自动补全。
   */
  @property({
    attribute: false,
  })
  accessor completers: monaco.languages.CompletionItem[] | undefined;

  /**
   * 高级自动补全配置。
   * - 设置为键值对时，仅对 language 为 brick_next_yaml 有效，设置任意的自动补全；
   * - 设置为数组时，当前仅对 language 为 cel 有效。
   * 未来将统一改为数组格式，废弃键值对格式的配置。
   */
  @property({
    attribute: false,
  })
  accessor advancedCompleters:
    | AdvancedCompleterMap
    | MixedCompleter[]
    | undefined;

  @property({ attribute: false })
  accessor markers: Marker[] | undefined;

  @property({ attribute: false })
  accessor links: string[] | undefined;

  /**
   * @default Infinity
   */
  @property({ type: Number })
  accessor maxLines: number | undefined;

  @property({ attribute: false })
  accessor height: string | number | undefined;

  @property()
  accessor message: string | undefined;

  @property()
  accessor placeholder: string | undefined;

  /**
   * 是否展示展开按钮
   */
  @property({ type: Boolean })
  accessor showExpandButton: boolean | undefined;

  /**
   * 行数配置
   */
  @property()
  accessor lineNumbers: monaco.editor.LineNumbersType | undefined;

  /**
   * 自定义高亮配置
   */
  @property({
    attribute: false,
  })
  accessor tokenConfig: TokenConfig | undefined;

  /**
   * 在 brick_next_yaml 中是否开启语义相关校验
   * @default false
   */
  @property({
    type: Boolean,
  })
  accessor customValidationInBrickNextYaml: boolean | undefined;

  /**
   * 是否展示复制按钮
   * @default true
   */
  @property({ type: Boolean })
  accessor showCopyButton: boolean | undefined;

  /**
   * 显示字形边距
   * @default false
   */
  @property({ type: Boolean })
  accessor glyphMargin: boolean | undefined;

  /**
   * 额外声明的 lib 库
   */
  @property({
    attribute: false,
  })
  accessor extraLibs: ExtraLib[] | undefined;

  /**
   * @default true
   */
  @property({ type: Boolean })
  accessor fixedOverflowWidgets: boolean | undefined;

  /**
   * 是否启用英语拼写检查
   * @default true
   */
  @property({ type: Boolean })
  accessor spellCheck: boolean | undefined;

  /**
   * 启用英语拼写检查时，除系统设置的词汇表外，指定其他的已知单词（小写）。
   */
  @property({ attribute: false })
  accessor knownWords: string[] | undefined;

  /**
   * 是否启用 DOM 相关接口的自动提示。
   */
  @property({ type: Boolean })
  accessor domLibsEnabled: boolean | undefined;

  @event({ type: "code.change" })
  accessor #codeChange!: EventEmitter<string>;

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
  const [actualHeight, setActualHeight] = useState<string | number>();
  // `automaticLayout` should never change
  const automaticLayoutRef = useRef(automaticLayout);
  const systemTheme = useCurrentTheme();

  const computedTheme =
    theme === "auto"
      ? systemTheme === "dark" || systemTheme === "dark-v2"
        ? "vs-dark"
        : "vs"
      : theme;
  const isDarkTheme =
    computedTheme === "vs-dark" || computedTheme === "hc-black";

  useEffect(() => {
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
    if (editorRef.current) {
      const currentModel = editorRef.current.getModel()!;
      monaco.editor.setModelLanguage(currentModel, language);
    }
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
    const observer = new ResizeObserver((): void => {
      setActualHeight(container.offsetHeight);
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
    const model = monaco.editor.createModel(value, language);
    if (language === "brick_next_yaml") {
      // 注册嵌套的 model， language 为 js
      const uri = getEmbeddedJavascriptUri(model.uri);
      monaco.editor.createModel(value, "javascript", uri);
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        getBrickYamlBuiltInDeclare(),
        model.uri.toString() + "d.ts"
      );
    }

    editorRef.current = monaco.editor.create(containerRef.current, {
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
    });

    decorationsCollection.current =
      editorRef.current.createDecorationsCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const languageDefaults =
    language === "typescript" ? "typescriptDefaults" : "javascriptDefaults";

  useEffect(() => {
    const libs: ExtraLib[] = extraLibs ?? [];

    const disposables = addExtraLibs(libs, {
      languageDefaults,
    });
    return () => {
      for (const item of disposables) {
        item.dispose();
      }
    };
  }, [extraLibs, language, languageDefaults]);

  useEffect(() => {
    if (
      language === "javascript" ||
      language === "typescript" ||
      language === "brick_next_yaml"
    ) {
      monaco.languages.typescript[languageDefaults].setCompilerOptions({
        allowNonTsExtensions: true,
        lib: domLibsEnabled ? undefined : ["esnext"],
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        moduleResolution:
          monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      });
    }
  }, [language, domLibsEnabled, languageDefaults]);

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
    return () => {
      editorRef.current?.getModel()?.dispose();
      editorRef.current?.dispose();
    };
  }, []);

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
