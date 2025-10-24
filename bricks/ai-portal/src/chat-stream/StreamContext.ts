import { createContext, type Dispatch } from "react";
import type { ActiveDetail } from "../shared/interfaces";

export interface StreamContextValue {
  lastDetail: ActiveDetail | null;
  setUserClosedAside: Dispatch<React.SetStateAction<boolean>>;
}

export const StreamContext = createContext<StreamContextValue>({
  lastDetail: null,
  setUserClosedAside: () => {},
});
