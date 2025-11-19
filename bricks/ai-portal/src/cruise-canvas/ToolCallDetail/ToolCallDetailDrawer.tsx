import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Drawer } from "@next-bricks/containers/drawer";
import type { Job } from "../../shared/interfaces";
import { WrappedDrawer } from "../../shared/bricks";
import { TaskContext } from "../../shared/TaskContext";
import { ToolCallStatus } from "../ToolCallStatus/ToolCallStatus";
import { ToolCallDetail } from "./ToolCallDetail";

export interface ToolCallDetailDrawerProps {
  job: Job;
}

function getDrawerWidth() {
  const { innerWidth } = window;
  return innerWidth < 800
    ? Math.min(500, innerWidth)
    : innerWidth < 1000
      ? innerWidth * 0.8
      : 800;
}

export function ToolCallDetailDrawer({
  job,
}: ToolCallDetailDrawerProps): JSX.Element {
  const { setActiveDetail } = useContext(TaskContext);
  const toolCall = job.toolCall!;
  const toolTitle = toolCall.annotations?.title;

  const handleClose = useCallback(() => {
    setTimeout(() => {
      setActiveDetail(null);
    }, 300);
  }, [setActiveDetail]);

  const ref = useRef<Drawer>(null);

  useEffect(() => {
    setTimeout(() => {
      ref.current?.open();
    });
  }, []);

  const [width, setWidth] = useState(getDrawerWidth);

  useEffect(() => {
    const onResize = () => {
      setWidth(getDrawerWidth);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <WrappedDrawer
      ref={ref}
      customTitle={toolTitle || toolCall.name}
      width={width}
      closable
      mask
      maskClosable
      keyboard
      themeVariant="elevo"
      onClose={handleClose}
    >
      <ToolCallStatus job={job} variant="read-only" />
      <ToolCallDetail job={job} />
    </WrappedDrawer>
  );
}
