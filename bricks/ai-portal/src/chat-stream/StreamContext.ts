import { createContext, type Dispatch } from "react";

export interface StreamContextValue {
  lastToolCallJobId: string | null;
  setUserClosedAside: Dispatch<React.SetStateAction<boolean>>;
}

export const StreamContext = createContext<StreamContextValue>({
  lastToolCallJobId: null,
  setUserClosedAside: () => {},
});
