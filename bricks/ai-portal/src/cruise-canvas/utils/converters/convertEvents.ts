import type { Component, ViewWithInfo } from "./interfaces.js";
import type { BrickEventHandler, BrickEventsMap } from "@next-core/types";

export function convertEvents(component: Component, view: ViewWithInfo) {
  const eventListeners = view.eventListeners.filter(
    (handler) => handler.componentId === component.componentId
  );
  const events: BrickEventsMap = {};
  for (const eventListener of eventListeners) {
    switch (component.componentName) {
      case "table":
        switch (eventListener.event) {
          case "select": {
            const action = convertEventAction(eventListener.handler);
            if (action) {
              events["row.select.v2"] = action;
            }
            break;
          }
          case "sort": {
            const action = convertEventAction(eventListener.handler);
            if (action) {
              events["sort.change"] = action;
            }
            break;
          }
        }
        break;
      case "button":
        if (eventListener.event === "click") {
          const action = convertEventAction(eventListener.handler);
          if (action) {
            events.click = action;
          }
        }
        break;
      case "form-item":
        switch ((component.properties as { type: string }).type) {
          case "search":
            if (eventListener.event === "search") {
              const action = convertEventAction(eventListener.handler);
              if (action) {
                events.search = action;
              }
            }
            break;
          case "select":
            if (eventListener.event === "change") {
              const action = convertEventAction(eventListener.handler);
              if (action) {
                events["change.v2"] = action;
              }
            }
            break;
        }
        break;
      default: {
        const action = convertEventAction(eventListener.handler);
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
  eventDetailAccessor?: string
): BrickEventHandler | undefined {
  switch (handler?.action) {
    case "update_variable":
      return {
        action: "context.replace",
        args: [
          {
            name: handler.payload.name,
            value: Object.prototype.hasOwnProperty.call(
              handler.payload,
              "value"
            )
              ? handler.payload.value
              : (eventDetailAccessor ?? "<% EVENT.detail %>"),
          },
        ],
      };
    case "refresh_data_source":
      return {
        action: "context.refresh",
        args: [handler.payload.name],
      };
    case "call_api":
      return {
        useProvider: "basic.http-request",
        args: [
          "/api/mocks/api/call",
          {
            method: "POST",
            body: handler.payload,
          },
        ],
        callback: {
          success: [
            {
              action: "message.success",
              args: ["<% EVENT.detail %>"],
            },
            ...(handler.callback?.success
              ? ([convertEventAction(handler.callback.success)].filter(
                  Boolean
                ) as BrickEventHandler[])
              : []),
          ],
          error: {
            action: "handleHttpError",
          },
        },
      };
    case "call_component":
      return {
        target: `[data-component-id="${handler.payload.componentId}"]`,
        method: handler.payload.method,
        args: handler.payload.args,
      };
  }
}
