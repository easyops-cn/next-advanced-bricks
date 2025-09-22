import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type {
  EoEasyopsAvatar,
  EoEasyopsAvatarProps,
} from "@next-bricks/basic/easyops-avatar";
import { humanizeTime, HumanizeTimeFormat } from "@next-shared/datetime";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import { parseTemplate } from "../shared/parseTemplate.js";
import type { Activity, ActivityOfAlterUser } from "./interfaces.js";

initializeI18n(NS, locales);

const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedAvatar = wrapBrick<EoEasyopsAvatar, EoEasyopsAvatarProps>(
  "eo-easyops-avatar"
);
const { defineElement, property } = createDecorators();

export interface ActivityTimelineProps {
  list?: Activity[];
  chatUrlTemplate?: string;
}

/**
 * 构件 `ai-portal.activity-timeline`
 */
export
@defineElement("ai-portal.activity-timeline", {
  styleTexts: [styleText],
})
class ActivityTimeline
  extends ReactNextElement
  implements ActivityTimelineProps
{
  @property({ attribute: false })
  accessor list: Activity[] | undefined;

  @property()
  accessor chatUrlTemplate: string | undefined;

  render() {
    return (
      <ActivityTimelineComponent
        list={this.list}
        chatUrlTemplate={this.chatUrlTemplate}
      />
    );
  }
}

function ActivityTimelineComponent({
  list,
  chatUrlTemplate,
}: ActivityTimelineProps) {
  if (!list) {
    return (
      <div className="loading">
        <WrappedIcon lib="antd" icon="loading-3-quarters" spinning />
      </div>
    );
  }

  return (
    <ul>
      {list.map((activity, index) => (
        <li className="activity" key={index}>
          <div className="guide-line" />
          <div className="main">
            <WrappedAvatar
              className="avatar"
              nameOrInstanceId={activity.user_id}
              size="xs"
            />
            <span className="action">
              {activity.user_name}
              &nbsp;
              {activity.action_type === "start_conversation" ? (
                <>
                  <span>{t(K.STARTED_A_CHAT)}</span>
                  <WrappedLink
                    className="conversation"
                    url={parseTemplate(chatUrlTemplate, activity)}
                    target="_blank"
                  >
                    {activity.metadata?.conversation_title}
                  </WrappedLink>
                  <WrappedIcon
                    className="external-link-icon"
                    lib="lucide"
                    icon="external-link"
                  />
                </>
              ) : activity.action_type === "create_goal" ? (
                t(K.CREATED_THIS_GOAL)
              ) : activity.action_type === "edit_goal" ? (
                activity.metadata.after.title ? (
                  t(K.CHANGED_THE_GOAL_TITLE, activity.metadata.after)
                ) : activity.metadata.after.description ? (
                  t(K.CHANGED_THE_GOAL_DESCRIPTION, activity.metadata.after)
                ) : (
                  t(K.CHANGED_THE_GOAL)
                )
              ) : activity.action_type === "delete_goal" ? (
                t(K.DELETED_THIS_GOAL)
              ) : activity.action_type === "decompose_goals" ? (
                `${t(K.DECOMPOSED_THIS_GOAL, {
                  count: activity.metadata.sub_goals_count,
                })}${activity.metadata.sub_goals
                  .map((g) => g.title)
                  .join(t(K.COMMA))}`
              ) : activity.action_type === "alter_owner" ? (
                t(K.SET_OWNER, {
                  user: activity.metadata.after.owner.user_name,
                })
              ) : activity.action_type === "alter_user" ? (
                getAlterPARTICIPANTsActivityDescription(activity)
              ) : activity.action_type === "add_comment" ? (
                t(K.COMMENTED)
              ) : (
                // Defense for future action types
                (activity as { action_type: string }).action_type
              )}
            </span>
            <span
              className="time"
              title={humanizeTime(activity.time, HumanizeTimeFormat.full)!}
            >
              {humanizeTime(activity.time, HumanizeTimeFormat.relative)}
            </span>
          </div>
          {activity.action_type === "add_comment" && (
            <div className="comment">{activity.metadata?.comment_content}</div>
          )}
        </li>
      ))}
    </ul>
  );
}

function getAlterPARTICIPANTsActivityDescription(
  activity: ActivityOfAlterUser
) {
  const removed: string[] = [];
  const added: string[] = [];
  const beforeUserIds = new Set(
    activity.metadata.before.users.map((user) => user.user_name)
  );
  for (const user of activity.metadata.after.users) {
    if (!beforeUserIds.has(user.user_name)) {
      added.push(user.user_name);
    }
  }
  const afterUserIds = new Set(
    activity.metadata.after.users.map((user) => user.user_name)
  );
  for (const user of activity.metadata.before.users) {
    if (!afterUserIds.has(user.user_name)) {
      removed.push(user.user_name);
    }
  }

  const descriptions: string[] = [];
  if (removed.length > 0) {
    descriptions.push(
      t(K.REMOVED_GOAL_PARTICIPANTS, { count: removed.length }) +
        removed.join(t(K.COMMA))
    );
  }
  if (added.length > 0) {
    descriptions.push(
      t(K.ADDED_GOAL_PARTICIPANTS, { count: added.length }) +
        added.join(t(K.COMMA))
    );
  }

  return descriptions.join(t(K.SEMICOLON));
}
