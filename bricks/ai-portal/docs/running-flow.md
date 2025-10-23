构件 `ai-portal.running-flow`

## Examples

### Basic

```yaml preview
brick: ai-portal.running-flow
properties:
  spec:
    - name: Requirement
      serviceFlowActivities:
        - name: Requirement collects
          state: completed
        - name: Requirement documents
          state: input-required
    - name: Sprint Planning
      serviceFlowActivities:
        - name: planning
          state: working
        - name: sprinting
```
