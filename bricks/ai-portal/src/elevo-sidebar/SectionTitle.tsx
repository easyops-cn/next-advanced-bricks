import React, {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type PropsWithChildren,
} from "react";
import { throttle } from "lodash";
import classNames from "classnames";
import { WrappedIcon } from "./bricks.js";

export interface SectionTitleProps {
  rootRef: MutableRefObject<HTMLDivElement | null>;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function SectionTitle({
  rootRef,
  title,
  collapsed,
  children,
  onToggle,
}: PropsWithChildren<SectionTitleProps>) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [stickyActive, setStickyActive] = useState(false);

  useEffect(() => {
    if (collapsed) {
      setStickyActive(false);
      return;
    }
    const parent = rootRef.current;
    const element = ref.current;
    const sibling = element?.nextElementSibling as HTMLElement | null;
    if (!parent || !element || !sibling) {
      return;
    }
    const onScroll = throttle(() => {
      const rect = element.getBoundingClientRect();
      const siblingRect = sibling.getBoundingClientRect();
      const diff = siblingRect.top - rect.top - rect.height;
      setStickyActive(diff < 1);
    }, 100);
    parent.addEventListener("scroll", onScroll);
    return () => {
      parent.removeEventListener("scroll", onScroll);
    };
  }, [collapsed, rootRef]);

  return (
    <div
      className={classNames("section-title", { sticky: stickyActive })}
      ref={ref}
    >
      <div className="section-label" onClick={onToggle}>
        {title}
        <WrappedIcon lib="fa" icon="angle-down" />
      </div>
      {children}
    </div>
  );
}
