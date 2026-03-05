---
tagName: vs.code-editor
displayName: WrappedVsCodeEditor
description: 基于 Monaco Editor 的代码编辑器构件，支持多种编程语言（typescript、yaml、brick_next_yaml、cel 等）的语法高亮与自动补全，支持作为表单项使用，支持自动布局、拼写检查、Lint 校验、标记高亮等高级功能。
category: form-input-advanced
source: "@next-bricks/vs"
---

# WrappedVsCodeEditor

> 基于 Monaco Editor 的代码编辑器构件，支持多种编程语言（typescript、yaml、brick_next_yaml、cel 等）的语法高亮与自动补全，支持作为表单项使用，支持自动布局、拼写检查、Lint 校验、标记高亮等高级功能。

## 导入

```tsx
import { WrappedVsCodeEditor } from "@easyops/wrapped-components";
```

## Props

| 属性                            | 类型                                                      | 必填 | 默认值        | 说明                                                                                                                                                                                         |
| ------------------------------- | --------------------------------------------------------- | ---- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name                            | `string \| undefined`                                     | -    | -             | 表单字段名，用于在表单提交时标识该字段。                                                                                                                                                     |
| label                           | `string \| undefined`                                     | -    | -             | 表单字段标签，显示在编辑器上方作为说明文字。                                                                                                                                                 |
| value                           | `string \| undefined`                                     | -    | -             | 编辑器的当前值（代码文本内容）。                                                                                                                                                             |
| language                        | `string \| undefined`                                     | -    | `"plaintext"` | 编辑器的编程语言，决定语法高亮和自动补全行为，支持 `typescript`、`javascript`、`yaml`、`brick_next_yaml`、`cel`、`cel_yaml`、`cel_str` 等。                                                  |
| theme                           | `string \| undefined`                                     | -    | `"auto"`      | 编辑器主题，`auto` 跟随系统主题自动切换，`vs` 为亮色，`vs-dark` 为暗色。                                                                                                                     |
| placeholder                     | `string \| undefined`                                     | -    | -             | 编辑器为空时显示的占位提示文字。                                                                                                                                                             |
| required                        | `boolean \| undefined`                                    | -    | -             | 是否为表单必填项，启用后表单提交时会校验该字段不能为空。                                                                                                                                     |
| readOnly                        | `boolean \| undefined`                                    | -    | -             | 是否为只读模式，启用后用户无法编辑代码内容。                                                                                                                                                 |
| automaticLayout                 | `"fit-container" \| "fit-content" \| "none" \| undefined` | -    | -             | 自动布局模式：`fit-content` 根据内容高度自动调整编辑器高度（由 `minLines`/`maxLines` 控制范围），`fit-container` 自动填满父容器尺寸，`none` 不自动调整。                                     |
| minLines                        | `number \| undefined`                                     | -    | `3`           | 编辑器最小行数，与 `automaticLayout: "fit-content"` 配合使用，控制编辑器的最小显示高度。                                                                                                     |
| maxLines                        | `number \| undefined`                                     | -    | `Infinity`    | 编辑器最大行数，与 `automaticLayout: "fit-content"` 配合使用，控制编辑器的最大显示高度（超出后出现滚动条）。                                                                                 |
| height                          | `string \| number \| undefined`                           | -    | -             | 固定高度（像素或 CSS 字符串），当 `automaticLayout` 不为 `fit-content` 时生效。                                                                                                              |
| completers                      | `monaco.languages.CompletionItem[] \| undefined`          | -    | -             | 仅对 language 为 brick_next_yaml 有效，设置第一层属性名的自动补全。                                                                                                                          |
| advancedCompleters              | `AdvancedCompleterMap \| MixedCompleter[] \| undefined`   | -    | -             | 高级自动补全配置。设置为键值对时仅对 language 为 brick_next_yaml 有效，设置任意路径的自动补全；设置为数组时当前仅对 language 为 cel 等系列语言有效。未来将统一改为数组格式，废弃键值对格式。 |
| markers                         | `Marker[] \| undefined`                                   | -    | -             | 标记配置，用于在编辑器中对指定 token 进行高亮标注，并可关联错误/警告级别与提示信息，仅对 language 为 brick_next_yaml 有效。                                                                  |
| links                           | `string[] \| undefined`                                   | -    | -             | 可点击链接的命名空间列表，在 language 为 brick_next_yaml 时，按住 Ctrl/Cmd 点击这些关键字可触发 `onTokenClick` 事件。                                                                        |
| showExpandButton                | `boolean \| undefined`                                    | -    | -             | 是否展示展开/收起按钮，点击后编辑器全屏展开，按 Esc 键收起。                                                                                                                                 |
| showCopyButton                  | `boolean \| undefined`                                    | -    | `true`        | 是否展示复制按钮，点击后将编辑器内容复制到剪贴板。                                                                                                                                           |
| lineNumbers                     | `monaco.editor.LineNumbersType \| undefined`              | -    | -             | 行号显示模式，`on` 显示行号，`off` 隐藏行号，也可传入函数自定义行号格式。                                                                                                                    |
| tokenConfig                     | `TokenConfig \| undefined`                                | -    | -             | 自定义高亮配置，目前支持 `showDSKey` 选项，在 brick_next_yaml 中控制是否对 DS（数据源）相关的 key 进行高亮显示。                                                                             |
| customValidationInBrickNextYaml | `boolean \| undefined`                                    | -    | `false`       | 在 brick_next_yaml 中是否开启嵌入 JavaScript 的语义相关校验（TypeScript 类型检查）。                                                                                                         |
| glyphMargin                     | `boolean \| undefined`                                    | -    | `false`       | 是否显示字形边距（Glyph Margin），启用后在行号左侧留出额外空间，可用于显示调试断点等装饰器。                                                                                                 |
| extraLibs                       | `ExtraLib[] \| undefined`                                 | -    | -             | 额外声明的 TypeScript/JavaScript lib 库，用于在 javascript/typescript/brick_next_yaml 中提供自定义类型声明和自动补全提示。                                                                   |
| extraMarkers                    | `ExtraMarker[] \| undefined`                              | -    | -             | 额外的编辑器标记（Marker），可在指定位置显示错误/警告/信息级别的诊断提示，与 `markers` 不同，支持通过行列坐标精确定位。                                                                      |
| fixedOverflowWidgets            | `boolean \| undefined`                                    | -    | `true`        | 是否将编辑器的悬浮提示（如自动补全下拉框、悬停文档等）渲染到 body 层，避免被父容器 overflow 裁剪。                                                                                           |
| spellCheck                      | `boolean \| undefined`                                    | -    | `true`        | 是否启用英语拼写检查，启用后会对代码中的英文单词进行拼写校验并标注错误。                                                                                                                     |
| knownWords                      | `string[] \| undefined`                                   | -    | -             | 启用拼写检查时，在系统词汇表之外额外指定的已知单词列表（全小写），这些单词不会被标记为拼写错误。                                                                                             |
| domLibsEnabled                  | `boolean \| undefined`                                    | -    | -             | 是否启用 DOM 相关接口的 TypeScript 自动提示（lib: ["dom"]），启用后在 javascript/typescript 中可获得浏览器 DOM API 的类型声明。                                                              |
| uri                             | `string \| undefined`                                     | -    | -             | 编辑器模型的 URI 标识符，用于区分同一语言下的不同编辑器实例，影响 TypeScript/JavaScript 语言服务的作用域隔离。                                                                               |
| message                         | `string \| undefined`                                     | -    | -             | 表单字段自定义校验提示信息。                                                                                                                                                                 |
| onCodeChange                    | `(e: CustomEvent<string>) => void`                        | -    | -             | 编辑器内容发生变化时触发（仅用户主动编辑触发，setValue 等程序调用不触发）。                                                                                                                  |
| onUserInput                     | `(e: CustomEvent<any>) => void`                           | -    | -             | 用户在编辑器中输入时触发。                                                                                                                                                                   |
| onTokenClick                    | `(e: CustomEvent<string>) => void`                        | -    | -             | 在 language 为 brick_next_yaml 时，用户按住 Ctrl/Cmd 键点击 `links` 中配置的关键字时触发。                                                                                                   |

## Events

| 事件         | detail                                                            | 说明                                                                                       |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| onCodeChange | `string` — 当前编辑器的完整代码文本                               | 编辑器内容发生变化时触发（仅用户主动编辑触发，setValue 等程序调用不触发）。                |
| onUserInput  | `any` — 用户输入的内容                                            | 用户在编辑器中输入时触发。                                                                 |
| onTokenClick | `string` — 被点击的 token 文本（如 `CTX`、`FN` 等命名空间关键字） | 在 language 为 brick_next_yaml 时，用户按住 Ctrl/Cmd 键点击 `links` 中配置的关键字时触发。 |

## Examples

### Basic

展示基本的 TypeScript 代码编辑器用法，内置语法高亮和自动补全。

```tsx
import { WrappedVsCodeEditor } from "@easyops/wrapped-components";

function BasicEditor() {
  return (
    <WrappedVsCodeEditor
      language="typescript"
      value={`function sayHello(): string {\n  return "hello";\n}`}
    />
  );
}
```

### Automatic Layout - fit-content

`automaticLayout: fit-content` 模式下编辑器高度随内容自动伸缩，适合嵌入表单或卡片中使用。

```tsx
import { WrappedVsCodeEditor } from "@easyops/wrapped-components";

function FitContentEditor() {
  return (
    <WrappedVsCodeEditor
      automaticLayout="fit-content"
      language="typescript"
      value={`function sayHello(): string {\n  return "hello";\n}`}
    />
  );
}
```

### Automatic Layout - fit-container

`automaticLayout: fit-container` 模式下编辑器自动填满父容器尺寸，适合固定高度布局场景。

```tsx
import { WrappedVsCodeEditor } from "@easyops/wrapped-components";

function FitContainerEditor() {
  return (
    <div style={{ height: 200 }}>
      <WrappedVsCodeEditor
        automaticLayout="fit-container"
        language="typescript"
        value={`function sayHello(): string {\n  return "hello";\n}`}
      />
    </div>
  );
}
```

### Placeholder

展示编辑器为空时的占位提示文字。

```tsx
import { WrappedVsCodeEditor } from "@easyops/wrapped-components";

function PlaceholderEditor() {
  return (
    <div style={{ height: 200 }}>
      <WrappedVsCodeEditor
        language="typescript"
        placeholder={"Hello World~\nTry to enter something!"}
      />
    </div>
  );
}
```

### Brick Next YAML

展示 `brick_next_yaml` 语言模式，支持表达式语法高亮（`<% ... %>`）和 YAML Lint 校验。

```tsx
import { WrappedVsCodeEditor } from "@easyops/wrapped-components";

function BrickNextYamlEditor() {
  return (
    <div>
      <WrappedVsCodeEditor
        language="brick_next_yaml"
        value={`# Enhanced yaml for Brick Next\nbrick: button\nproperties:\n  textContent: '<% CTX.error ? "CTX.error": "Hello" %>'`}
        automaticLayout="fit-content"
      />
      <WrappedVsCodeEditor
        language="yaml"
        value={`# Normal yaml\nbrick: button\nproperties:\n  textContent: '<% CTX.error ? "Oops": "Hello" %>'`}
        automaticLayout="fit-content"
        style={{ marginTop: "2em" }}
      />
    </div>
  );
}
```

### Brick Next YAML with Highlight

展示 `brick_next_yaml` 模式的高级功能：使用 `markers` 对命名空间 token 进行高亮标注，使用 `links` 配置可点击链接，使用 `extraLibs` 提供自定义类型声明，通过 `onTokenClick` 事件响应用户点击。

```tsx
import { WrappedVsCodeEditor } from "@easyops/wrapped-components";

const commonMarkers = [
  { token: "PATH", message: "这是 PATH", level: "hit" },
  { token: "QUERY", message: "这是 QUERY", level: "info" },
  { token: "ANCHOR", message: "这是 ANCHOR", level: "warn" },
  {
    token: "STATE",
    message: "这里不能写 STATE",
    level: "error",
    code: {
      value: "详情地址",
      target: "https://brick-next.js.org/docs/concepts/context",
    },
  },
  { token: "TPL", level: "warn", message: "不允许写入TPL" },
];

const commonLibs = [
  {
    filePath: "base.d.ts",
    content: `declare namespace CTX {\n  const pageTitle: string;\n  const name: string;\n  const a;\n  const b;\n};\ndeclare namespace FN {\n  function getPageDetail();\n  function getInstance();\n};\ndeclare namespace PATH {\n  const instanceId: string;\n  const name: string;\n};\ndeclare namespace QUERY {\n  const activeId: string;\n}`,
  },
];

function HighlightEditor() {
  return (
    <WrappedVsCodeEditor
      language="brick_next_yaml"
      value={`basicUsage:\n  keyword:\n   Expression:\n    expression1: <% CTX.work %>\n    expression2: <% \`\${CTX.work}\` %>`}
      automaticLayout="fit-content"
      links={["CTX", "FN"]}
      completers={[
        { label: "buttonName", detail: "string" } as any,
        { label: "buttonType", detail: "primary|default|link|danger" } as any,
      ]}
      advancedCompleters={{
        target: {
          triggerCharacter: ":",
          completers: [{ label: "a" }, { label: "b" }],
        },
      }}
      markers={commonMarkers}
      extraLibs={commonLibs}
      onTokenClick={(e) => console.log(e.detail)}
    />
  );
}
```

### Form Integration

展示在表单中使用代码编辑器，配置 `name`、`label`、`required` 等表单字段属性，并配合 `showExpandButton`、`tokenConfig` 等高级功能。

```tsx
import {
  WrappedVsCodeEditor,
  WrappedEoForm,
  WrappedEoSubmitButtons,
} from "@easyops/wrapped-components";

function FormEditor() {
  return (
    <WrappedEoForm
      values={{ code: "a: <% CTX.DS.a %>\nb: <% CTX.DS.c %>\nc: <% CTX.a %>" }}
      onValidateSuccess={(e) => console.log(e.detail)}
    >
      <WrappedVsCodeEditor
        name="code"
        label="code"
        required={true}
        language="brick_next_yaml"
        showExpandButton={true}
        automaticLayout="fit-content"
        links={["CTX", "CTX.DS", "DS"]}
        tokenConfig={{ showDSKey: true }}
        markers={[
          { token: "CTX", params: ["a", "DS"] },
          { token: "CTX.DS", params: ["a", "b"] },
          { token: "DS", params: ["a", "b"] },
        ]}
        extraLibs={[
          {
            filePath: "common.d.ts",
            content: `declare namespace CTX {\n  const a;\n  namespace DS {\n    const a;\n    const b;\n  };\n};\ndeclare namespace PATH {\n  const instanceId: string;\n};\ndeclare namespace QUERY {\n  const index: number;\n};`,
          },
        ]}
        onTokenClick={(e) => console.log(e.detail)}
      />
      <WrappedEoSubmitButtons />
    </WrappedEoForm>
  );
}
```

### CEL

展示 CEL（Common Expression Language）语言系列的编辑器，支持 `cel`、`cel_str`、`cel_yaml` 三种模式及高级自动补全。

```tsx
import {
  WrappedVsCodeEditor,
  WrappedEoContentLayout,
} from "@easyops/wrapped-components";

const advancedCompleters = [
  {
    type: "members",
    members: {
      step: ["firstStep", "lastStep"],
    },
  },
];

function CelEditor() {
  return (
    <WrappedEoContentLayout>
      <WrappedVsCodeEditor
        theme="auto"
        language="cel"
        automaticLayout="fit-content"
        advancedCompleters={advancedCompleters}
        value={"// Pure CEL\nhas(abc)"}
      />
      <WrappedVsCodeEditor
        theme="auto"
        language="cel_str"
        automaticLayout="fit-content"
        advancedCompleters={advancedCompleters}
        value={"<%\n`${'<'}%\n  // CEL with wrapper\n  has(abc)\n%${'>'}`\n%>"}
      />
      <WrappedVsCodeEditor
        theme="auto"
        language="cel_yaml"
        automaticLayout="fit-content"
        advancedCompleters={advancedCompleters}
        value={
          "<%\n`# CEL in YAML\nname: |\n  ${'<'}%\n    has(abc)\n  %${'>'}\n`\n%>"
        }
      />
    </WrappedEoContentLayout>
  );
}
```
