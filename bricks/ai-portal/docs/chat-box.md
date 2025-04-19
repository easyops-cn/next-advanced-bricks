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
  - name: task
children:
  - brick: ai-portal.chat-box
    if: <%= !CTX.task %>
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
        useProvider: basic.http-request
        args:
          # - /api/mocks/task/send
          # - "http://localhost:8888/.netlify/functions/task-send"
          - "https://serverless-mocks.netlify.app/.netlify/functions/task-send"
          - method: POST
            body: |
              <%
                JSON.stringify({
                  requirement: EVENT.detail
                })
              %>
            headers:
              Content-Type: application/json
        callback:
          error:
            action: handleHttpError
          success:
            action: context.replace
            args:
              - task
              - <% EVENT.detail %>
  - brick: ai-portal.cruise-canvas
    if: <%= !!CTX.task %>
    properties:
      taskId: <% CTX.task.id %>
```
