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
context:
- name: requirement
children:
- brick: ai-portal.chat-box
  if: <%= !CTX.requirement %>
  properties:
    style:
      position: absolute
      width: 500px
      maxWidth: 90vw
      maxHeight: 90vh
      top: 50%
      left: 50%
      transform: translate(-50%, -50%)
  events:
    message.submit:
      action: context.replace
      args:
      - requirement
      - <% EVENT.detail %>
- brick: ai-portal.cruise-canvas
  if: <%= !!CTX.requirement %>
  properties:
    runId: mock-run-id
    requirement: <% CTX.requirement %>
```
