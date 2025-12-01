import React, { createContext, useContext, useState } from "react";
import { initializeI18n } from "@next-core/i18n";
import classNames from "classnames";
import type { PlanStep, Task } from "../interfaces";
import styles from "./ActivityPlan.module.css";
import { K, locales, NS, t } from "./i18n";
import { WrappedIcon } from "../bricks";
import { ICON_UP } from "../constants";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";

initializeI18n(NS, locales);

export interface ActivityPlanProps {
  task: Task;
}

const ActivityPlanContext = createContext<{
  collapsed?: boolean;
}>({});

export function ActivityPlan({ task }: ActivityPlanProps) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <ActivityPlanContext.Provider value={{ collapsed }}>
      <div
        className={classNames(styles.plan, { [styles.collapsed]: collapsed })}
      >
        <div className={styles.heading}>
          <span className={styles.title}>{t(K.ACTIVITY_PLAN)}</span>
          <div
            className={styles.toggle}
            onClick={() => {
              setCollapsed((prev) => !prev);
            }}
          >
            {t(K.SHOW_PROCESS)}
            <WrappedIcon className={styles.chevron} {...ICON_UP} />
          </div>
        </div>
        <PlanTree plan={task.plan!} level={0} />
      </div>
    </ActivityPlanContext.Provider>
  );
}

interface PlanTreeProps {
  plan: PlanStep[];
  level: number;
}

function PlanTree({ plan, level }: PlanTreeProps) {
  return (
    <ul className={styles.tree}>
      {plan.map((step, index, list) => (
        <PlanStepNode
          key={index}
          step={step}
          level={level}
          isLast={index === list.length - 1}
        />
      ))}
    </ul>
  );
}

export interface PlanStepNodeProps {
  step: PlanStep;
  level: number;
  isLast: boolean;
}

function PlanStepNode({ step, level, isLast }: PlanStepNodeProps) {
  const isFirstLevel = level === 0;
  const { collapsed } = useContext(ActivityPlanContext);
  const preferTheme = isFirstLevel ? "filled" : "outlined";
  const icon: GeneralIconProps = {
    lib: "antd",
    theme: preferTheme,
    icon: "clock-circle",
  };
  let className: string | undefined;
  // const hasChildren = level === 0;
  const hasChildren = false;

  return (
    <li className={isFirstLevel ? styles.root : undefined}>
      {!(isLast && (collapsed || !hasChildren)) && (
        <div
          className={styles.line}
          style={{
            bottom: isLast ? 0 : isFirstLevel ? -12 : -8,
          }}
        />
      )}
      <div className={styles.node}>
        <div className={styles.label}>
          <WrappedIcon
            className={classNames(styles.icon, className)}
            {...icon}
          />
          <span className={styles.name}>{step.name}</span>
        </div>
      </div>
      {/* {!collapsed && (
        <div style={{ paddingLeft: 20 }}>
          <div className={styles.message}>Oops</div>
          {hasChildren && (
            <PlanTree
              plan={[
                {
                  name: "子任务 1 - 步骤 A",
                },
                {
                  name: "子任务 1 - 步骤 B",
                },
              ]}
              level={level + 1}
            />
          )}
        </div>
      )} */}
    </li>
  );
}
