import React, { Suspense, use, useMemo } from "react";
import { wrapBrick } from "@next-core/react-element";
import type { AvatarProps, EoAvatar } from "@next-bricks/basic/avatar";
import type { ElevoApi_ListElevoAiEmployeesResponseItem } from "@next-api-sdk/llm-sdk";
import fallbackAvatar from "./fallback-avatar.png";
import styles from "./AIEmployeeAvatar.module.css";
import { fetchEmployee } from "../../shared/fetchEmployee";

const WrappedAvatar = wrapBrick<EoAvatar, AvatarProps>("eo-avatar");

export interface AIEmployeeAvatarProps {
  aiEmployeeId: string;
}

export function AIEmployeeAvatar({ aiEmployeeId }: AIEmployeeAvatarProps) {
  return (
    <Suspense
      fallback={
        <WrappedAvatar
          className={styles.avatar}
          showName
          size="xs"
          name={aiEmployeeId}
          src={fallbackAvatar}
        />
      }
    >
      <LegacyAIEmployeeAvatar aiEmployeeId={aiEmployeeId} />
    </Suspense>
  );
}

function LegacyAIEmployeeAvatar({ aiEmployeeId }: AIEmployeeAvatarProps) {
  const employeePromise = useMemo(() => {
    return fetchEmployee(aiEmployeeId);
  }, [aiEmployeeId]);

  const employee = use(employeePromise);

  const props = useMemo(() => {
    if (!employee) {
      return {
        name: aiEmployeeId,
        src: fallbackAvatar,
      };
    }
    const { name, avatar } =
      employee as ElevoApi_ListElevoAiEmployeesResponseItem & {
        avatar?: string;
      };
    const src = avatar
      ? new URL(avatar, location.origin).toString()
      : fallbackAvatar;
    return {
      name,
      src,
    };
  }, [employee, aiEmployeeId]);

  return (
    <WrappedAvatar className={styles.avatar} showName size="xs" {...props} />
  );
}
