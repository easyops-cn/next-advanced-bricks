// istanbul ignore file: experimental
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { uniqueId } from "lodash";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";
import styles from "./HumanAdjustPlan.module.css";
import sharedStyles from "../shared.module.css";
import { WrappedButton, WrappedIcon } from "../bricks";
import { K, t } from "../i18n.js";
import { getContentEditable } from "../getContentEditable";

interface DraggableStep {
  id: string;
  content: string;
  newlyAdded?: boolean;
}

export function HumanAdjustPlan({
  jobId,
  steps,
  humanInput,
}: {
  jobId: string;
  steps?: string[];
  humanInput?: (jobId: string, input: string) => void;
}): JSX.Element {
  const [list, setList] = useState<DraggableStep[]>([]);

  useEffect(() => {
    setList(
      (steps ?? []).map((content) => ({
        id: uniqueId("step-"),
        content,
      }))
    );
  }, [steps]);

  const idList = useMemo(() => list.map((step) => step.id), [list]);
  const [changed, setChanged] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  const dndModifiers = useMemo(
    () => [restrictToVerticalAxis, restrictToFirstScrollableAncestor],
    []
  );

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      setList((prev) => {
        const activeIndex = prev.findIndex((v) => v.id === active.id);
        const overIndex = prev.findIndex((v) => v.id === over.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
      setChanged(true);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    humanInput?.(
      jobId,
      JSON.stringify({
        type: "plan",
        steps: list.map((step) => step.content),
      })
    );
  }, [humanInput, jobId, list]);

  const handleReset = useCallback(() => {
    setList(
      (steps ?? []).map((content) => ({
        id: uniqueId("step-"),
        content,
      }))
    );
    setChanged(false);
  }, [steps]);

  const handleAddStep = useCallback(() => {
    setList((prev) =>
      prev.concat({
        id: uniqueId("step-"),
        content: "",
        newlyAdded: true,
      })
    );
    setChanged(true);
  }, []);

  const handleDeleteStep = useCallback((id: string) => {
    setList((prev) => prev.filter((step) => step.id !== id));
    setChanged(true);
  }, []);

  const handleUpdateStepContent = useCallback((id: string, content: string) => {
    setList((prev) =>
      prev.map((step) => (step.id === id ? { ...step, content } : step))
    );
    setChanged(true);
  }, []);

  return (
    <>
      <div className={styles.plan}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={dndModifiers}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={idList}
            strategy={verticalListSortingStrategy}
          >
            <ul className={styles.steps}>
              {list.map((step) => (
                <AdjustStep
                  key={step.id}
                  id={step.id}
                  content={step.content}
                  newlyAdded={step.newlyAdded}
                  onDelete={handleDeleteStep}
                  onUpdateContent={handleUpdateStepContent}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        <div className={styles.actions}>
          <button className={styles["button-add"]} onClick={handleAddStep}>
            <WrappedIcon
              className={styles["button-icon"]}
              lib="antd"
              icon="plus"
            />
            <span className={styles["button-text"]}>{t(K.ADD_STEP)}</span>
          </button>
          <button
            className={styles["button-reset"]}
            hidden={!changed}
            onClick={handleReset}
          >
            {t(K.RESET_PLAN)}
          </button>
        </div>
      </div>
      <div className={styles.toolbar}>
        <WrappedButton
          type="primary"
          className={sharedStyles["rounded-button"]}
          onClick={handleConfirm}
        >
          {t(K.CONFIRM)}
        </WrappedButton>
      </div>
    </>
  );
}

interface AdjustStepProps {
  id: string;
  content: string;
  newlyAdded?: boolean;
  onDelete: (id: string) => void;
  onUpdateContent: (id: string, content: string) => void;
}

function AdjustStep({
  id,
  content,
  newlyAdded,
  onDelete,
  onUpdateContent,
}: AdjustStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const contentRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () => {
      if (newlyAdded) {
        contentRef.current?.focus();
      }
    },
    // One-time focus
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition]
  );

  const [editing, setEditing] = useState(false);

  const handleFocus = useCallback(() => {
    setEditing(true);
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLSpanElement>) => {
      setEditing(false);
      const newContent = e.currentTarget.textContent;
      if (newContent !== null && content !== newContent) {
        onUpdateContent(id, newContent);
      }
    },
    [content, id, onUpdateContent]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    []
  );

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={classNames(styles.step, {
        [styles.dragging]: isDragging,
        [styles.editing]: editing,
      })}
      style={style}
    >
      <span className={styles.handle}>
        <WrappedIcon lib="antd" icon="holder" />
      </span>
      <span
        className={styles.content}
        ref={contentRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        contentEditable={getContentEditable(true)}
      >
        {content}
      </span>
      <span className={styles.delete}>
        <WrappedIcon
          className={styles.delete}
          lib="antd"
          icon="delete"
          onClick={() => onDelete(id)}
        />
      </span>
    </li>
  );
}
