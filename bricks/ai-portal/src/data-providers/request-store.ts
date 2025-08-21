import { createProviderClass } from "@next-core/utils/general";
import type { RequestStore } from "../shared/interfaces";

let store: RequestStore | null = null;

export function saveRequestStore(value: RequestStore): void {
  store = value;
}

export function loadRequestStore(): RequestStore | null {
  const value = store;
  store = null;
  return value;
}

export function clearRequestStore(): void {
  store = null;
}

customElements.define(
  "ai-portal.save-request-store",
  createProviderClass(saveRequestStore)
);

customElements.define(
  "ai-portal.load-request-store",
  createProviderClass(loadRequestStore)
);

customElements.define(
  "ai-portal.clear-request-store",
  createProviderClass(clearRequestStore)
);
