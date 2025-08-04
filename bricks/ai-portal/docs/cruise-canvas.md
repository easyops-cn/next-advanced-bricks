构件 `ai-portal.cruise-canvas`

## Examples

### Basic

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
      task:
        state: completed
        requirement: |-
          帮我在CMDB中完成手机银行系统的资源纳管
        plan:
          - id: "2"
            state: completed
            instruction: |-
              深度搜素内部知识库，确认手机银行系统包含的逻辑组件和部署要求
          - id: "8"
            state: completed
            instruction: |-
              深度搜素CMDB给出资源的纳管现状
          - id: "10"
            state: completed
            instruction: |-
              利用深度思考能力，给出手机银行系统的资源纳管优化方案，该方案用户可以微调或确认
          - id: "12"
            state: completed
            instruction: |-
              在CMDB中完成手机银行系统的资源纳管
          - id: "14"
            state: completed
            instruction: |-
              生成纳管后手机银行系统的逻辑架构和部署架构图
      jobs:
        - id: "2"
          state: completed
          instruction: |-
            深度搜素内部知识库，确认手机银行系统包含的逻辑组件和部署要求
        - id: "4"
          upstream: ["2"]
          toolCall:
            name: online_search
            originalArguments: |-
              {"keywords":"手机银行系统"}
          state: completed
          messages:
            - role: tool
              parts:
                - type: text
                  text: |-
                    {"content":"手机银行系统的逻辑组件包含用户认证，交易接入和理财中心三个模块组成。"}
            - role: assistant
              parts:
                - type: text
                  text: |-
                    《手机银行系统》

                    依据内部知识库，手机银行系统的逻辑组件包含用户认证，交易接入和理财中心三个模块组成。
        - id: "5"
          upstream: ["2"]
          state: completed
          toolCall:
            name: online_search
            originalArguments: |-
              {"keywords":"XX公司运维管理文件"}
          messages:
            - role: assistant
              parts:
                - type: text
                  text: |-
                    《XX公司运维管理文件》

                    依据《XX公司运维管理文件》该系统的重要等级为一级，可用性要求99.999%，MTTR为小于3分钟，该系统部署需要实现异地容灾，建议采用双中心部署，且单中心内核心模块无单点。
            - role: tool
              parts:
                - type: data
                  data:
                    type: cmdb_instance_detail
                    objectId: HOST
                    detail:
                      hostname: dev-01
                      env:
                        - id: prod
                          name: 生产
                        - id: test
                          name: 测试
                          backupOwners:
                            - username: Jerry
                              email: jerry@example.com
                            - username: Lucy
                              email: lucy@example.com
                            - username: Mark
                              email: mark@example.com
                          owner:
                            username: Jim
                            email: jim@example.com
                        - id: dev
                          name: 开发
                          owner:
                            username: Tom
                            email: tom@example.com
                      system:
                        id: web
                        name: Web
                    outputSchema:
                      type: object
                      properties:
                        hostname:
                          description: 主机名
                          type: string
                        system:
                          type: object
                          properties:
                            id:
                              type: string
                              description: ID
                            name:
                              type: string
                        env:
                          type: array
                          description: 环境
                          items:
                            type: object
                            properties:
                              id:
                                description: ID
                                type: string
                              name:
                                description: 环境名称
                                type: string
                              owner:
                                type: object
                                properties:
                                  username:
                                    type: string
                                    description: 用户名
                                  email:
                                    type: string
                                    description: 邮箱
                              backupOwners:
                                type: array
                                items:
                                  type: object
                                  properties:
                                    username:
                                      type: string
                                      description: 用户名
                                    email:
                                      type: string
                                      description: 邮箱
        - id: "7"
          upstream: ["4", "5"]
          state: completed
          messages:
            - role: assistant
              parts:
                - type: text
                  text: |-
                    依据内部知识库，手机银行系统的逻辑组件包含用户认证，交易接入和理财中心三个模块组成。依据《XX公司运维管理文件》该系统的重要等级为一级，可用性要求99.999%，MTTR为小于3分钟，该系统部署需要实现异地容灾，建议采用双中心部署，且单中心内核心模块无单点。
        - id: "8"
          upstream: ["7"]
          instruction: |-
            深度搜素CMDB给出资源的纳管现状
          state: completed
          toolCall:
            name: create_view
            originalArguments: |-
              {"requirement":"创建一个 XX 视图"}
          messages:
            - role: tool
              parts:
                - type: text
                  text: |-
                    <%
                      JSON.stringify({
                        "viewId": "view-123",
                        "code": `// 调用监控数据查询接口查询该主机该时间段内的 CPU 使用率、磁盘使用率和网络流量的指标数据
                    defineDataSource("hostMetrics", {
                      api: "easyops.api.data_exchange.olap@Query",
                      objectId: "HOST",
                      params: {
                        model: "easyops.HOST",
                        filters: [
                          {
                            name: "ip",
                            operator: "==",
                            value: "1.2.3.4"
                          },
                          {
                            name: "time",
                            operator: ">=",
                            value: "now-2d"
                          },
                          {
                            name: "time",
                            operator: "<=",
                            value: "now-1s"
                          }
                        ],
                        dims: ["time(auto)"],
                        measures: [
                          {
                            function: {
                              args: ["system_cpu_total_norm_pct"],
                              expression: "avg"
                            },
                            name: "system_cpu_total_norm_pct"
                          },
                          {
                            function: {
                              args: ["system_filesystem_usage_pct"],
                              expression: "avg"
                            },
                            name: "system_filesystem_usage_pct"
                          },
                          {
                            function: {
                              args: ["system_network_in_bits_per_sec"],
                              expression: "avg"
                            },
                            name: "system_network_in_bits_per_sec"
                          },
                          {
                            function: {
                              args: ["system_network_out_bits_per_sec"],
                              expression: "avg"
                            },
                            name: "system_network_out_bits_per_sec"
                          }
                        ]
                      }
                    });

                    export default (
                      <eo-view title="主机 1.2.3.4 监控趋势">
                        <eo-dashboard
                          dataSource={CTX.hostMetrics}
                          widgets={[
                            {
                              widget: "chart",
                              type: "line",
                              title: "CPU 使用率",
                              metric: {
                                id: "system_cpu_total_norm_pct",
                                unit: "percent(1)"
                              }
                            },
                            {
                              widget: "chart",
                              type: "area",
                              title: "磁盘使用率",
                              metric: {
                                id: "system_filesystem_usage_pct",
                                unit: "percent(1)"
                              }
                            },
                            {
                              widget: "chart",
                              type: "line",
                              title: "网络流量 (入)",
                              metric: {
                                id: "system_network_in_bits_per_sec",
                                unit: "bits/sec"
                              }
                            },
                            {
                              widget: "chart",
                              type: "line",
                              title: "网络流量 (出)",
                              metric: {
                                id: "system_network_out_bits_per_sec",
                                unit: "bits/sec"
                              }
                            }
                          ]}
                        />
                      </eo-view>
                    );`
                      })
                    %>
            - role: assistant
              parts:
                - type: text
                  text: |-
                    基于CMDB查询手机银行的资源纳管情况，纳管现状总结如下：

                    实例数据的完整性
                    1. 系统录入（已完成）
                    2. 模块录入（部分完成），交易接入模块未录入
                    3. 环境录入（已完成）
                    4. 主机录入（部分完成），交易接入模块主机未录入
                    5. 部署实例录入（部分完成），交易接入模块的部署实例未录入

                    关系数据的完整性
                    1. 系统和模块（部分完成），系统和交易接入模块的关系未建立
                    2. 系统和环境（√）
                    3. 模块和主机（部分完成）
                    4. ...
        - id: "10"
          upstream: ["8"]
          toolCall:
            name: ask_human
            arguments:
              command: ask_user_more
              question: |-
                - 交易接入模块的录入；
                - 系统和交易接入模块的关系创建 ；
                - 部署实例自动采集特征录入。
          instruction: |-
            利用深度思考能力，给出手机银行系统的资源纳管优化方案，该方案用户可以微调或确认
          state: completed
          messages:
            - role: user
              parts:
                - type: text
                  text: |-
                    我补充下...
        - id: "12"
          upstream: ["10"]
          instruction: |-
            在CMDB中完成手机银行系统的资源纳管
          toolCall:
            name: ask_human
            arguments:
              command: ask_user_confirm
              question: |-
                方案执行的过程信息
          state: completed
          messages:
            - role: tool
              parts:
                - type: text
                  text: |-
                    确认
        - id: "14"
          upstream: ["12"]
          instruction: |-
            生成纳管后手机银行系统的逻辑架构和部署架构图
          tag: topology
          state: completed
          messages:
            - role: assistant
              parts:
                - type: text
                  text: |-
                    https://example.com/topology
        - id: "16"
          upstream: ["14"]
          state: completed
          messages:
            - role: assistant
              parts:
                - type: text
                  text: |-
                    该手机银行系统的资源纳管已经完成，本次纳管新增了交易接入模块和该模块相关的主机，以及部署实例信息，模块的纳管建议和架构管理平台打通，部署实例的纳管建议和自动发布平台打通，以便自动完成数据变更，确保数据的准确性，降低架构维护成本。
```
