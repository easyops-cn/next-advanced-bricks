import { get } from "lodash";

export function parseTemplate(
  template: string | undefined,
  context: Record<string, any>
) {
  return template?.replace(/{{(.*?)}}/g, (_match: string, key: string) => {
    const value = get(context, key.trim());
    return value;
  });
}
