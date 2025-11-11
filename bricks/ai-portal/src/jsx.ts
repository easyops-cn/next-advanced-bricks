import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { ActionButtons, ActionButtonsProps } from "./action-buttons";
import type {
  ActivityTimeline,
  ActivityTimelineProps,
} from "./activity-timeline";
import type { AIAgents, AIAgentsProps } from "./ai-agents";
import type { AIEmployees, AIEmployeesProps } from "./ai-employees";
import type { BlankState, BlankStateProps } from "./blank-state";
import type { ChatBox, ChatBoxProps } from "./chat-box";
import type { ChatInput, ChatInputProps } from "./chat-input";
import type { ChatStream, ChatStreamProps } from "./chat-stream";
import type { CruiseCanvas, CruiseCanvasProps } from "./cruise-canvas";
import type { DropdownSelect, DropdownSelectProps } from "./dropdown-select";
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
import type { GoalCardList, GoalCardListProps } from "./goal-card-list";
import type { HomeContainer } from "./home-container";
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
} from "./project-conversations";
import type {
  ProjectKnowledges,
  ProjectKnowledgesProps,
} from "./project-knowledges";
import type { RunningFlow, RunningFlowProps } from "./running-flow";
import type { ShowCase, ShowCaseProps } from "./show-case";
import type { ShowCases, ShowCasesProps } from "./show-cases";
import type { StageFlow, StageFlowProps } from "./stage-flow";
import type {
  StatWithMiniChart,
  StatWithMiniChartProps,
} from "./stat-with-mini-chart";
import type { StickyContainer, StickyContainerProps } from "./sticky-container";
import type { TabList, TabListProps } from "./tab-list";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "ai-portal--action-buttons": DetailedHTMLProps<
        HTMLAttributes<ActionButtons>,
        ActionButtons
      > &
        ActionButtonsProps;

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
        ChatBoxProps;

      "ai-portal--chat-input": DetailedHTMLProps<
        HTMLAttributes<ChatInput>,
        ChatInput
      > &
        ChatInputProps;

      "ai-portal--chat-stream": DetailedHTMLProps<
        HTMLAttributes<ChatStream>,
        ChatStream
      > &
        ChatStreamProps;

      "ai-portal--cruise-canvas": DetailedHTMLProps<
        HTMLAttributes<CruiseCanvas>,
        CruiseCanvas
      > &
        CruiseCanvasProps;

      "ai-portal--dropdown-select": DetailedHTMLProps<
        HTMLAttributes<DropdownSelect>,
        DropdownSelect
      > &
        DropdownSelectProps;

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
          onActionClick?: (event: CustomEvent<ActionClickDetail>) => void;
          onProjectActionClick?: (
            event: CustomEvent<ProjectActionClickDetail>
          ) => void;
        };

      "ai-portal--flow-tabs": DetailedHTMLProps<
        HTMLAttributes<FlowTabs>,
        FlowTabs
      > &
        FlowTabsProps;

      "ai-portal--gantt-chart": DetailedHTMLProps<
        HTMLAttributes<GanttChart>,
        GanttChart
      > &
        GanttChartProps;

      "ai-portal--goal-card-list": DetailedHTMLProps<
        HTMLAttributes<GoalCardList>,
        GoalCardList
      > &
        GoalCardListProps;

      "ai-portal--home-container": DetailedHTMLProps<
        HTMLAttributes<HomeContainer>,
        HomeContainer
      >;

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
        NoticeListProps;

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
        ProjectConversationsProps;

      "ai-portal--project-knowledges": DetailedHTMLProps<
        HTMLAttributes<ProjectKnowledges>,
        ProjectKnowledges
      > &
        ProjectKnowledgesProps;

      "ai-portal--running-flow": DetailedHTMLProps<
        HTMLAttributes<RunningFlow>,
        RunningFlow
      > &
        RunningFlowProps;

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
        StageFlowProps;

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
        TabListProps;
    }
  }
}
