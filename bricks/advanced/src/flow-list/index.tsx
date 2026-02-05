import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
// import { initializeI18n } from "@next-core/i18n";
// import { K, NS, locales, t } from "./i18n.js";
// import styleText from "./styles.shadow.css";
import { StepInputsSettingTableForm } from '@shared/flow'

// initializeI18n(NS, locales);


const { defineElement } = createDecorators();

export interface FlowListProps {
  // Define props here.
}

/**
 * 构件 `advanced.flow-list`
 */
export
@defineElement("advanced.flow-list", {
  // styleTexts: [styleText],
  shadowOptions: false
})
class FlowList extends ReactNextElement implements FlowListProps {
  render() {
    return (
      <FlowListComponent />
    );
  }
}

function FlowListComponent() {
  // 构造 StepInputsSettingTableForm 所需的数据
  const flowData = {
    flowId: "237012ac0eba87e9b7d00b3f3cd9317c",
    version: 0,
    name: "测试流程 - 输入配置",
    org: 0,
    creator: "admin",
    category: "" as const,
    updateTime: new Date().toISOString(),
    createTime: new Date().toISOString(),
    // 流程输入定义 - 应该是数组格式
    flowInputs: [
      {
        name: "@agents",
        label: "执行目标",
        type: "agents",
        required: true
      },
      {
        name: "appName",
        label: "应用名称",
        type: "string",
        required: true
      },
      {
        name: "version",
        label: "版本号",
        type: "string",
        required: false
      }
    ],
    // 步骤列表
    stepList: [
      {
        uid: "step1",
        stepId: 1,
        stepName: "执行环境检查",
        subtype: "tool" as const,
        type: "task",
        toolId: "de7627a195c5d445efbdea0ef90b883f",
        vId: "$latest_production",
        execUser: "root",
        // showInputDefs 是组件期望的字段名
        showInputDefs: [
          {
            name: "@agents",
            label: "执行目标",
            type: "agents",
            required: true,
            mappingType: "flowInput"
          },
          {
            name: "checkType",
            label: "检查类型",
            type: "string",
            required: false,
            default: "full",
            mappingType: "const"
          }
        ],
        // 步骤输入映射
        inputs: {
          "@agents": {
            aliasLabel: "执行目标",
            aliasName: "@agents",
            mappingType: "flowInput"
          },
          "checkType": {
            value: "full",
            mappingType: "const"
          }
        },
        // showOutputDefs 是组件期望的字段名
        showOutputDefs: [
          {
            id: "checkResult",
            name: "检查结果",
            type: "string"
          }
        ],
        _x: 227,
        _y: 385.5,
        root: true
      },
      {
        uid: "step2",
        stepId: 2,
        stepName: "人工审批",
        subtype: "manual" as const,
        type: "task",
        actions: [
          {
            label: "继续",
            value: "yes",
            terminate: false
          },
          {
            label: "停止",
            value: "no",
            terminate: true
          }
        ],
        approvers: [],
        showInputDefs: [
          {
            name: "approvalReason",
            label: "审批原因",
            type: "string",
            required: false,
            mappingType: "stepOutput",
            stepOutPutOptions: [
              {
                value: "checkResult",
                label: "检查结果"
              }
            ]
          }
        ],
        inputs: {
          "approvalReason": {
            step: 1,
            key: "checkResult",
            mappingType: "stepOutput"
          }
        },
        showOutputDefs: [
          {
            id: "approvalResult",
            name: "审批结果",
            type: "string"
          }
        ],
        _x: 466,
        _y: 385.5,
        source: 1,
        target: 3
      },
      {
        uid: "step3",
        stepId: 3,
        stepName: "部署应用",
        subtype: "tool" as const,
        type: "task",
        toolId: "de7627a195c5d445efbdea0ef90b883f",
        vId: "$latest_production",
        execUser: "root",
        showInputDefs: [
          {
            name: "@agents",
            label: "执行目标",
            type: "agents",
            required: true,
            mappingType: "flowInput"
          },
          {
            name: "appName",
            label: "应用名称",
            type: "string",
            required: true,
            mappingType: "flowInput"
          },
          {
            name: "version",
            label: "版本号",
            type: "string",
            required: false,
            mappingType: "flowInput"
          }
        ],
        inputs: {
          "@agents": {
            aliasLabel: "执行目标",
            aliasName: "@agents",
            mappingType: "flowInput"
          },
          "appName": {
            aliasLabel: "应用名称",
            aliasName: "appName",
            mappingType: "flowInput"
          },
          "version": {
            aliasLabel: "版本号",
            aliasName: "version",
            mappingType: "flowInput"
          }
        },
        showOutputDefs: [
          {
            id: "deployResult",
            name: "部署结果",
            type: "string"
          }
        ],
        _x: 731,
        _y: 385.5,
        source: 2
      }
    ]
  };

  return <div style={{ padding: "20px" }}>
    <h2>StepInputsSettingTableForm 示例</h2>
    <div style={{
      border: "1px solid #d9d9d9",
      borderRadius: "4px",
      padding: "16px",
      backgroundColor: "#fff"
    }}>
      <StepInputsSettingTableForm
        flowData={flowData}
        onChange={(_values: unknown) => {
          // Handle form change
        }}
        isPipeline={false}
        disableFlowInput={false}
      />
    </div>
  </div>;
}
