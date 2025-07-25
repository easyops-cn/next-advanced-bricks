import { describe, test, expect, jest } from "@jest/globals";
import React from "react";
import { act } from "react-dom/test-utils";
import "./index.js";
import { render } from "@testing-library/react";
import {LoadingPanel , LoadingPanelComponent} from "./index.js";

describe("data-view.loading-panel", ()=>{
    beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(window, 'setInterval');
    });
    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });
    test("basic usage", async ()=>{
        const element =  document.createElement("data-view.loading-panel") as LoadingPanel;
        const mockEndFn = jest.fn();
        expect(element.shadowRoot).toBeFalsy();
        act(()=>{
            element.loading = true;
            element.customTitle = "Hello world";
            element.useRealTimeProgress = false;
            element.onEnd();
            document.body.appendChild(element);
        });
        expect(element.shadowRoot).toBeTruthy();
        expect(element.shadowRoot.querySelector(".title").innerHTML).toBe("Hello world");
        const {container ,rerender} = await act( async () =>
            render(<LoadingPanelComponent
                useRealTimeProgress={false}
                loading={false}
                customTitle="hello"
            />));
        expect(container.querySelector(".title").innerHTML).toBe("hello");
        expect(setInterval).toHaveBeenCalledTimes(2);
        expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 100);
        rerender(<LoadingPanelComponent useRealTimeProgress={true} progress={100} intervalTime={300}  onEnd={mockEndFn} />);
        await act(async ()=>{
            jest.runAllTimers();
        })
        expect(container.querySelector(".title").innerHTML).toBe("Tarsier");
        expect(container.querySelector(".progress").innerHTML).toBe("100%");
        act(() => {
            document.body.removeChild(element);
        });
        expect(document.body.contains(element)).toBeFalsy();
    });
})
