构件 `ai-portal.chat-box`

## Examples

### Basic

```yaml preview
brick: ai-portal.chat-box
properties:
  textContent: Hello world
```

### With cruise canvas


```yaml preview minHeight="600px"
brick: div
properties:
  style:
    width: 100vw
    height: 100vh
    position: fixed
    top: 0
    left: 0
children:
- brick: ai-portal.cruise-canvas
  properties:
    runId: mock-run-id
    requirement: 帮我在CMDB中完成手机银行系统的资源纳管
```
