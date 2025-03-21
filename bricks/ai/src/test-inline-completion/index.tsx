import React, { useEffect } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import styleText from "./styles.shadow.css";
// import { completion } from "./demo";
import { completion2 } from "./demo-2";

const { defineElement, property } = createDecorators();

export interface TestInlineCompletionProps {
  model?: string;
}

/**
 * 构件 `ai.test-inline-completion`
 */
export
@defineElement("ai.test-inline-completion", {
  styleTexts: [styleText],
})
class TestInlineCompletion
  extends ReactNextElement
  implements TestInlineCompletionProps
{
  @property()
  accessor model: string | undefined;

  render() {
    return <TestInlineCompletionComponent model={this.model} />;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TestInlineCompletionComponentProps
  extends TestInlineCompletionProps {
  // Define react event handlers here.
}

export function TestInlineCompletionComponent({
  model,
}: TestInlineCompletionComponentProps) {
  useEffect(() => {
    // completion({ model });
    completion2({ model });
  }, []);
  return <div>It works!</div>;
}
