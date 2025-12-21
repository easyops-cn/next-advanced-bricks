import { createContext } from "react";
import type { Activity } from "../../interfaces";

interface ConfigContextType {
  modifyActivity?: (name: string, newActivity: Activity) => void;
}
export const ConfigContext = createContext<ConfigContextType>({});
