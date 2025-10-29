import { getBasePath } from "@next-core/runtime";

export function getImageUrl(uri: string): string {
  return new URL(uri, `${location.origin}${getBasePath()}`).toString();
}
