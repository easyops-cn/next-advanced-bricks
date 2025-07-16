import type {
  Component,
  ConvertViewOptions,
  ViewWithInfo,
} from "./interfaces.js";
import type { BrickEventHandler, BrickEventsMap } from "@next-core/types";

export function convertEvents(
  component: Component,
  view: ViewWithInfo,
  options: ConvertViewOptions
) {
  const eventListeners = view.eventListeners.filter(
    (handler) => handler.componentId === component.componentId
  );
  const events: BrickEventsMap = {};
  for (const eventListener of eventListeners) {
    switch (component.componentName) {
      case "table":
        switch (eventListener.event) {
          case "select": {
            const action = convertEventAction(eventListener.handler, options);
            if (action) {
              events["row.select.v2"] = action;
            }
            break;
          }
          case "sort": {
            const action = convertEventAction(eventListener.handler, options);
            if (action) {
              events["sort.change"] = action;
            }
            break;
          }
          case "paginate": {
            const action = convertEventAction(eventListener.handler, options);
            if (action) {
              events["page.change"] = action;
            }
            break;
          }
        }
        break;
      case "button":
        if (eventListener.event === "click") {
          const action = convertEventAction(eventListener.handler, options);
          if (action) {
            events.click = action;
          }
        }
        break;
      case "form-item":
        switch ((component.properties as { type: string }).type) {
          case "search":
            if (eventListener.event === "search") {
              const action = convertEventAction(eventListener.handler, options);
              if (action) {
                events.search = action;
              }
            }
            break;
          case "select":
            if (eventListener.event === "change") {
              const action = convertEventAction(eventListener.handler, options);
              if (action) {
                events["change.v2"] = action;
              }
            }
            break;
        }
        break;
      default: {
        const action = convertEventAction(eventListener.handler, options);
        if (action) {
          events[eventListener.event] = action;
        }
      }
    }
  }
  return Object.keys(events).length > 0 ? events : undefined;
}

function convertEventAction(
  handler: any,
  options: ConvertViewOptions,
  eventDetailAccessor?: string
): BrickEventHandler | undefined {
  switch (handler?.action) {
    case "update_variable":
      return {
        action: "context.replace",
        args: [
          handler.payload.name,
          Object.prototype.hasOwnProperty.call(handler.payload, "value")
            ? handler.payload.value
            : (eventDetailAccessor ?? "<% EVENT.detail %>"),
        ],
      };
    case "refresh_data_source":
      return {
        action: "context.refresh",
        args: [handler.payload.name],
      };
    case "call_api": {
      const { api, params } = handler.payload;

      const success = handler.callback?.success
        ? ([]
            .concat(handler.callback.success)
            .map((cb: any) => convertEventAction(cb, options))
            .filter(Boolean) as BrickEventHandler[])
        : undefined;

      return {
        useProvider: `${api.name}:${api.version}`,
        params,
        callback: {
          success: success?.length ? success : undefined,
          error: {
            action: "handleHttpError",
          },
        },
      };
    }
    case "call_component":
      return {
        target: `[data-root-id="${options.rootId}"] [data-component-id="${handler.payload.componentId}"]`,
        method: handler.payload.method,
        args: handler.payload.args,
      };
    case "show_message":
      return {
        action: `message.${handler.payload.type}` as "message.info",
        args: [handler.payload.content],
      };
  }
}
