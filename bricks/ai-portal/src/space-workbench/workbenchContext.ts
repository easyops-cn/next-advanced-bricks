import { createContext } from "react";
import { SpaceDetail } from "./interfaces";
import type { UploadOptions } from "../shared/interfaces";

interface WorkbenchContextProps {
  spaceDetail: SpaceDetail;
  uploadOptions?: UploadOptions;
}
export const WorkbenchContext = createContext<WorkbenchContextProps>(
  {} as WorkbenchContextProps
);
