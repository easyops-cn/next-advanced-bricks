构件 `ai-portal.chat-panel`

## 介绍

弹出式 AI 对话面板，提供一个模态框样式的聊天界面，支持与 AI 助手进行对话交互。

## Examples

### Basic

```yaml preview
- brick: eo-button
  properties:
    themeVariant: elevo
    textContent: 打开对话面板
  events:
    click:
      target: "#chatPanel"
      method: open
- brick: ai-portal.chat-panel
  properties:
    id: chatPanel
    width: 600
    height: 800
    panelTitle: AI 助手
    placeholder: 请输入您的问题...
```
