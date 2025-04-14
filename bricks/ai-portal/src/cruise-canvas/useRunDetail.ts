import { useEffect, useState } from "react";
import { createSSEStream } from "@next-core/utils/general";
import { fetchRunDetail, resetFetchRunDetail, type RunDetail } from "./fetchRunDetail";

export function useRunDetail(taskId: string | undefined) {
  // Poll run detail until it is finished
  const [runDetail, setRunDetail] = useState<RunDetail | null>(null);

  useEffect(() => {
    setRunDetail(null);
    // resetFetchRunDetail();
    if (!taskId) {
      return;
    }

    (async () => {
      const request = await createSSEStream(
        `/api/mocks/task/get?${new URLSearchParams({ id: taskId })}`
      );
      const stream = await request;
      for await (const value of stream) {
        console.log(value);
      }
    })();

    // const pollRunDetail = async () => {
    //   const detail = await fetchRunDetail(taskId);
    //   setRunDetail(detail);

    //   if (!detail.finished) {
    //     let delay: number;
    //     switch (detail.nodes[detail.nodes.length - 1].type) {
    //       case "group":
    //         delay = 100;
    //         break;
    //       case "instruction":
    //         delay = 4000;
    //         break;
    //       default:
    //         delay = 2000;
    //     }
    //     setTimeout(pollRunDetail, delay);
    //   }
    // };

    // pollRunDetail();
  }, [taskId]);

  return runDetail;
}
