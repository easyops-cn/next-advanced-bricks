import { i18n } from "@next-core/i18n";

export enum K {
  YES = "YES",
  NO = "NO",
  SUBMIT = "SUBMIT",
  RESET = "RESET",
  FEEDBACK_NODE_TITLE = "FEEDBACK_NODE_TITLE",
  PROBLEM_FEEDBACK = "PROBLEM_FEEDBACK",
  PROBLEM_FEEDBACK_PLACEHOLDER = "PROBLEM_FEEDBACK_PLACEHOLDER",
  IS_THE_TASK_PLAN_COMPLETE = "IS_THE_TASK_PLAN_COMPLETE",
  IS_THE_TASK_PLAN_LOGICALLY_CORRECT = "IS_THE_TASK_PLAN_LOGICALLY_CORRECT",
  ARE_THE_TASK_PLAN_STEPS_CONCISE = "ARE_THE_TASK_PLAN_STEPS_CONCISE",
  ARE_THE_ANALYTICAL_CONCLUSIONS_ACCURATE = "ARE_THE_ANALYTICAL_CONCLUSIONS_ACCURATE",
  IS_THE_EVIDENCE_SUPPORTING_THE_CONCLUSIONS_SUFFICIENT = "IS_THE_EVIDENCE_SUPPORTING_THE_CONCLUSIONS_SUFFICIENT",
  THANKS_FOR_YOUR_FEEDBACK = "THANKS_FOR_YOUR_FEEDBACK",
}

const en: Locale = {
  YES: "Yes",
  NO: "No",
  SUBMIT: "Submit",
  RESET: "Reset",
  FEEDBACK_NODE_TITLE: "How do you think Elevo has done this task?",
  PROBLEM_FEEDBACK: "Problem feedback",
  PROBLEM_FEEDBACK_PLACEHOLDER: "Please describe the problem you encountered.",
  IS_THE_TASK_PLAN_COMPLETE: "Is the task plan complete:",
  IS_THE_TASK_PLAN_LOGICALLY_CORRECT: "Is the task plan logically correct:",
  ARE_THE_TASK_PLAN_STEPS_CONCISE: "Are the task plan steps concise:",
  ARE_THE_ANALYTICAL_CONCLUSIONS_ACCURATE:
    "Are the analytical conclusions accurate:",
  IS_THE_EVIDENCE_SUPPORTING_THE_CONCLUSIONS_SUFFICIENT:
    "Is the evidence supporting the conclusions sufficient:",
  THANKS_FOR_YOUR_FEEDBACK: "Thank you for helping us become better.",
};

const zh: Locale = {
  YES: "是",
  NO: "否",
  SUBMIT: "提交",
  RESET: "重置",
  FEEDBACK_NODE_TITLE: "Elevo 完成这项任务的效果如何？",
  PROBLEM_FEEDBACK: "问题反馈",
  PROBLEM_FEEDBACK_PLACEHOLDER: "欢迎留下您的意见",
  IS_THE_TASK_PLAN_COMPLETE: "任务计划是否完备：",
  IS_THE_TASK_PLAN_LOGICALLY_CORRECT: "任务计划是否逻辑正确：",
  ARE_THE_TASK_PLAN_STEPS_CONCISE: "任务计划步骤是否精简：",
  ARE_THE_ANALYTICAL_CONCLUSIONS_ACCURATE: "分析结论是否准确：",
  IS_THE_EVIDENCE_SUPPORTING_THE_CONCLUSIONS_SUFFICIENT:
    "结论的支撑证据是否充足：",
  THANKS_FOR_YOUR_FEEDBACK: "感谢你帮我们变得更好。",
};

export const NS = "bricks/ai-portal/NodeFeedback";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
