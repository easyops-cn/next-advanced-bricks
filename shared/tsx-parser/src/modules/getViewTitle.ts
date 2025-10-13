import type { ParsedComponent } from "./interfaces.js";
import { isExpressionString, isOfficialComponent } from "./validations.js";

export function getViewTitle(component: ParsedComponent): string | undefined {
  const view = component.children?.find((comp) =>
    isOfficialComponent(comp, "View")
  );
  const viewTitle = view?.properties?.title;
  if (typeof viewTitle === "string" && !isExpressionString(viewTitle)) {
    return viewTitle;
  }
}
