import { i18n } from "@next-core/i18n";

export enum K {
  STARTED_A_CHAT = "STARTED_A_CHAT",
  CREATED_THIS_GOAL = "CREATED_THIS_GOAL",
  CHANGED_THE_GOAL_TITLE = "CHANGED_THE_GOAL_TITLE",
  CHANGED_THE_GOAL_DESCRIPTION = "CHANGED_THE_GOAL_DESCRIPTION",
  CHANGED_THE_GOAL = "CHANGED_THE_GOAL",
  DELETED_THIS_GOAL = "DELETED_THIS_GOAL",
  DECOMPOSED_THIS_GOAL = "DECOMPOSED_THIS_GOAL",
  SET_OWNER = "SET_OWNER",
  REMOVED_GOAL_PARTICIPANTS = "REMOVED_GOAL_PARTICIPANTS",
  ADDED_GOAL_PARTICIPANTS = "ADDED_GOAL_PARTICIPANTS",
  COMMENTED = "COMMENTED",
  COMMA = "COMMA",
  SEMICOLON = "SEMICOLON",
}

const en: Locale = {
  STARTED_A_CHAT: "started a chat",
  CREATED_THIS_GOAL: "created this goal",
  CHANGED_THE_GOAL_TITLE: 'changed the goal title to "{{ title }}"',
  CHANGED_THE_GOAL_DESCRIPTION:
    'changed the goal description to "{{ description }}"',
  CHANGED_THE_GOAL: "changed the goal",
  DELETED_THIS_GOAL: "deleted this goal",
  DECOMPOSED_THIS_GOAL: "decomposed this goal to {{ count }} sub-goal: ",
  DECOMPOSED_THIS_GOAL_plural:
    "decomposed this goal to {{ count }} sub-goals: ",
  SET_OWNER: "set {{ user }} as the owner",
  REMOVED_GOAL_PARTICIPANTS: "removed a goal participant: ",
  REMOVED_GOAL_PARTICIPANTS_plural: "removed {{ count }} goal participants: ",
  ADDED_GOAL_PARTICIPANTS: "added a goal participant: ",
  ADDED_GOAL_PARTICIPANTS_plural: "added {{ count }} goal participants: ",
  COMMENTED: "commented",
  COMMA: ", ",
  SEMICOLON: "; ",
};

const zh: Locale = {
  STARTED_A_CHAT: "发起了对话",
  CREATED_THIS_GOAL: "创建了此目标",
  CHANGED_THE_GOAL_TITLE: "修改目标标题为 “{{ title }}”",
  CHANGED_THE_GOAL_DESCRIPTION: "修改目标描述为 “{{ description }}”",
  CHANGED_THE_GOAL: "修改了此目标",
  DELETED_THIS_GOAL: "删除了此目标",
  DECOMPOSED_THIS_GOAL: "将此目标分解为 {{ count }} 个子目标：",
  DECOMPOSED_THIS_GOAL_plural: "将此目标分解为 {{ count }} 个子目标：",
  SET_OWNER: "设定负责人为 {{ user }}",
  REMOVED_GOAL_PARTICIPANTS: "移除了目标参与成员：",
  ADDED_GOAL_PARTICIPANTS: "添加了目标参与成员：",
  COMMENTED: "评论",
  COMMA: "，",
  SEMICOLON: "；",
};

export const NS = "bricks/ai-portal/activity-timeline";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
