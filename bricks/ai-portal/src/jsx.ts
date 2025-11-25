import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type {
  ActionButtons,
  ActionButtonsProps,
  ActionItem,
} from "./action-buttons";
import type {
  ActivityTimeline,
  ActivityTimelineProps,
} from "./activity-timeline";
import type { AIAgents, AIAgentsProps } from "./ai-agents";
import type { AIEmployees, AIEmployeesProps } from "./ai-employees";
import type { BlankState, BlankStateProps } from "./blank-state";
import type { ChatBox, ChatBoxProps } from "./chat-box";
import type { ChatInput, ChatInputProps } from "./chat-input";
import type {
  ChatStream,
  ChatStreamProps,
  ConversationDetail,
} from "./chat-stream";
import type { CruiseCanvas, CruiseCanvasProps } from "./cruise-canvas";
import type {
  DropdownSelect,
  DropdownSelectProps,
  DropdownOptions,
} from "./dropdown-select";
import type { ElevoCard, ElevoCardProps } from "./elevo-card";
import type { ElevoLogo } from "./elevo-logo";
import type {
  ActionClickDetail,
  ElevoSidebar,
  ElevoSidebarProps,
  ProjectActionClickDetail,
} from "./elevo-sidebar";
import type { FlowTabs, FlowTabsProps } from "./flow-tabs";
import type { GanttChart, GanttChartProps } from "./gantt-chart";
import type { GanttNode } from "./gantt-chart/interfaces";
import type { GoalCardList, GoalCardListProps } from "./goal-card-list";
import type { HomeContainer, HomeContainerProps } from "./home-container";
import type { IconButton, IconButtonProps } from "./icon-button";
import type { McpTools, McpToolsProps } from "./mcp-tools";
import type {
  NoticeDropdown,
  NoticeDropdownProps,
  NoticeItem,
} from "./notice-dropdown";
import type { NoticeList, NoticeListProps } from "./notice-list";
import type { PageContainer, PageContainerProps } from "./page-container";
import type {
  PreviewContainer,
  PreviewContainerProps,
} from "./preview-container";
import type {
  ProjectConversations,
  ProjectConversationsProps,
  ActionClickDetail as PCActionClickDetail,
  Conversation,
} from "./project-conversations";
import type {
  Knowledge,
  ProjectKnowledges,
  ProjectKnowledgesProps,
} from "./project-knowledges";
import type { RunningFlow, RunningFlowProps } from "./running-flow";
import type { ShowCase, ShowCaseProps } from "./show-case";
import type { ShowCases, ShowCasesProps } from "./show-cases";
import type {
  EditActivityDetail,
  Stage,
  StageFlow,
  StageFlowProps,
} from "./stage-flow";
import type {
  StatWithMiniChart,
  StatWithMiniChartProps,
} from "./stat-with-mini-chart";
import type { StickyContainer, StickyContainerProps } from "./sticky-container";
import type { Tab, TabList, TabListProps } from "./tab-list";
import type { ChatPayload } from "./shared/interfaces";
import type { FeedbackDetail } from "./cruise-canvas/interfaces";
import type { GoalItem } from "./goal-card-list/CardItem/CardItem";
import type { PersonalActionClickDetail } from "./elevo-sidebar/ChatHistory";
import type { ChatPanel, ChatPanelProps } from "./chat-panel";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "ai-portal--action-buttons": DetailedHTMLProps<
        HTMLAttributes<ActionButtons>,
        ActionButtons
      > &
        ActionButtonsProps & {
          onChange?: (event: CustomEvent<ActionItem | null>) => void;
        };

      "ai-portal--activity-timeline": DetailedHTMLProps<
        HTMLAttributes<ActivityTimeline>,
        ActivityTimeline
      > &
        ActivityTimelineProps;

      "ai-portal--ai-agents": DetailedHTMLProps<
        HTMLAttributes<AIAgents>,
        AIAgents
      > &
        AIAgentsProps;

      "ai-portal--ai-employees": DetailedHTMLProps<
        HTMLAttributes<AIEmployees>,
        AIEmployees
      > &
        AIEmployeesProps;

      "ai-portal--blank-state": DetailedHTMLProps<
        HTMLAttributes<BlankState>,
        BlankState
      > &
        BlankStateProps;

      "ai-portal--chat-box": DetailedHTMLProps<
        HTMLAttributes<ChatBox>,
        ChatBox
      > &
        ChatBoxProps & {
          onChatSubmit?: (event: CustomEvent<ChatPayload>) => void;
        };

      "ai-portal--chat-input": DetailedHTMLProps<
        HTMLAttributes<ChatInput>,
        ChatInput
      > &
        ChatInputProps & {
          onChatSubmit?: (event: CustomEvent<ChatPayload>) => void;
        };

      "ai-portal--chat-stream": DetailedHTMLProps<
        HTMLAttributes<ChatStream>,
        ChatStream
      > &
        ChatStreamProps & {
          onSplitChange?: (event: CustomEvent<boolean>) => void;
          onShare?: (event: CustomEvent<void>) => void;
          onTerminate?: (event: CustomEvent<void>) => void;
          onFeedbackSubmit?: (event: CustomEvent<FeedbackDetail>) => void;
          onFeedbackOnView?: (event: CustomEvent<string>) => void;
          onUiSwitch?: (event: CustomEvent<"canvas" | "chat">) => void;
          onDetailChange?: (event: CustomEvent<ConversationDetail>) => void;
        };

      "ai-portal--cruise-canvas": DetailedHTMLProps<
        HTMLAttributes<CruiseCanvas>,
        CruiseCanvas
      > &
        CruiseCanvasProps & {
          onShare?: (event: CustomEvent<void>) => void;
          onTerminate?: (event: CustomEvent<void>) => void;
          onFeedbackSubmit?: (event: CustomEvent<FeedbackDetail>) => void;
          onFeedbackOnView?: (event: CustomEvent<string>) => void;
          onUiSwitch?: (event: CustomEvent<"canvas" | "chat">) => void;
          onDetailChange?: (event: CustomEvent<ConversationDetail>) => void;
        };

      "ai-portal--dropdown-select": DetailedHTMLProps<
        HTMLAttributes<DropdownSelect>,
        DropdownSelect
      > &
        DropdownSelectProps & {
          onChange?: (event: CustomEvent<DropdownOptions>) => void;
        };

      "ai-portal--elevo-card": DetailedHTMLProps<
        HTMLAttributes<ElevoCard>,
        ElevoCard
      > &
        ElevoCardProps;

      "ai-portal--elevo-logo": DetailedHTMLProps<
        HTMLAttributes<ElevoLogo>,
        ElevoLogo
      >;

      "ai-portal--elevo-sidebar": DetailedHTMLProps<
        HTMLAttributes<ElevoSidebar>,
        ElevoSidebar
      > &
        ElevoSidebarProps & {
          onLogout?: () => void;
          onAddProject?: () => void;
          onActionClick?: (event: CustomEvent<ActionClickDetail>) => void;
          onProjectActionClick?: (
            event: CustomEvent<ProjectActionClickDetail>
          ) => void;
          onAddServiceflow?: (event: CustomEvent<void>) => void;
          onPersonalActionClick?: (
            event: CustomEvent<PersonalActionClickDetail>
          ) => void;
        };

      "ai-portal--flow-tabs": DetailedHTMLProps<
        HTMLAttributes<FlowTabs>,
        FlowTabs
      > &
        FlowTabsProps & {
          onTabClick?: (event: CustomEvent<Tab>) => void;
        };

      "ai-portal--gantt-chart": DetailedHTMLProps<
        HTMLAttributes<GanttChart>,
        GanttChart
      > &
        GanttChartProps & {
          onNodeClick?: (event: CustomEvent<GanttNode>) => void;
          onFullscreenClick?: (event: CustomEvent<void>) => void;
        };

      "ai-portal--goal-card-list": DetailedHTMLProps<
        HTMLAttributes<GoalCardList>,
        GoalCardList
      > &
        GoalCardListProps & {
          onItemClick?: (event: CustomEvent<GoalItem>) => void;
          onItemStatusChange?: (event: CustomEvent<GoalItem>) => void;
          onItemTitleChange?: (event: CustomEvent<GoalItem>) => void;
          onItemNewChat?: (event: CustomEvent<GoalItem>) => void;
        };

      "ai-portal--home-container": DetailedHTMLProps<
        HTMLAttributes<HomeContainer>,
        HomeContainer
      > &
        HomeContainerProps;

      "ai-portal--icon-button": DetailedHTMLProps<
        HTMLAttributes<IconButton>,
        IconButton
      > &
        IconButtonProps;

      "ai-portal--mcp-tools": DetailedHTMLProps<
        HTMLAttributes<McpTools>,
        McpTools
      > &
        McpToolsProps;

      "ai-portal--notice-dropdown": DetailedHTMLProps<
        HTMLAttributes<NoticeDropdown>,
        NoticeDropdown
      > &
        NoticeDropdownProps & {
          onMarkAllRead?: (event: CustomEvent<void>) => void;
          onNoticeClick?: (event: CustomEvent<NoticeItem>) => void;
        };

      "ai-portal--notice-list": DetailedHTMLProps<
        HTMLAttributes<NoticeList>,
        NoticeList
      > &
        NoticeListProps & {
          onNoticeClick?: (event: CustomEvent<NoticeItem>) => void;
          onMarkItemsRead?: (event: CustomEvent<NoticeItem[]>) => void;
          onMarkAllRead?: (event: CustomEvent<void>) => void;
        };

      "ai-portal--page-container": DetailedHTMLProps<
        HTMLAttributes<PageContainer>,
        PageContainer
      > &
        PageContainerProps;

      "ai-portal--preview-container": DetailedHTMLProps<
        HTMLAttributes<PreviewContainer>,
        PreviewContainer
      > &
        PreviewContainerProps;

      "ai-portal--project-conversations": DetailedHTMLProps<
        HTMLAttributes<ProjectConversations>,
        ProjectConversations
      > &
        ProjectConversationsProps & {
          onActionClick?: (event: CustomEvent<PCActionClickDetail>) => void;
          onGoalClick?: (event: CustomEvent<Conversation>) => void;
        };

      "ai-portal--project-knowledges": DetailedHTMLProps<
        HTMLAttributes<ProjectKnowledges>,
        ProjectKnowledges
      > &
        ProjectKnowledgesProps & {
          onActionClick?: (event: CustomEvent<ActionClickDetail>) => void;
          onItemClick?: (event: CustomEvent<Knowledge>) => void;
        };

      "ai-portal--running-flow": DetailedHTMLProps<
        HTMLAttributes<RunningFlow>,
        RunningFlow
      > &
        RunningFlowProps & {
          onActiveChange?: (event: CustomEvent<string | null>) => void;
        };

      "ai-portal--show-case": DetailedHTMLProps<
        HTMLAttributes<ShowCase>,
        ShowCase
      > &
        ShowCaseProps;

      "ai-portal--show-cases": DetailedHTMLProps<
        HTMLAttributes<ShowCases>,
        ShowCases
      > &
        ShowCasesProps;

      "ai-portal--stage-flow": DetailedHTMLProps<
        HTMLAttributes<StageFlow>,
        StageFlow
      > &
        StageFlowProps & {
          onChange?: (event: CustomEvent<Stage[]>) => void;
          onAddActivity?: (event: CustomEvent<{ stage: Stage }>) => void;
          onEditActivity?: (event: CustomEvent<EditActivityDetail>) => void;
        };

      "ai-portal--stat-with-mini-chart": DetailedHTMLProps<
        HTMLAttributes<StatWithMiniChart>,
        StatWithMiniChart
      > &
        StatWithMiniChartProps;

      "ai-portal--sticky-container": DetailedHTMLProps<
        HTMLAttributes<StickyContainer>,
        StickyContainer
      > &
        StickyContainerProps;

      "ai-portal--tab-list": DetailedHTMLProps<
        HTMLAttributes<TabList>,
        TabList
      > &
        TabListProps & {
          onTabClick?: (event: CustomEvent<Tab>) => void;
        };
      "ai-portal--chat-panel": DetailedHTMLProps<
        HTMLAttributes<ChatPanel>,
        ChatPanel
      > &
        Omit<ChatPanelProps, "help"> & {
          help?: {
            render: () => React.ReactNode;
          };
        };
    }
  }
}
