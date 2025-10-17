构件 `ai-portal.stage-flow`

## Examples

### Basic

```yaml preview
brick: ai-portal.home-container
children:
  - brick: ai-portal.flow-tabs
    properties:
      tabs:
        - id: foo
          label: Fooooo
        - id: bar
          label: Baaaaar
        - id: baz
          label: Baaaaaz
      activeTab: foo
    children:
      - brick: ai-portal.stage-flow
        properties:
          spec:
            - name: Requirement
              serviceFlowActivities:
                - name: Requirement collects
                  aiEmployeeId: Samuel
                - name: Requirement documents
                  aiEmployeeId: Samuel
            - name: Sprint Planning
            # - name: Development
```
