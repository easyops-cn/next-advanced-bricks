import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type {
  DescriptionItem,
  Descriptions,
  DescriptionsProps,
} from "./descriptions";
import type { GeneralAlert, GeneralAlertProps } from "./general-alert";
import type { CodeDisplay, CodeDisplayProps } from "./code-display";
import type {
  ChangeDetail,
  EoPagination,
  EoPaginationProps,
} from "./pagination";
import type { EoCardItem, EoCardItemProps } from "./card-item";
import type { EoDivider, EoDividerProps } from "./divider";
import type { EoInfoCardItem, EoInfoCardItemProps } from "./info-card-item";
import type { EoHumanizeTime, EoHumanizeTimeProps } from "./humanize-time";
import type {
  EoStatisticsCard,
  EoStatisticsCardProps,
} from "./statistics-card";
import type { EoLoadingStep, EoLoadingStepProps } from "./loading-step";
import type { EoCurrentTime, CurrentTimeProps } from "./current-time";
import type { EoCarouselText, EoCarouselTextProps } from "./carousel-text";
import type { CodeBlock, CodeBlockProps } from "./code-block";
import type { CodeWrapper, CodeWrapperProps } from "./code-wrapper";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "eo-descriptions": DetailedHTMLProps<
        HTMLAttributes<Descriptions>,
        Descriptions
      > &
        Omit<DescriptionsProps, "list"> & {
          list?: Array<
            Omit<DescriptionItem, "useBrick"> & {
              render?: (data: any) => React.ReactNode;
            }
          >;
        };

      "eo-alert": DetailedHTMLProps<
        HTMLAttributes<GeneralAlert>,
        GeneralAlert
      > &
        GeneralAlertProps;

      "eo-code-display": DetailedHTMLProps<
        HTMLAttributes<CodeDisplay>,
        CodeDisplay
      > &
        CodeDisplayProps;

      "eo-pagination": DetailedHTMLProps<
        HTMLAttributes<EoPagination>,
        EoPagination
      > &
        EoPaginationProps & {
          onChange?: (event: CustomEvent<ChangeDetail>) => void;
        };

      "eo-card-item": DetailedHTMLProps<
        HTMLAttributes<EoCardItem>,
        EoCardItem
      > &
        EoCardItemProps & {
          onClick?: (event: CustomEvent) => void;
          "onAction.click"?: (event: CustomEvent) => void;
        };

      "eo-divider": DetailedHTMLProps<HTMLAttributes<EoDivider>, EoDivider> &
        EoDividerProps;

      "eo-info-card-item": DetailedHTMLProps<
        HTMLAttributes<EoInfoCardItem>,
        EoInfoCardItem
      > &
        EoInfoCardItemProps;

      "eo-humanize-time": DetailedHTMLProps<
        HTMLAttributes<EoHumanizeTime>,
        EoHumanizeTime
      > &
        EoHumanizeTimeProps;

      "eo-statistics-card": DetailedHTMLProps<
        HTMLAttributes<EoStatisticsCard>,
        EoStatisticsCard
      > &
        EoStatisticsCardProps & {
          onClick?: (event: CustomEvent) => void;
        };

      "eo-loading-step": DetailedHTMLProps<
        HTMLAttributes<EoLoadingStep>,
        EoLoadingStep
      > &
        EoLoadingStepProps & {
          onOpen?: (event: CustomEvent<void>) => void;
          onClose?: (event: CustomEvent<void>) => void;
        };

      "eo-current-time": DetailedHTMLProps<
        HTMLAttributes<EoCurrentTime>,
        EoCurrentTime
      > &
        CurrentTimeProps;

      "eo-carousel-text": DetailedHTMLProps<
        HTMLAttributes<EoCarouselText>,
        EoCarouselText
      > &
        EoCarouselTextProps;

      "eo-code-block": DetailedHTMLProps<HTMLAttributes<CodeBlock>, CodeBlock> &
        CodeBlockProps;

      "presentational.code-wrapper": DetailedHTMLProps<
        HTMLAttributes<CodeWrapper>,
        CodeWrapper
      > &
        CodeWrapperProps;
    }
  }
}
