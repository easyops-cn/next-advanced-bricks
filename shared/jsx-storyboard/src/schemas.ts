/* eslint-disable @typescript-eslint/no-use-before-define */
import * as z from "zod";

export const DEFINE_VARIABLE = "defineVariable";
export const DEFINE_DATA_SOURCE = "defineDataSource";

export const EventHandlerOfUpdateVariable = z.strictObject({
  action: z.literal("update_variable"),
  payload: z.strictObject({
    name: z.string(),
    value: z.any(),
  }),
});

export const EventHandlerOfRefreshDataSource = z.strictObject({
  action: z.literal("refresh_data_source"),
  payload: z.strictObject({
    name: z.string(),
  }),
});

export const EventHandlerOfCallComponent = z.strictObject({
  action: z.literal("call_component"),
  payload: z.strictObject({
    componentId: z.string(),
    method: z.string(),
    args: z.array(z.any()).optional(),
  }),
});

export const EventHandlerOfShowMessage = z.strictObject({
  action: z.literal("show_message"),
  payload: z.strictObject({
    type: z.enum(["info", "success", "warn", "error"]),
    content: z.string(),
  }),
});

export const EventHandlerOfCallAPI = z.strictObject({
  action: z.literal("call_api"),
  payload: z.strictObject({
    api: z.string(),
    params: z.any().optional(),
  }),
  get callback() {
    return EventHandlerCallback.optional();
  },
});

export const EventHandler = z.union([
  EventHandlerOfUpdateVariable,
  EventHandlerOfRefreshDataSource,
  EventHandlerOfCallAPI,
  EventHandlerOfCallComponent,
  EventHandlerOfShowMessage,
]);

export const OneOrMoreEventHandlers = z.union([
  EventHandler,
  z.array(EventHandler),
]);

export const EventHandlerCallback = z.strictObject({
  success: OneOrMoreEventHandlers.optional(),
  error: OneOrMoreEventHandlers.optional(),
  finally: OneOrMoreEventHandlers.optional(),
});
