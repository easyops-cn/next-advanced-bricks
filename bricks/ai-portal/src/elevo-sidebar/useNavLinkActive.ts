import { useEffect, useState } from "react";
import { getHistory, matchPath } from "@next-core/runtime";
import type { Location } from "history";

export function useNavLinkActive(
  url: string | null | undefined,
  activeIncludes?: string[]
) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!url) {
      setActive(false);
      return;
    }
    function checkLinkActive(loc: Location) {
      for (const path of [url!, ...(activeIncludes ?? [])]) {
        const matched = matchPath(loc.pathname, { path, exact: false });
        if (matched) {
          setActive(true);
          return;
        }
      }
      setActive(false);
    }
    const history = getHistory();
    checkLinkActive(history.location);
    return history.listen(checkLinkActive);
  }, [url, activeIncludes]);

  return active;
}
