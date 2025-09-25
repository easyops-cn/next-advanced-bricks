import React, { Suspense, use, useMemo } from "react";
import { wrapBrick } from "@next-core/react-element";
import type { AvatarProps, EoAvatar } from "@next-bricks/basic/avatar";
import {
  ElevoApi_listElevoAiEmployees,
  type ElevoApi_ListElevoAiEmployeesResponseItem,
} from "@next-api-sdk/llm-sdk";
import fallbackAvatar from "./fallback-avatar.png";
import styles from "./AIEmployeeAvatar.module.css";

const WrappedAvatar = wrapBrick<EoAvatar, AvatarProps>("eo-avatar");

const cache = new Map<
  string,
  Promise<ElevoApi_ListElevoAiEmployeesResponseItem | undefined>
>();

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
    const cached = cache.get(aiEmployeeId);
    if (cached) {
      return cached;
    }
    const promise = fetchEmployee(aiEmployeeId);
    cache.set(aiEmployeeId, promise);
    return promise;
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

async function fetchEmployee(aiEmployeeId: string) {
  const response = await ElevoApi_listElevoAiEmployees({
    employeeId: aiEmployeeId,
  } as any);
  const employee = response.list?.[0];
  return employee?.employeeId === aiEmployeeId ? employee : undefined;
}
