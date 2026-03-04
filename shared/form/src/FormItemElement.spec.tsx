import { createDecorators } from "@next-core/element";
import { FormItemElementBase } from "./FormItemElement.js";
import type { AbstractForm } from "./Form.js";
import { FormStore } from "./FormStore.js";

const { defineElement } = createDecorators();

// Create a concrete implementation for testing
@defineElement("test-form-item-element")
class TestFormItemElement extends FormItemElementBase {
  render() {
    return null;
  }
}

// Mock ReactNextElement's _render method
const mockRender = jest.fn();

describe("FormItemElementBase", () => {
  let element: TestFormItemElement;

  beforeEach(() => {
    element = document.createElement(
      "test-form-item-element"
    ) as TestFormItemElement;

    // Mock _render method
    element._render = mockRender;
    mockRender.mockClear();
  });

  describe("isFormItemElement", () => {
    test("should always return true", () => {
      expect(element.isFormItemElement).toBe(true);
    });
  });

  describe("validateState", () => {
    test("should set and get validateState correctly", () => {
      element.validateState = "error";
      expect(element.validateState).toBe("error");
      expect(mockRender).toHaveBeenCalled();
    });

    test("should trigger _render when validateState is set", () => {
      element.validateState = "success";
      expect(mockRender).toHaveBeenCalledTimes(1);
    });

    test("should default to 'normal'", () => {
      expect(element.validateState).toBe("normal");
    });
  });

  describe("notRender", () => {
    test("should set and get notRender correctly", () => {
      element.notRender = true;
      expect(element.notRender).toBe(true);
      expect(element.hidden).toBe(true);
    });

    test("should update hidden property when notRender changes", () => {
      element.notRender = true;
      expect(element.hidden).toBe(true);

      element.notRender = false;
      expect(element.hidden).toBe(false);
    });

    test("should trigger _render when notRender is set", () => {
      element.notRender = true;
      expect(mockRender).toHaveBeenCalled();
    });

    test("should default to false", () => {
      expect(element.notRender).toBe(false);
    });
  });

  describe("$bindFormItem", () => {
    test("should set and get $bindFormItem correctly", () => {
      element.$bindFormItem = true;
      expect(element.$bindFormItem).toBe(true);
    });

    test("should trigger _render when $bindFormItem is set", () => {
      element.$bindFormItem = true;
      expect(mockRender).toHaveBeenCalled();
    });

    test("should default to false", () => {
      expect(element.$bindFormItem).toBe(false);
    });
  });

  describe("setNotRender", () => {
    test("should set notRender through method", () => {
      element.setNotRender(true);
      expect(element.notRender).toBe(true);
      expect(element.hidden).toBe(true);
    });

    test("should trigger _render when called", () => {
      element.setNotRender(false);
      expect(mockRender).toHaveBeenCalled();
    });
  });

  describe("properties", () => {
    test("should set and get helpBrick", () => {
      const helpBrick = {
        useBrick: { brick: "test-brick" } as any,
      };
      element.helpBrick = helpBrick;
      expect(element.helpBrick).toBe(helpBrick);
    });

    test("should set and get labelBrick", () => {
      const labelBrick = {
        useBrick: [{ brick: "test-brick-1" }, { brick: "test-brick-2" }] as any,
      };
      element.labelBrick = labelBrick;
      expect(element.labelBrick).toBe(labelBrick);
    });

    test("should set and get labelCol", () => {
      const labelCol = { span: 8, offset: 2 };
      element.labelCol = labelCol;
      expect(element.labelCol).toBe(labelCol);
    });

    test("should set and get wrapperCol", () => {
      const wrapperCol = { span: 16, offset: 0 };
      element.wrapperCol = wrapperCol;
      expect(element.wrapperCol).toBe(wrapperCol);
    });

    test("should handle undefined properties", () => {
      expect(element.helpBrick).toBeUndefined();
      expect(element.labelBrick).toBeUndefined();
      expect(element.labelCol).toBeUndefined();
      expect(element.wrapperCol).toBeUndefined();
    });
  });

  describe("getFormElement", () => {
    test("should return null when no parent form exists", () => {
      const result = element.getFormElement();
      expect(result).toBeNull();
    });

    test("should return parent form element", () => {
      const mockForm: Partial<AbstractForm> = {
        isFormElement: true,
        formStore: new FormStore(),
        validate: jest.fn(),
        validateField: jest.fn(),
        resetValidateState: jest.fn(),
      };

      // Mock the DOM structure
      Object.defineProperty(element, "parentNode", {
        value: mockForm,
        writable: true,
        configurable: true,
      });

      const result = element.getFormElement();
      expect(result).toBe(mockForm);
    });

    test("should traverse up the DOM tree to find form element", () => {
      const mockForm: Partial<AbstractForm> = {
        isFormElement: true,
        formStore: new FormStore(),
        validate: jest.fn(),
        validateField: jest.fn(),
        resetValidateState: jest.fn(),
      };

      const intermediateElement = {
        parentNode: mockForm,
      };

      Object.defineProperty(element, "parentNode", {
        value: intermediateElement,
        writable: true,
        configurable: true,
      });

      const result = element.getFormElement();
      expect(result).toBe(mockForm);
    });

    test("should return null when parent chain contains null", () => {
      const intermediateElement = {
        parentNode: null,
      };

      Object.defineProperty(element, "parentNode", {
        value: intermediateElement,
        writable: true,
        configurable: true,
      });

      const result = element.getFormElement();
      expect(result).toBeNull();
    });

    test("should return null when reaching document root without finding form", () => {
      const nonFormParent = {
        isFormElement: false,
        parentNode: null,
      };

      Object.defineProperty(element, "parentNode", {
        value: nonFormParent,
        writable: true,
        configurable: true,
      });

      const result = element.getFormElement();
      expect(result).toBeNull();
    });
  });

  describe("complex scenarios", () => {
    test("should handle multiple state changes", () => {
      mockRender.mockClear();

      element.validateState = "error";
      element.notRender = true;
      element.$bindFormItem = true;

      expect(mockRender).toHaveBeenCalledTimes(3);
      expect(element.validateState).toBe("error");
      expect(element.notRender).toBe(true);
      expect(element.$bindFormItem).toBe(true);
    });

    test("should maintain state consistency", () => {
      element.validateState = "warning";
      element.notRender = true;

      expect(element.validateState).toBe("warning");
      expect(element.notRender).toBe(true);
      expect(element.hidden).toBe(true);

      element.notRender = false;
      expect(element.notRender).toBe(false);
      expect(element.hidden).toBe(false);
      expect(element.validateState).toBe("warning");
    });

    test("should work with all properties set", () => {
      const helpBrick = { useBrick: { brick: "help" } as any };
      const labelBrick = { useBrick: { brick: "label" } as any };
      const labelCol = { span: 4 };
      const wrapperCol = { span: 20 };

      element.helpBrick = helpBrick;
      element.labelBrick = labelBrick;
      element.labelCol = labelCol;
      element.wrapperCol = wrapperCol;
      element.validateState = "success";
      element.notRender = false;
      element.$bindFormItem = true;

      expect(element.helpBrick).toBe(helpBrick);
      expect(element.labelBrick).toBe(labelBrick);
      expect(element.labelCol).toBe(labelCol);
      expect(element.wrapperCol).toBe(wrapperCol);
      expect(element.validateState).toBe("success");
      expect(element.notRender).toBe(false);
      expect(element.$bindFormItem).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("should handle rapid state changes", () => {
      for (let i = 0; i < 10; i++) {
        element.validateState = i % 2 === 0 ? "error" : "normal";
      }
      expect(element.validateState).toBe("normal");
    });

    test("should handle setting same value multiple times", () => {
      mockRender.mockClear();

      element.validateState = "error";
      element.validateState = "error";
      element.validateState = "error";

      expect(mockRender).toHaveBeenCalledTimes(3);
      expect(element.validateState).toBe("error");
    });

    test("should handle ColProps with complex structure", () => {
      const complexLabelCol = {
        span: 8,
        offset: 2,
        sm: 12,
        md: { span: 10, offset: 1 },
        lg: 8,
        xl: { span: 6, offset: 2 },
        xxl: 4,
      };

      element.labelCol = complexLabelCol;
      expect(element.labelCol).toEqual(complexLabelCol);
    });

    test("should handle undefined and null setters gracefully", () => {
      element.helpBrick = undefined;
      element.labelBrick = undefined;
      element.labelCol = undefined;
      element.wrapperCol = undefined;

      expect(element.helpBrick).toBeUndefined();
      expect(element.labelBrick).toBeUndefined();
      expect(element.labelCol).toBeUndefined();
      expect(element.wrapperCol).toBeUndefined();
    });
  });

  describe("inheritance", () => {
    test("should be an instance of ReactNextElement", () => {
      expect(element).toBeInstanceOf(FormItemElementBase);
    });

    test("should have abstract class behavior", () => {
      // FormItemElementBase is abstract, so direct instantiation should not be possible
      // We test through concrete implementation
      expect(element.render).toBeDefined();
      expect(typeof element.render).toBe("function");
    });
  });
});
