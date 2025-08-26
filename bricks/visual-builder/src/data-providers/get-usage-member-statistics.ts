import { createProviderClass } from "@next-core/utils/general";
import {
  traverseStoryboardExpressions,
  collectAppGetMenuUsage,
  beforeVisitGlobalMember,
  collectMemberUsageInFunction,
  type MemberCallUsage,
  type MemberUsage,
} from "@next-core/utils/storyboard";

interface UsageStatistics {
  functions: string[];
  menus: string[];
}

interface FunctionItem {
  name: string;
  source: string;
}

interface Option {
  includesFnDeps?: boolean;
  fnList?: FunctionItem[];
}

export async function getUsageMemberStatistics(
  storyboardData: unknown,
  options?: Option
): Promise<UsageStatistics> {
  const { includesFnDeps = false, fnList } = options || {};
  const fnUsage: MemberUsage = {
    usedProperties: new Set(),
    hasNonStaticUsage: false,
  };
  const menuUsage: MemberCallUsage = {
    usedArgs: new Set(),
  };

  const collectFnUsage = beforeVisitGlobalMember(fnUsage, "FN");

  traverseStoryboardExpressions(
    storyboardData,
    (node, parent) => {
      // Collect FN calls using the complete logic of beforeVisitGlobalMember
      collectFnUsage(node, parent);

      // Collect APP.getMenu calls
      collectAppGetMenuUsage(menuUsage, node, parent);
    },
    {
      // Match expressions containing FN or APP.getMenu to avoid parsing irrelevant expressions
      matchExpressionString: (v: string) =>
        v.includes("FN") || v.includes("APP.getMenu"),
    }
  );

  // Build the final function list (including dependency functions)
  const allFunctions = new Set(fnUsage.usedProperties);

  if (includesFnDeps) {
    const matchedFnList = fnList.filter((fn) =>
      fnUsage.usedProperties.has(fn.name)
    );

    for (const fn of matchedFnList) {
      const deps = collectMemberUsageInFunction(fn, "FN", true);

      Array.from(deps)
        .filter((dep) => dep !== fn.name)
        .forEach((dep) => allFunctions.add(dep));
    }
  }

  return {
    functions: Array.from(allFunctions),
    menus: Array.from(menuUsage.usedArgs),
  };
}

customElements.define(
  "visual-builder.get-usage-member-statistics",
  createProviderClass(getUsageMemberStatistics)
);
