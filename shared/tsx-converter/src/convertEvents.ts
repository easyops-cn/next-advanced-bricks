import type { BrickEventHandler, BrickEventsMap } from "@next-core/types";
import type { Component, EventHandler } from "@next-shared/tsx-parser";
import type { ConvertOptions } from "./interfaces.js";

export function convertEvents(component: Component, options: ConvertOptions) {
  const events: BrickEventsMap = {};
  for (const [event, handler] of Object.entries(component.events ?? {})) {
    switch (component.name) {
      case "Table":
        switch (event) {
          case "select": {
            const action = convertEventHandlers(handler, options);
            if (action) {
              events["row.select.v2"] = action;
            }
            break;
          }
          case "sort": {
            const action = convertEventHandlers(handler, options);
            if (action) {
              events["sort.change"] = action;
            }
            break;
          }
          case "paginate": {
            const action = convertEventHandlers(handler, options);
            if (action) {
              events["page.change"] = action;
            }
            break;
          }
        }
        break;
      case "Button":
        if (event === "click") {
          const action = convertEventHandlers(handler, options);
          if (action) {
            events.click = action;
          }
        }
        break;
      case "Search":
        if (event === "search") {
          const action = convertEventHandlers(handler, options);
          if (action) {
            events.search = action;
          }
        }
        break;
      case "Select":
        if (event === "change") {
          const action = convertEventHandlers(handler, options);
          if (action) {
            events["change.v2"] = action;
          }
        }
        break;
      default: {
        const action = convertEventHandlers(handler, options);
        if (action) {
          events[event] = action;
        }
      }
    }
  }
  return Object.keys(events).length > 0 ? events : undefined;
}

export function convertEventHandlers(
  handler: EventHandler | EventHandler[] | null,
  options: ConvertOptions
): BrickEventHandler[] | undefined {
  if (!handler) {
    return;
  }
  const list = (Array.isArray(handler) ? handler : [handler])
    .map((hdl) => convertEventHandler(hdl, options))
    .filter(Boolean) as BrickEventHandler[];
  return list.length > 0 ? list : undefined;
}

function convertEventHandler(
  handler: EventHandler,
  options: ConvertOptions
): BrickEventHandler | undefined {
  switch (handler?.action) {
    case "update_variable":
      return {
        action:
          handler.payload.scope === "template" ? "state.set" : "context.set",
        args: [handler.payload.name, handler.payload.value],
      };
    case "refresh_data_source":
      return {
        action:
          handler.payload.scope === "template"
            ? "state.refresh"
            : "context.refresh",
        args: [handler.payload.name],
      };
    case "call_api": {
      const { api, http, tool, params, isRawProvider } = handler.payload;

      const success = handler.callback?.success
        ? convertEventHandlers(handler.callback.success, options)
        : undefined;

      const error = handler.callback?.error
        ? convertEventHandlers(handler.callback.error, options)
        : undefined;

      return {
        ...(isRawProvider
          ? {
              useProvider: api,
              args: params,
            }
          : http
            ? {
                useProvider: "basic.http-request",
                args: [api, params],
              }
            : tool
              ? {
                  useProvider: "ai-portal.call-tool",
                  args: [tool, params],
                }
              : {
                  useProvider: `${api}${api.includes(":") ? "" : ":*"}`,
                  params,
                }),
        callback: {
          ...(success && { success }),
          ...(error && { error }),
        },
      };
    }
    case "call_ref":
      return {
        ...(handler.payload.scope === "template"
          ? {
              targetRef: handler.payload.ref,
            }
          : {
              target: `${options.rootId ? `[data-root-id="${options.rootId}"] ` : ""}[data-ref="${handler.payload.ref}"]`,
            }),
        method: handler.payload.method,
        args: handler.payload.args,
      };
    case "call_selector":
      return {
        target: handler.payload.selector,
        method: handler.payload.method,
        args: handler.payload.args,
      };
    case "navigate":
      return {
        action: `history.${handler.payload.method}`,
        args: handler.payload.args,
      };
    case "show_message":
      return {
        action: `message.${handler.payload.type}` as "message.info",
        args: [handler.payload.content],
      };
    case "handle_http_error":
      return {
        action: "handleHttpError",
        args: [handler.payload],
      };
    case "dispatch_event":
      return {
        action: "tpl.dispatchEvent",
        args: [handler.payload.type, { detail: handler.payload.detail }],
      };
    case "conditional":
      return {
        if: handler.payload.test,
        then: convertEventHandlers(handler.payload.consequent, options) ?? [],
        else: convertEventHandlers(handler.payload.alternate, options),
      };
  }
}
