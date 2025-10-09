import * as monaco from "monaco-editor";

export interface DataModelField {
  name: string;
  dataDefinition: DataDefinition;
}

/**
 * E.g. 1, member completions, such as to complete the member by `step.|`:
 *
 * ```yaml
 * step:
 *   - firstStep
 *   - secondStep
 * ```
 *
 * E.g. 2, completions with trigger character, such as to complete `action: |`:
 *
 * ```yaml
 * action:
 *   triggerCharacter: ":"
 *   completers:
 *     - label: console.log
 *     - label: alert
 * ```
 */
export type AdvancedCompleterMap = Record<
  string,
  {
    triggerCharacter: string;
    completers: monaco.languages.CompletionItem[];
  }
>;

export interface DataDefinition {
  name: string;
  type: string;
  fields?: DataDefinition[];
}

export interface ExtraLib {
  filePath: string;
  content: string;
  module?: boolean;
}

export interface ExtraMarker
  extends Omit<monaco.editor.IMarkerData, "severity"> {
  severity: "Hint" | "Info" | "Warning" | "Error";
}

export type MixedCompleter = MembersCompleter;

export interface MembersCompleter {
  type: "members";
  /** 键为对象名称，值为对象属性名列表 */
  members: Record<string, string[]>;
}
