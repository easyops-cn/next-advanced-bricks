构件 `ai-portal.action-buttons`

## Examples

### Basic

```yaml preview
brick: ai-portal.chat-box
children:
  - brick: ai-portal.action-buttons
    properties:
      items:
        - key: think
          text: 深度思考
          icon:
            - lib: antd
              theme: outlined
              icon: reddit
        - key: networking
          text: 联网搜索
          icon:
            lib: antd
            theme: outlined
            icon: global
    slot: actions
```
