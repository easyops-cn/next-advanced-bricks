import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

export let currentEditor: monaco.editor.IStandaloneCodeEditor | null = null;

export function switchEditor(
  editor: monaco.editor.IStandaloneCodeEditor
): boolean {
  if (currentEditor === editor) {
    return false;
  }
  currentEditor = editor;
  return true;
}

export function disposeEditor(
  editor: monaco.editor.IStandaloneCodeEditor
): void {
  if (currentEditor === editor) {
    currentEditor = null;
  }
  editor.getModel()?.dispose();
  editor.dispose();
}

export function isCurrentEditor(
  editor: monaco.editor.IStandaloneCodeEditor
): boolean {
  return currentEditor === editor;
}
