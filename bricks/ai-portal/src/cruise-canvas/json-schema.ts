export type JSONSchema =
  | JSONSchemaString
  | JSONSchemaNumber
  | JSONSchemaBoolean
  | JSONSchemaNull
  | JSONSchemaObject
  | JSONSchemaArray;

export interface JSONSchemaBase {
  type: string;
  description?: string;
}

export interface JSONSchemaString extends JSONSchemaBase {
  type: "string";
}

export interface JSONSchemaNumber extends JSONSchemaBase {
  type: "number";
}

export interface JSONSchemaBoolean extends JSONSchemaBase {
  type: "boolean";
}

export interface JSONSchemaNull extends JSONSchemaBase {
  type: "null";
}

export interface JSONSchemaObject extends JSONSchemaBase {
  type: "object";
  properties: Record<string, JSONSchema>;
  required?: string[];
}

export interface JSONSchemaArray extends JSONSchemaBase {
  type: "array";
  items: JSONSchema;
}
