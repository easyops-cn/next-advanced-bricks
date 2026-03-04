import { FormStore } from "./FormStore";

describe("FormStore", () => {
  test("type number", () => {
    const store = new FormStore();
    store.setField("n", {
      name: "n",
      label: "count",
      validate: {
        type: "number",
        min: 1,
        max: 10,
      },
    });

    store.setInitValue({
      n: "",
    });

    const mockValidateFields = jest.fn();
    const result1 = store.validateFields(mockValidateFields);
    expect(mockValidateFields).toHaveBeenNthCalledWith(1, false, {
      n: "",
    });
    expect(result1).toEqual({ n: "" });

    store.setInitValue({
      n: "0",
    });

    const result2 = store.validateFields(mockValidateFields);
    expect(mockValidateFields).toHaveBeenNthCalledWith(2, true, [
      {
        name: "n",
        message: "count不能小于 1",
        type: "error",
      },
    ]);
    expect(result2).toBe(false);

    store.setInitValue({
      n: 12,
    });

    const result3 = store.validateFields(mockValidateFields);
    expect(mockValidateFields).toHaveBeenNthCalledWith(3, true, [
      {
        name: "n",
        message: "count不能大于 10",
        type: "error",
      },
    ]);
    expect(result3).toBe(false);

    store.setInitValue({
      n: "5",
    });

    const result4 = store.validateFields(mockValidateFields);
    expect(mockValidateFields).toHaveBeenNthCalledWith(4, false, {
      n: "5",
    });
    expect(result4).toEqual({ n: "5" });
  });

  test("general", () => {
    const store = new FormStore();

    store.setField("a", {
      name: "a",
      label: "字段A",
      validate: {
        required: true,
      },
    });

    const mockValidateFields = jest.fn();

    const result1 = store.validateFields(mockValidateFields);

    expect(mockValidateFields).toHaveBeenNthCalledWith(1, true, [
      { name: "a", message: "字段A为必填项", type: "error" },
    ]);

    expect(result1).toBe(false);

    store.setField("b", {
      name: "b",
      validate: {
        required: true,
      },
    });

    store.setInitValue({
      a: "hello",
      b: "",
    });

    const result2 = store.validateFields(mockValidateFields);

    expect(mockValidateFields).toHaveBeenNthCalledWith(2, true, [
      { name: "b", message: "b为必填项", type: "error" },
    ]);

    expect(result2).toBe(false);

    store.setInitValue({
      b: "world",
    });

    const result3 = store.validateFields(mockValidateFields);

    expect(store.getAllValues()).toEqual({ a: "hello", b: "world" });

    expect(mockValidateFields).toHaveBeenNthCalledWith(3, false, {
      a: "hello",
      b: "world",
    });
    expect(result3).toEqual({ a: "hello", b: "world" });

    store.setField("c", {
      name: "c",
      label: "校验测试字段",
      validate: {
        min: 5,
        max: 10,
        required: true,
        pattern: "\\d+",
      },
    });

    store.setInitValue({
      a: null,
      c: "12",
    });

    const result4 = store.validateFields(mockValidateFields);

    expect(mockValidateFields).toHaveBeenNthCalledWith(4, true, [
      { name: "a", message: "字段A为必填项", type: "error" },
      { name: "c", message: "校验测试字段至少包含 5 个字符", type: "error" },
    ]);
    expect(result4).toBe(false);

    store.setInitValue({
      a: 123,
      c: "12345678901",
    });

    const result5 = store.validateFields(mockValidateFields);

    expect(mockValidateFields).toHaveBeenNthCalledWith(5, true, [
      { name: "c", message: "校验测试字段不能超过 10 个字符", type: "error" },
    ]);
    expect(result5).toBe(false);

    store.setInitValue({
      a: 123,
      c: "abcdef",
    });

    store.validateFields(mockValidateFields);

    expect(mockValidateFields).toHaveBeenNthCalledWith(6, true, [
      { name: "c", message: "校验测试字段没有匹配正则 \\d+", type: "error" },
    ]);

    store.setInitValue({
      c: "123456",
    });

    store.validateFields(mockValidateFields);

    expect(mockValidateFields).toHaveBeenNthCalledWith(7, false, {
      a: 123,
      b: "world",
      c: "123456",
    });

    // not-render should skip
    store.setField("d-notRender", {
      name: "d-notRender",
      notRender: true,
      validate: {
        required: true,
      },
    });

    const result6 = store.validateFields(mockValidateFields);

    expect(mockValidateFields).toHaveBeenNthCalledWith(8, false, {
      a: 123,
      b: "world",
      c: "123456",
    });

    expect(result6).toEqual({
      a: 123,
      b: "world",
      c: "123456",
    });

    expect(store.getAllValues()).toEqual({
      a: 123,
      b: "world",
      c: "123456",
    });

    // update notRender to false
    store.setField("d-notRender", {
      name: "d-notRender",
      notRender: false,
      validate: {
        required: true,
      },
    });

    store.setInitValue({
      "d-notRender": "abc",
    });

    store.validateFields(mockValidateFields);

    expect(mockValidateFields).toHaveBeenNthCalledWith(9, false, {
      a: 123,
      b: "world",
      c: "123456",
      "d-notRender": "abc",
    });

    // not render to be true
    store.setField("d-notRender", {
      name: "d-notRender",
      notRender: true,
      validate: {
        required: true,
      },
    });

    // get Value should filter not-render item
    expect(store.getAllValues()).toEqual({
      a: 123,
      b: "world",
      c: "123456",
    });

    store.setField("validator-item", {
      name: "validator-item",
      label: "高级校验字段",
      validate: {
        validator: (value: any): string => (!value.name ? "名字不能为空" : ""),
      },
    });

    store.setInitValue({
      "validator-item": {
        a: "1",
      },
    });

    store.validateFields(mockValidateFields);

    expect(mockValidateFields).toHaveBeenNthCalledWith(10, true, [
      {
        name: "validator-item",
        message: "名字不能为空",
        type: "error",
      },
    ]);

    store.setInitValue({
      "validator-item": {
        name: "test-name",
      },
    });

    store.validateFields(mockValidateFields);

    expect(mockValidateFields).toHaveBeenNthCalledWith(11, false, {
      a: 123,
      b: "world",
      c: "123456",
      "validator-item": {
        name: "test-name",
      },
    });

    const validateResult = store.validateField("validator-item");

    expect(validateResult).toEqual({
      name: "validator-item",
      message: "",
      type: "normal",
    });

    expect(store.getFieldsValue("a")).toBe(123);
    expect(store.getFieldsValue()).toEqual({
      a: 123,
      b: "world",
      c: "123456",
      "validator-item": {
        name: "test-name",
      },
    });

    store.resetFields("validator-item");

    expect(store.getAllValues()).toEqual({
      a: 123,
      b: "world",
      c: "123456",
    });

    store.resetFields();

    expect(store.getAllValues()).toStrictEqual({
      a: undefined,
      b: undefined,
      c: undefined,
      "validator-item": undefined,
    });
  });

  it("scrollToField should work", () => {
    const store = new FormStore();

    store.setField("a", {
      name: "a",
      label: "字段A",
      validate: {
        required: true,
      },
    });

    const mockScrollTo = jest.fn();
    store.subscribe("a.scroll.to", mockScrollTo);

    store.scrollToField("a");

    expect(mockScrollTo).toHaveBeenCalledWith("a.scroll.to", null);
  });

  test("support nested object and array structures", () => {
    const store = new FormStore();

    store.setField("user.name", {
      name: "user.name",
      label: "用户名",
      validate: {
        required: true,
      },
    });
    store.setField("user.age", {
      name: "user.age",
      label: "年龄",
      validate: {
        type: "number",
      },
    });
    store.setField("items[0].name", {
      name: "items[0].name",
      label: "第一个项目名称",
      validate: {
        required: true,
      },
    });
    store.setField("items[1].name", {
      name: "items[1].name",
      label: "第二个项目名称",
      validate: {},
    });

    // setInitValue
    store.setInitValue({
      user: {
        name: "test",
        age: 18,
      },
      items: [{ name: "item1" }, { name: "item2" }],
    });

    // getFieldsValue
    expect(store.getFieldsValue("user.name")).toBe("test");
    expect(store.getFieldsValue("user.age")).toBe(18);
    expect(store.getFieldsValue("items[0].name")).toBe("item1");
    expect(store.getFieldsValue("items[1].name")).toBe("item2");

    // getAllValues
    const allValues = store.getAllValues();
    expect(allValues).toEqual({
      user: {
        name: "test",
        age: 18,
      },
      items: [{ name: "item1" }, { name: "item2" }],
    });

    // setFieldsValue
    store.setFieldsValue({
      user: {
        name: "updated",
        age: 20,
      },
    });

    expect(store.getFieldsValue("user.name")).toBe("updated");
    expect(store.getFieldsValue("user.age")).toBe(20);

    // validateFields
    const mockValidateFields = jest.fn();
    store.validateFields(mockValidateFields);

    expect(mockValidateFields).toHaveBeenCalledWith(false, {
      user: {
        name: "updated",
        age: 20,
      },
      items: [{ name: "item1" }, { name: "item2" }],
    });

    // resetFields
    store.resetFields("user.name");
    expect(store.getFieldsValue("user.name")).toBeUndefined();
    expect(store.getFieldsValue("user.age")).toBe(20);

    store.resetFields();
    expect(store.getAllValues()).toStrictEqual({
      items: [
        {
          name: undefined,
        },
        {
          name: undefined,
        },
      ],
      user: {
        age: undefined,
        name: undefined,
      },
    });
  });

  test("handle notRender fields when reading and setting values", () => {
    const store = new FormStore();

    store.setField("visible-field", {
      name: "visible-field",
      validate: {
        required: true,
      },
    });
    store.setField("hidden-field", {
      name: "hidden-field",
      notRender: true,
      validate: {
        required: true,
      },
    });

    store.setInitValue({
      "visible-field": "visible",
      "hidden-field": "hidden",
    });

    // getFieldsValue
    expect(store.getFieldsValue("visible-field")).toBe("visible");
    expect(store.getFieldsValue("hidden-field")).toBeUndefined();

    // getAllValues
    expect(store.getAllValues()).toEqual({ "visible-field": "visible" });

    // setFieldsValueByInitData
    store.setInitValue({
      "visible-field": "init-visible",
      "hidden-field": "init-hidden",
    });

    store.resetFields("visible-field");
    expect(store.getFieldsValue("visible-field")).toBeUndefined();

    store.setFieldsValueByInitData("visible-field");
    store.setFieldsValueByInitData("hidden-field");

    expect(store.getFieldsValue("visible-field")).toBe("init-visible");
    expect(store.getFieldsValue("hidden-field")).toBeUndefined();

    // validateField
    const validateResultVisible = store.validateField("visible-field");
    expect(validateResultVisible).toBeDefined();

    const validateResultHidden = store.validateField("hidden-field");
    expect(validateResultHidden).toBeUndefined();
  });

  test("onValuesChanged callback should receive correct changedValues", () => {
    const mockOnValuesChanged = jest.fn();
    const store = new FormStore({
      onValuesChanged: mockOnValuesChanged,
    });

    store.setField("name", {
      name: "name",
      label: "Name",
      validate: {},
    });
    store.setField("age", {
      name: "age",
      label: "Age",
      validate: {},
    });
    store.setField("email", {
      name: "email",
      label: "Email",
      validate: {},
    });

    store.setInitValue({
      name: "John",
      age: 30,
      email: "john@example.com",
    });

    mockOnValuesChanged.mockClear();

    store.setFieldsValue({
      name: "Jane",
      age: 25,
    });

    expect(mockOnValuesChanged).toHaveBeenCalledTimes(1);
    expect(mockOnValuesChanged).toHaveBeenCalledWith({
      changedValues: {
        name: "Jane",
        age: 25,
      },
      allValues: {
        name: "Jane",
        age: 25,
        email: "john@example.com",
      },
    });

    // test nested field update
    mockOnValuesChanged.mockClear();

    store.setField("address.city", {
      name: "address.city",
      label: "City",
      validate: {},
    });
    store.setField("address.zip", {
      name: "address.zip",
      label: "Zip Code",
      validate: {},
    });

    store.setFieldsValue({
      address: {
        city: "New York",
        zip: "10001",
      },
    });

    expect(mockOnValuesChanged).toHaveBeenCalledTimes(1);
    expect(mockOnValuesChanged).toHaveBeenCalledWith({
      changedValues: {
        address: {
          city: "New York",
          zip: "10001",
        },
      },
      allValues: {
        name: "Jane",
        age: 25,
        email: "john@example.com",
        address: {
          city: "New York",
          zip: "10001",
        },
      },
    });
  });

  test("removeField should remove field and its value", () => {
    const store = new FormStore();

    store.setField("field1", {
      name: "field1",
      label: "Field 1",
      validate: {},
    });
    store.setField("field2", {
      name: "field2",
      label: "Field 2",
      validate: {},
    });

    store.setInitValue({
      field1: "value1",
      field2: "value2",
    });

    expect(store.getFieldsValue("field1")).toBe("value1");
    expect(store.getFieldsValue("field2")).toBe("value2");

    store.removeField("field1");

    expect(store.getFieldsValue("field1")).toBeUndefined();
    expect(store.getFieldsValue("field2")).toBe("value2");
  });

  test("getValueFromEvent should extract value correctly", () => {
    const store = new FormStore();

    // Test with checkbox
    const checkboxEvent = {
      target: {
        type: "checkbox",
        checked: true,
        value: "checkbox-value",
      },
    } as any;

    expect(store.getValueFromEvent(checkboxEvent)).toBe(true);

    // Test with text input
    const textEvent = {
      target: {
        type: "text",
        value: "text-value",
      },
    } as any;

    expect(store.getValueFromEvent(textEvent)).toBe("text-value");

    // Test with non-event value
    expect(store.getValueFromEvent("direct-value" as any)).toBe("direct-value");
  });

  test("onWatch should update field value and validate", () => {
    const store = new FormStore();

    store.setField("watchField", {
      name: "watchField",
      label: "Watch Field",
      validate: {
        required: true,
      },
    });

    const mockSubscribe = jest.fn();
    store.subscribe("watchField.validate", mockSubscribe);

    const event = {
      target: {
        type: "text",
        value: "new-value",
      },
    } as any;

    // Don't test callback since it uses apply which expects array
    store.onWatch("watchField", event);

    expect(store.getFieldsValue("watchField")).toBe("new-value");
    expect(mockSubscribe).toHaveBeenCalled();
  });

  test("onWatch should support array values", () => {
    const store = new FormStore();
    const mockCallback = jest.fn();

    store.setField("arrayField", {
      name: "arrayField",
      label: "Array Field",
      validate: {},
    });

    store.onWatch("arrayField", ["value1", "value2"], mockCallback);

    expect(store.getFieldsValue("arrayField")).toBe("value1");
    expect(mockCallback).toHaveBeenCalledWith("value1", "value2");
  });

  test("onWatch with needValidate option", () => {
    const store = new FormStore();

    store.setField("noValidateField", {
      name: "noValidateField",
      label: "No Validate Field",
      validate: {
        required: true,
      },
    });

    const mockSubscribe = jest.fn();
    store.subscribe("noValidateField.validate", mockSubscribe);

    const event = {
      target: {
        type: "text",
        value: "",
      },
    } as any;

    store.onWatch("noValidateField", event, undefined, {
      needValidate: false,
    });

    expect(store.getFieldsValue("noValidateField")).toBe("");
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  test("onChange should update field value and validate", () => {
    const store = new FormStore();
    const mockCallback = jest.fn();

    store.setField("changeField", {
      name: "changeField",
      label: "Change Field",
      validate: {
        required: true,
      },
    });

    const mockSubscribe = jest.fn();
    store.subscribe("changeField.validate", mockSubscribe);

    store.onChange("changeField", "changed-value", mockCallback);

    expect(store.getFieldsValue("changeField")).toBe("changed-value");
    expect(mockCallback).toHaveBeenCalledWith("changed-value");
    expect(mockSubscribe).toHaveBeenCalled();
  });

  test("onChange with needValidate option", () => {
    const store = new FormStore();

    store.setField("noValidateOnChange", {
      name: "noValidateOnChange",
      label: "No Validate On Change",
      validate: {
        required: true,
      },
    });

    const mockSubscribe = jest.fn();
    store.subscribe("noValidateOnChange.validate", mockSubscribe);

    store.onChange("noValidateOnChange", "", undefined, {
      needValidate: false,
    });

    expect(store.getFieldsValue("noValidateOnChange")).toBe("");
    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  test("resetValidateState should publish reset event", () => {
    const store = new FormStore();
    const mockSubscribe = jest.fn();

    store.subscribe("reset.validate", mockSubscribe);

    store.resetValidateState();

    expect(mockSubscribe).toHaveBeenCalledWith("reset.validate", null);
  });

  test("validateField with custom message", () => {
    const store = new FormStore();

    store.setField("customMessage", {
      name: "customMessage",
      label: "Custom Message Field",
      validate: {
        required: true,
        pattern: "\\d+",
        min: 3,
        max: 10,
        message: {
          required: "This field is mandatory",
          pattern: "Only numbers allowed",
          min: "Minimum 3 characters required",
          max: "Maximum 10 characters allowed",
        },
      },
    });

    // Test required custom message
    store.setInitValue({ customMessage: "" });
    let result = store.validateField("customMessage");
    expect(result?.message).toBe("This field is mandatory");

    // Test pattern custom message
    store.setInitValue({ customMessage: "abc" });
    result = store.validateField("customMessage");
    expect(result?.message).toBe("Only numbers allowed");

    // Test min custom message
    store.setInitValue({ customMessage: "12" });
    result = store.validateField("customMessage");
    expect(result?.message).toBe("Minimum 3 characters required");

    // Test max custom message
    store.setInitValue({ customMessage: "12345678901" });
    result = store.validateField("customMessage");
    expect(result?.message).toBe("Maximum 10 characters allowed");
  });

  test("validateField with array of validators", () => {
    const store = new FormStore();
    const validator1 = jest.fn((value: any) => {
      return value === "invalid" ? "Validator 1 failed" : "";
    });
    const validator2 = jest.fn((value: any) => {
      return value === "error" ? "Validator 2 failed" : "";
    });

    store.setField("multiValidator", {
      name: "multiValidator",
      label: "Multi Validator Field",
      validate: {
        validator: [validator1, validator2] as any,
      },
    });

    // Test first validator fails
    store.setInitValue({ multiValidator: "invalid" });
    let result = store.validateField("multiValidator");
    expect(result?.message).toBe("Validator 1 failed");
    expect(validator1).toHaveBeenCalledWith("invalid");
    expect(validator2).not.toHaveBeenCalled();

    // Test second validator fails
    validator1.mockClear();
    validator2.mockClear();
    store.setInitValue({ multiValidator: "error" });
    result = store.validateField("multiValidator");
    expect(result?.message).toBe("Validator 2 failed");
    expect(validator1).toHaveBeenCalledWith("error");
    expect(validator2).toHaveBeenCalledWith("error");

    // Test all validators pass
    validator1.mockClear();
    validator2.mockClear();
    store.setInitValue({ multiValidator: "valid" });
    result = store.validateField("multiValidator");
    expect(result?.message).toBe("");
    expect(result?.type).toBe("normal");
  });

  test("setInitValue with isEmitValuseChange parameter", () => {
    const mockOnValuesChanged = jest.fn();
    const store = new FormStore({
      onValuesChanged: mockOnValuesChanged,
    });

    store.setField("field1", {
      name: "field1",
      validate: {},
    });

    // Should emit by default
    store.setInitValue({ field1: "value1" });
    expect(mockOnValuesChanged).toHaveBeenCalledTimes(1);

    mockOnValuesChanged.mockClear();

    // Should not emit when false
    store.setInitValue({ field1: "value2" }, false);
    expect(mockOnValuesChanged).not.toHaveBeenCalled();
  });

  test("setFieldsValue with isEmitValuseChange parameter", () => {
    const mockOnValuesChanged = jest.fn();
    const store = new FormStore({
      onValuesChanged: mockOnValuesChanged,
    });

    store.setField("field1", {
      name: "field1",
      validate: {},
    });

    // Should emit by default
    store.setFieldsValue({ field1: "value1" });
    expect(mockOnValuesChanged).toHaveBeenCalledTimes(1);

    mockOnValuesChanged.mockClear();

    // Should not emit when false
    store.setFieldsValue({ field1: "value2" }, false);
    expect(mockOnValuesChanged).not.toHaveBeenCalled();
  });

  test("publish and subscribe events", () => {
    const store = new FormStore();
    const mockSubscribe1 = jest.fn();
    const mockSubscribe2 = jest.fn();

    store.setField("eventField", {
      name: "eventField",
      validate: {},
    });

    store.subscribe("eventField.init.value", mockSubscribe1);
    store.subscribe("eventField.reset.fields", mockSubscribe2);

    store.setInitValue({ eventField: "test-value" });
    expect(mockSubscribe1).toHaveBeenCalledWith(
      "eventField.init.value",
      "test-value"
    );

    store.resetFields("eventField");
    expect(mockSubscribe2).toHaveBeenCalledWith(
      "eventField.reset.fields",
      null
    );
  });

  test("validate type number with NaN value", () => {
    const store = new FormStore();

    store.setField("numberField", {
      name: "numberField",
      label: "Number Field",
      validate: {
        type: "number",
      },
    });

    store.setInitValue({ numberField: "not-a-number" });
    const result = store.validateField("numberField");

    expect(result?.message).toBe("Number Field必须是数字");
    expect(result?.type).toBe("error");
  });

  test("validate with empty object value", () => {
    const store = new FormStore();

    store.setField("objectField", {
      name: "objectField",
      label: "Object Field",
      validate: {
        required: true,
      },
    });

    store.setInitValue({ objectField: {} });
    const result = store.validateField("objectField");

    expect(result?.message).toBe("Object Field为必填项");
    expect(result?.type).toBe("error");
  });
});
