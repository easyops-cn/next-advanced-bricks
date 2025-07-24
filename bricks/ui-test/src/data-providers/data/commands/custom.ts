import { CommandDoc } from "../../../interface.js";
import { getParamDefinitionOfArbitraryOptions } from "./utils.js";

export default function getCustomCommands(): CommandDoc[] {
  return [
    // <!-- Testing-library commands start
    {
      name: "login",
      category: "other",
      description: "使用默认用户登录",
      chain: "parent",
      from: "custom",
      icon: {
        lib: "fa",
        icon: "sign-in-alt",
      },
    },
    {
      name: "logout",
      category: "other",
      description: "执行登出",
      chain: "parent",
      from: "custom",
      icon: {
        lib: "fa",
        icon: "sign-out-alt",
      },
    },
    {
      name: "setLanguage",
      category: "other",
      description: "设置平台语言",
      chain: "parent",
      from: "custom",
      params: [
        {
          label: "Language",
          required: true,
          type: "string",
          enum: ["zh", "en"],
        },
      ],
      icon: {
        lib: "fa",
        icon: "language",
      },
    },
    {
      name: "code",
      category: "other",
      description: "填写任意代码",
      chain: "parent",
      from: "custom",
      params: [
        {
          label: "Source",
          required: true,
          type: "string",
        },
      ],
      icon: {
        lib: "fa",
        icon: "code",
      },
    },
    {
      name: "brick_click",
      category: "action",
      description: "构件点击动作",
      chain: "child",
      from: "custom",
      params: [getParamDefinitionOfArbitraryOptions()],
    },
    {
      name: "brick_clickItem",
      category: "action",
      description: "构件基于某项内容进行点击",
      chain: "child",
      from: "custom",
      params: [getParamDefinitionOfArbitraryOptions()],
    },
    {
      name: "brick_type",
      category: "action",
      description: "构件输入动作",
      chain: "child",
      from: "custom",
      params: [getParamDefinitionOfArbitraryOptions()],
    },
    {
      name: "brick_clear",
      category: "action",
      description: "构件内容清除",
      chain: "child",
      from: "custom",
      params: [getParamDefinitionOfArbitraryOptions()],
    },
    {
      name: "brick_fill",
      category: "action",
      description: "构件内容填写",
      chain: "child",
      from: "custom",
      params: [getParamDefinitionOfArbitraryOptions()],
    },
    {
      name: "nextWaitForPageLoad",
      category: "other",
      description: "等待页面加载完成",
      chain: "parent",
      from: "custom",
    },

    // Testing-library commands end -->
  ];
}
