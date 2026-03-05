import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type {
  EoUserOrUserGroupSelect,
  EoUserOrUserGroupSelectProps,
} from "./user-or-user-group-select";
import type {
  EoCmdbInstanceSelect,
  EoCmdbInstanceSelectProps,
} from "./cmdb-instance-select";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "eo-user-or-user-group-select": DetailedHTMLProps<
        HTMLAttributes<EoUserOrUserGroupSelect>,
        EoUserOrUserGroupSelect
      > &
        EoUserOrUserGroupSelectProps & {
          onChange?: (event: CustomEvent<string[]>) => void;
        };
      "eo-cmdb-instance-select": DetailedHTMLProps<
        HTMLAttributes<EoCmdbInstanceSelect>,
        EoCmdbInstanceSelect
      > &
        EoCmdbInstanceSelectProps & {
          onChange?: (event: CustomEvent<string[]>) => void;
        };
    }
  }
}
