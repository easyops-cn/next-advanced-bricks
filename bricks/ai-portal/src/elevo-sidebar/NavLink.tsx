import React, { useEffect, useState } from "react";
import { getHistory, matchPath } from "@next-core/runtime";
import type { Location } from "history";

export interface NavLinkProps {
  url?: string;
  activeIncludes?: string[];
  render: (props: { active: boolean }) => React.ReactElement;
}

export function NavLink({ url, activeIncludes, render }: NavLinkProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    function checkLinkActive(loc: Location) {
      if (!url) {
        setActive(false);
        return;
      }
      for (const path of [url, ...(activeIncludes ?? [])]) {
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

  return render({ active });
}
