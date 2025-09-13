import React from "react";
import { initializeI18n } from "@next-core/i18n";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type {
  EoDropdownActions,
  DropdownActionsProps,
  DropdownActionsEvents,
  DropdownActionsEventsMapping,
} from "@next-bricks/basic/dropdown-actions";
import type {
  EoEasyopsAvatar,
  EoEasyopsAvatarProps,
} from "@next-bricks/basic/easyops-avatar";
import type { Action, SimpleAction } from "@next-bricks/basic/actions";
import classNames from "classnames";
import { K, NS, locales, t } from "../i18n.js";
import { getContentEditable } from "../../shared/getContentEditable.js";
initializeI18n(NS, locales);

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedDropdownActions = wrapBrick<
  EoDropdownActions,
  DropdownActionsProps,
  DropdownActionsEvents,
  DropdownActionsEventsMapping
>("eo-dropdown-actions", {
  onActionClick: "action.click",
  onVisibleChange: "visible.change",
});
const WrappedEasyopsAvatar = wrapBrick<EoEasyopsAvatar, EoEasyopsAvatarProps>(
  "eo-easyops-avatar"
);

export interface InputEventsMap {
  onValueChange: "change";
}

export type GoalState = "ready" | "working" | "completed";

interface GoalMember {
  instanceId: string;
}

export interface GoalItem {
  title: string;
  description?: string;
  state: GoalState;
  index: number;
  conversations?: string[];
  child_target?: GoalItem[];
  parent_target?: GoalItem[];
  leader?: GoalMember;
  users?: GoalMember[];
  instanceId: string;
  offsetX?: number;
}

interface GoalCardItemProps {
  goalItem: GoalItem;
  cardStyle?: React.CSSProperties;
  onTitleChange?: (newTitle: string) => void;
  onStatusChange?: (newStatus: GoalState) => void;
  onClick?: () => void;
}

const iconMap = {
  ready: "uncheck-status",
  working: "active-status",
  completed: "check-status",
};

const iconActions: Action[] = [
  {
    key: "ready",
    icon: {
      icon: "uncheck-status",
      lib: "easyops",
      category: "colored-common",
    },
    text: t(K.UN_START_STATUS),
  },
  {
    key: "working",
    icon: {
      icon: "active-status",
      lib: "easyops",
      category: "colored-common",
    },
    text: t(K.RUNNING_STATUS),
  },
  {
    key: "completed",
    icon: {
      icon: "check-status",
      lib: "easyops",
      category: "colored-common",
    },
    text: t(K.COMPLETED_STATUS),
  },
];

export function GoalCardItem({
  goalItem,
  cardStyle,
  onStatusChange,
  onTitleChange,
  onClick,
}: GoalCardItemProps) {
  const { state, index: serialNumber, title, conversations, leader } = goalItem;

  const handleStatusChange = (action: SimpleAction) => {
    onStatusChange?.(action.key as GoalState);
  };

  const handleConfirm = (e: React.FocusEvent<HTMLSpanElement>) => {
    const value = e.currentTarget.textContent;
    if (value && value !== title) {
      onTitleChange?.(value);
    }
  };

  return (
    <div
      className={classNames("goal-item", goalItem.state)}
      style={{
        paddingLeft: `${goalItem.offsetX}px`,
        ...cardStyle,
      }}
      onClick={onClick}
    >
      <div className="start">
        <WrappedDropdownActions
          actions={iconActions}
          onActionClick={(e) => handleStatusChange(e.detail)}
        >
          <WrappedIcon
            className="icon"
            lib="easyops"
            category="colored-common"
            icon={iconMap[state]}
            onClick={(e) => e.stopPropagation()}
          />
        </WrappedDropdownActions>

        <span className="serial-number">{serialNumber}</span>
        <span
          className="title"
          onClick={(e) => e.stopPropagation()}
          contentEditable={getContentEditable(true)}
          onBlur={handleConfirm}
        >
          {title}
        </span>
      </div>
      <div className="end">
        <div className="message" onClick={(e) => e.stopPropagation()}>
          <WrappedIcon lib="easyops" category="common" icon="message" />
          <span className="count">{conversations?.length || 0}</span>
        </div>
        <WrappedEasyopsAvatar
          nameOrInstanceId={leader?.instanceId}
          size="small"
        />
      </div>
    </div>
  );
}
