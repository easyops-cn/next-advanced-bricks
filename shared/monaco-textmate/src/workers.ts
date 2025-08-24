self.MonacoEnvironment = {
  getWorker: function (workerId: string, label: string) {
    switch (label) {
      case "json":
        return new Worker(
          /* webpackChunkName: "json.worker" */
          new URL(
            "monaco-editor/esm/vs/language/json/json.worker.js",
            import.meta.url
          )
        );
      case "css":
      case "scss":
      case "less":
        /* webpackChunkName: "css.worker" */
        return new Worker(
          new URL(
            "monaco-editor/esm/vs/language/css/css.worker.js",
            import.meta.url
          )
        );
      case "html":
      case "handlebars":
      case "razor":
        return new Worker(
          /* webpackChunkName: "html.worker" */
          new URL(
            "monaco-editor/esm/vs/language/html/html.worker.js",
            import.meta.url
          )
        );
      case "typescript":
      case "javascript":
        return new Worker(
          /* webpackChunkName: "ts.worker" */
          new URL(
            "monaco-editor/esm/vs/language/typescript/ts.worker.js",
            import.meta.url
          )
        );
      default:
        return new Worker(
          /* webpackChunkName: "editor.worker" */
          new URL(
            "monaco-editor/esm/vs/editor/editor.worker.js",
            import.meta.url
          )
        );
    }
  },
};
