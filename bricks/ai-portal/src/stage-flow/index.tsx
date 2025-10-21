import React, {
  createRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { unwrapProvider } from "@next-core/utils/general";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import {
  GeneralIcon,
  type GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type {
  Popover,
  PopoverEvents,
  PopoverEventsMapping,
  PopoverProps,
} from "@next-bricks/basic/popover";
import type {
  Input,
  InputEvents,
  InputEventsMap,
  InputProps,
} from "@next-bricks/form/input";
import type { showDialog as _showDialog } from "@next-bricks/basic/data-providers/show-dialog/show-dialog";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";

initializeI18n(NS, locales);

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedPopover = wrapBrick<
  Popover,
  PopoverProps & {
    themeVariant?: "default" | "elevo";
  },
  PopoverEvents,
  PopoverEventsMapping
>("eo-popover", {
  onVisibleChange: "visible.change",
  onBeforeVisibleChange: "before.visible.change",
});
const WrappedInput = wrapBrick<Input, InputProps, InputEvents, InputEventsMap>(
  "eo-input",
  {
    onChange: "change",
  }
);
const showDialog = unwrapProvider<typeof _showDialog>("basic.show-dialog");

const { defineElement, property, event, method } = createDecorators();

export interface StageFlowProps {
  spec?: Stage[];
  aiEmployees?: AIEmployee[];
  readOnly?: boolean;
}

export interface Stage {
  name: string;
  serviceFlowActivities?: FlowActivity[];
}

export interface FlowActivity {
  name: string;
  description?: string;
  aiEmployeeId?: string;
  hilRules?: string;
  hilUser?: string;
}

export interface AIEmployee {
  employeeId: string;
  name: string;
}

export interface EditActivityDetail {
  stage: Stage;
  activity: FlowActivity;
  activityIndex: number;
}

const StageFlowComponent = forwardRef(LegacyStageFlowComponent);

/**
 * 构件 `ai-portal.stage-flow`
 */
export
@defineElement("ai-portal.stage-flow", {
  styleTexts: [styleText],
})
class StageFlow extends ReactNextElement implements StageFlowProps {
  @property({ attribute: false })
  accessor spec: Stage[] | undefined;

  @property({ attribute: false })
  accessor aiEmployees: AIEmployee[] | undefined;

  @property({ type: Boolean })
  accessor readOnly: boolean | undefined;

  @event({ type: "change" })
  accessor #change!: EventEmitter<Stage[]>;

  #handleChange = (spec: Stage[]) => {
    this.#change.emit(spec);
  };

  @event({ type: "add.activity" })
  accessor #addActivity!: EventEmitter<{ stage: Stage }>;

  #handleAddActivity = (stage: Stage) => {
    this.#addActivity.emit({ stage });
  };

  @event({ type: "edit.activity" })
  accessor #editActivity!: EventEmitter<EditActivityDetail>;

  #handleEditActivity = (detail: EditActivityDetail) => {
    this.#editActivity.emit(detail);
  };

  #ref = createRef<StageFlowRef>();

  @method()
  addActivity(stage: Stage, activity: FlowActivity) {
    this.#ref.current?.addActivity(stage, activity);
  }

  @method()
  editActivity(stage: Stage, activity: FlowActivity, activityIndex: number) {
    this.#ref.current?.editActivity(stage, activity, activityIndex);
  }

  @method()
  deleteActivity(stage: Stage, activityIndex: number) {
    this.#ref.current?.deleteActivity(stage, activityIndex);
  }

  render() {
    return (
      <StageFlowComponent
        ref={this.#ref}
        spec={this.spec}
        aiEmployees={this.aiEmployees}
        readOnly={this.readOnly}
        onChange={this.#handleChange}
        onAddActivity={this.#handleAddActivity}
        onEditActivity={this.#handleEditActivity}
      />
    );
  }
}

interface StageFlowRef {
  addActivity(stage: Stage, activity: FlowActivity): void;
  editActivity(
    stage: Stage,
    activity: FlowActivity,
    activityIndex: number
  ): void;
  deleteActivity(stage: Stage, activityIndex: number): void;
}

interface StageFlowComponentProps extends StageFlowProps {
  onChange: (spec: Stage[]) => void;
  onAddActivity: (stage: Stage) => void;
  onEditActivity(detail: EditActivityDetail): void;
}

function LegacyStageFlowComponent(
  {
    spec,
    aiEmployees,
    readOnly,
    onChange,
    onAddActivity,
    onEditActivity,
  }: StageFlowComponentProps,
  ref: Ref<StageFlowRef>
) {
  const [stages, setStages] = useState(spec);
  const [addingStage, setAddingStage] = useState(false);
  const initialRef = useRef(true);

  useEffect(() => {
    setStages(spec);
  }, [spec]);

  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    if (stages) {
      onChange(stages);
    }
  }, [stages, onChange]);

  const getAIEmployeeName = useCallback(
    (employeeId: string | undefined) => {
      if (!employeeId) {
        return t(K.UNASSIGNED);
      }
      const employee = aiEmployees?.find((e) => e.employeeId === employeeId);
      return employee ? employee.name : employeeId;
    },
    [aiEmployees]
  );

  useImperativeHandle(
    ref,
    () => ({
      addActivity(stage: Stage, activity: FlowActivity) {
        setStages((prev) => {
          const prevList = prev ?? [];
          const stageIndex = prevList.findIndex((s) => s.name === stage.name);
          if (stageIndex === -1) {
            // Stage not found, return previous state
            return prevList;
          }
          const updatedStage = { ...prevList[stageIndex] };
          const prevActivities = updatedStage.serviceFlowActivities ?? [];

          if (prevActivities.find((a) => a.name === activity.name)) {
            // Activity with the same name already exists, return previous state
            showDialog({
              type: "warn",
              content: t(K.ACTIVITY_NAME_EXISTS, { name: activity.name }),
            });
            return prevList;
          }

          const updatedActivities = [...prevActivities, activity];
          updatedStage.serviceFlowActivities = updatedActivities;
          const newStages = [...prevList];
          newStages[stageIndex] = updatedStage;
          return newStages;
        });
      },
      editActivity(
        stage: Stage,
        activity: FlowActivity,
        activityIndex: number
      ) {
        setStages((prev) => {
          const prevList = prev ?? [];
          const stageIndex = prevList.findIndex((s) => s.name === stage.name);
          if (stageIndex === -1) {
            // Stage not found, return previous state
            return prevList;
          }
          const updatedStage = { ...prevList[stageIndex] };
          const prevActivities = updatedStage.serviceFlowActivities ?? [];

          if (
            prevActivities.find(
              (a, index) => a.name === activity.name && index !== activityIndex
            )
          ) {
            // Activity with the same name already exists, return previous state
            showDialog({
              type: "warn",
              content: t(K.ACTIVITY_NAME_EXISTS, { name: activity.name }),
            });
            return prevList;
          }

          const updatedActivities = [...prevActivities];
          if (activityIndex < 0 || activityIndex >= updatedActivities.length) {
            // Activity index out of bounds, return previous state
            return prevList;
          }
          updatedActivities[activityIndex] = activity;
          updatedStage.serviceFlowActivities = updatedActivities;
          const newStages = [...prevList];
          newStages[stageIndex] = updatedStage;
          return newStages;
        });
      },
      deleteActivity(stage: Stage, activityIndex: number) {
        setStages((prev) => {
          const prevList = prev ?? [];
          const stageIndex = prevList.findIndex((s) => s.name === stage.name);
          if (stageIndex === -1) {
            // Stage not found, return previous state
            return prevList;
          }
          const updatedStage = { ...prevList[stageIndex] };
          const updatedActivities = [
            ...(updatedStage.serviceFlowActivities ?? []),
          ];
          if (activityIndex < 0 || activityIndex >= updatedActivities.length) {
            // Activity index out of bounds, return previous state
            return prevList;
          }
          updatedActivities.splice(activityIndex, 1);
          updatedStage.serviceFlowActivities = updatedActivities;
          const newStages = [...prevList];
          newStages[stageIndex] = updatedStage;
          return newStages;
        });
      },
    }),
    []
  );

  return (
    <div className="container">
      <ul className="nav">
        {stages?.map((stage, index) => (
          <StageNavItem
            key={index}
            stage={stage}
            readOnly={readOnly}
            otherStageNames={stages
              .filter((s) => s !== stage)
              .map((s) => s.name)}
            onNameChange={(newName) => {
              setStages((prev) => {
                const prevList = prev ?? [];
                const updatedStages = [...prevList];
                updatedStages[index] = {
                  ...stage,
                  name: newName,
                };
                return updatedStages;
              });
            }}
            onDelete={() => {
              setStages((prev) => {
                const prevList = prev ?? [];
                const updatedStages = prevList.filter((_, i) => i !== index);
                return updatedStages;
              });
            }}
          />
        ))}
        {addingStage && (
          <li className="nav-item pending">
            <StageNameInput
              onDone={(stageName) => {
                setAddingStage(false);
                if (stageName) {
                  setStages((prev) => {
                    const prevList = prev ?? [];
                    if (prevList.find((s) => s.name === stageName)) {
                      // Stage with the same name already exists
                      showDialog({
                        type: "warn",
                        content: t(K.STAGE_NAME_EXISTS, { name: stageName }),
                      });
                      return prevList;
                    }
                    return [...prevList, { name: stageName }];
                  });
                }
              }}
            />
          </li>
        )}
        {!readOnly && (
          <li className="nav-add">
            <button
              className="btn-add-stage"
              onClick={() => setAddingStage(true)}
            >
              <WrappedIcon lib="antd" icon="plus" className="plus" />
              {t(K.ADD_STAGE)}
            </button>
          </li>
        )}
      </ul>
      <div className="lanes">
        {stages?.map((stage, index) => (
          <ul className="lane" key={index}>
            {stage.serviceFlowActivities?.map((activity, activityIndex) => (
              <li key={activityIndex}>
                <div
                  className="activity"
                  onClick={() => {
                    if (!readOnly) {
                      onEditActivity({ stage, activity, activityIndex });
                    }
                  }}
                >
                  <div className="title">{activity.name}</div>
                  <div className="assignee">
                    <WrappedIcon
                      lib="antd"
                      icon="user"
                      className="assignee-icon"
                    />
                    {getAIEmployeeName(activity.aiEmployeeId)}
                  </div>
                </div>
              </li>
            ))}
            {!readOnly && (
              <li>
                <button
                  className="btn-add-activity"
                  onClick={() => onAddActivity(stage)}
                >
                  <WrappedIcon lib="antd" icon="plus" />
                  {t(K.ADD_ACTIVITY)}
                </button>
              </li>
            )}
          </ul>
        ))}
      </div>
    </div>
  );
}

interface StageNameInputProps {
  onDone: (name: string) => void;
}

function StageNameInput({ onDone }: StageNameInputProps) {
  const compositionRef = useRef(false);

  return (
    <input
      className="input-new-stage"
      type="text"
      placeholder={t(K.PLEASE_ENTER_NAME)}
      autoFocus
      onCompositionStart={() => {
        compositionRef.current = true;
      }}
      onCompositionEnd={() => {
        compositionRef.current = false;
      }}
      onKeyDown={(e) => {
        if (compositionRef.current) {
          // Ignore key events during composition
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          const stageName = (e.target as HTMLInputElement).value.trim();
          onDone(stageName);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onDone("");
        }
      }}
      onBlur={(e) => {
        const stageName = e.target.value.trim();
        onDone(stageName);
      }}
    />
  );
}

interface StageNavItemProps {
  stage: Stage;
  otherStageNames: string[];
  readOnly?: boolean;
  onNameChange: (name: string) => void;
  onDelete: (stage: Stage) => void;
}

function StageNavItem({
  stage,
  otherStageNames,
  readOnly,
  onNameChange,
  onDelete,
}: StageNavItemProps) {
  const compositionRef = useRef(false);
  const popoverRef = useRef<Popover>(null);

  if (readOnly) {
    return (
      <li className="nav-item">
        <span className="nav-link">
          <span>{stage.name}</span>
        </span>
      </li>
    );
  }

  return (
    <li className="nav-item">
      <WrappedPopover
        trigger="click"
        placement="bottom"
        sync="width"
        arrow={false}
        distance={8}
        themeVariant="elevo"
        ref={popoverRef}
      >
        <button className="nav-link" slot="anchor">
          <span>{stage.name}</span>
        </button>
        <div className="stage-settings">
          <WrappedInput
            value={stage.name}
            themeVariant="elevo"
            onCompositionStart={() => {
              compositionRef.current = true;
            }}
            onCompositionEnd={() => {
              compositionRef.current = false;
            }}
            onBlur={(e) => {
              const newValue = (e.currentTarget as Input).value?.trim();
              if (newValue && newValue !== stage.name) {
                if (otherStageNames.includes(newValue)) {
                  // Stage with the same name already exists
                  showDialog({
                    type: "warn",
                    content: t(K.STAGE_NAME_EXISTS, { name: newValue }),
                  });
                  (e.currentTarget as Input).value = stage.name;
                } else {
                  onNameChange(newValue);
                }
              } else if (!newValue) {
                (e.currentTarget as Input).value = stage.name;
              }
            }}
            onKeyDown={(e) => {
              if (compositionRef.current) {
                // Ignore key events during composition
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                popoverRef.current!.active = false;
              }
            }}
          />
          <div className="divider" />
          <button
            onClick={async () => {
              popoverRef.current!.active = false;
              await showDialog({
                type: "delete",
                title: t(K.DELETE_STAGE),
                content: t(K.DELETE_STAGE_TIPS, { name: stage.name }),
              });
              onDelete(stage);
            }}
          >
            {t(K.DELETE)}
          </button>
        </div>
      </WrappedPopover>
    </li>
  );
}
