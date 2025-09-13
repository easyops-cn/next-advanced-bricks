import React, { useRef, useState } from "react";
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
import type { Input, InputEvents, InputProps } from "@next-bricks/form/input";
import classNames from "classnames";
import { K, NS, locales, t } from "../i18n.js";
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

const WrappedInput = wrapBrick<Input, InputProps, InputEvents, InputEventsMap>(
  "eo-input",
  {
    onValueChange: "change",
  }
);

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

  const [hover, setHover] = useState(false);

  const [value, setValue] = useState(title);

  const lockRef = useRef(false);

  const handleStatusChange = (action: SimpleAction) => {
    onStatusChange?.(action.key as GoalState);
  };

  const handleMouseLeave = () => {
    if (!lockRef.current) {
      setHover(false);
    }
  };

  const handleValueChange = (value: string) => {
    lockRef.current = true;
    setValue(value);
  };

  const handleConfirm = () => {
    if (value) {
      setHover(false);
      onTitleChange?.(value);
      lockRef.current = false;
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
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => handleMouseLeave()}
          onClick={(e) => e.stopPropagation()}
        >
          <WrappedInput
            className={classNames("input", {
              show: hover,
            })}
            size="small"
            value={value}
            onValueChange={(e) => handleValueChange(e.detail)}
            onBlur={() => handleConfirm()}
            inputStyle={{
              width: "100%",
            }}
          />
          <span
            className={classNames("text", {
              show: !hover,
            })}
          >
            {title}
          </span>
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
