import React, { createElement } from "react";
import { customEditors } from "@next-core/runtime";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { EditorComponentProps } from "@next-bricks/visual-builder/property-editor";
import { eoSubmitButtonsSchema } from "./eoSubmitButton.schema";

function EoSubmitButtonsComponent(
  props: EditorComponentProps
): React.ReactElement {
  const { SchemaFieldComponent, formilySchemaFormatter, advancedMode } = props;

  return createElement(SchemaFieldComponent, {
    schema: formilySchemaFormatter(eoSubmitButtonsSchema, advancedMode),
  });
}

customEditors.define("eo-submit-buttons", EoSubmitButtonsComponent);