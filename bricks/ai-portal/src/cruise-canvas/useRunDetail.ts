import { useEffect, useState } from "react";
import { fetchRunDetail, resetFetchRunDetail, type RunDetail } from "./fetchRunDetail";

export function useRunDetail(runId: string | undefined, requirement: string | undefined) {
  // Poll run detail until it is finished
  const [runDetail, setRunDetail] = useState<RunDetail | null>(null);

  useEffect(() => {
    setRunDetail(null);
    resetFetchRunDetail();
    if (!runId || !requirement) {
      return;
    }

    const pollRunDetail = async () => {
      const detail = await fetchRunDetail(runId, requirement);
      setRunDetail(detail);

      if (!detail.finished) {
        let delay: number;
        switch (detail.nodes[detail.nodes.length - 1].type) {
          case "group":
            delay = 100;
            break;
          case "instruction":
            delay = 4000;
            break;
          default:
            delay = 2000;
        }
        setTimeout(pollRunDetail, delay);
      }
    };

    pollRunDetail();
  }, [runId, requirement]);

  return runDetail;
}
