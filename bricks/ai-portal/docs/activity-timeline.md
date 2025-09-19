构件 `ai-portal.activity-timeline`

## Examples

### Basic

```yaml preview
brick: ai-portal.activity-timeline
properties:
  list:
    - user_id: u001
      user_name: Tom
      action_type: create_goal
      time: 1757853597
    - user_id: u001
      user_name: Tom
      action_type: alter_owner
      time: 1757863597
      metadata:
        after:
          user_name: Lucy
    - user_id: u002
      user_name: Lucy
      action_type: start_conversation
      time: 1757904096
      metadata:
        conversation_id: c001
        conversation_title: 项目规划
    - user_id: u002
      user_name: Lucy
      action_type: decompose_goals
      time: 1757904096
      metadata:
        sub_goals_count: 2
        sub_goals:
          - title: "先计划"
          - title: "再执行"
    - user_id: u002
      user_name: Lucy
      action_type: alter_user
      time: 1757904096
      metadata:
        before:
          - user_name: Jim
        after:
          - user_name: Joy
          - user_name: Green
    - user_id: u001
      user_name: Tom
      action_type: add_comment
      time: 1757904096
      metadata:
        comment_content: Good!
```
