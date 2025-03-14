// istanbul ignore file
import { createProviderClass } from "@next-core/utils/general";
import promptOfAttachment from "./prompts/raw-form-attachment.md";
import promptOfBoolean from "./prompts/raw-form-boolean.md";
import promptOfDate from "./prompts/raw-form-date.md";
import promptOfEnum from "./prompts/raw-form-enum.md";
import promptOfEnums from "./prompts/raw-form-enums.md";
import promptOfIp from "./prompts/raw-form-ip.md";
import promptOfNumber from "./prompts/raw-form-number.md";
import promptOfString from "./prompts/raw-form-string.md";
import promptOfTime from "./prompts/raw-form-time.md";

export function getRawFormSystemPrompts(): Record<string, string> {
  return {
    attachment: promptOfAttachment,
    boolean: promptOfBoolean,
    date: promptOfDate,
    enum: promptOfEnum,
    enums: promptOfEnums,
    ip: promptOfIp,
    number: promptOfNumber,
    string: promptOfString,
    time: promptOfTime,
  };
}

customElements.define(
  "visual-builder.get-raw-form-system-prompts",
  createProviderClass(getRawFormSystemPrompts)
);
