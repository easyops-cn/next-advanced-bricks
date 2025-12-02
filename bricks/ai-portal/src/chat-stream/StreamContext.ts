import { createContext, type Dispatch } from "react";
import type { ActiveDetail } from "../shared/interfaces";

export interface StreamContextValue {
  lastDetail: ActiveDetail | null;
  setUserClosedAside: Dispatch<React.SetStateAction<boolean>>;
  toggleAutoScroll: (enabled: boolean) => void;
}

export const StreamContext = createContext<StreamContextValue>({
  lastDetail: null,
  setUserClosedAside: () => {},
  toggleAutoScroll: () => {},
});
