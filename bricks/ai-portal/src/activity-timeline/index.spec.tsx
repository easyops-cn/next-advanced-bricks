import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { ActivityTimeline } from "./index.js";
import type { Activity } from "./interfaces";

jest.mock("@next-core/theme", () => ({}));

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date("2025-09-18"));
});

afterAll(() => {
  jest.useRealTimers();
});

describe("ai-portal.activity-timeline", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "ai-portal.activity-timeline"
    ) as ActivityTimeline;
    element.list = [
      {
        user_id: "u001",
        user_name: "Tom",
        action_type: "create_goal",
        time: 1757853597000,
      },
      {
        user_id: "u001",
        user_name: "Tom",
        action_type: "alter_owner",
        time: 1757863597000,
        metadata: {
          after: {
            owner: {
              user_name: "Lucy",
            },
          },
        },
      },
      {
        user_id: "u002",
        user_name: "Lucy",
        action_type: "start_conversation",
        time: 1757904096000,
        metadata: {
          conversation_id: "c001",
          conversation_title: "项目规划",
        },
      },
      {
        user_id: "u002",
        user_name: "Lucy",
        action_type: "decompose_goals",
        time: 1757904096000,
        metadata: {
          sub_goals_count: 2,
          sub_goals: [
            {
              title: "先计划",
            },
            {
              title: "再执行",
            },
          ],
        },
      },
      {
        user_id: "u002",
        user_name: "Lucy",
        action_type: "alter_user",
        time: 1757904096000,
        metadata: {
          before: {
            users: [
              {
                user_name: "Jim",
              },
            ],
          },
          after: {
            users: [
              {
                user_name: "Joy",
              },
              {
                user_name: "Green",
              },
            ],
          },
        },
      },
      {
        user_id: "u001",
        user_name: "Tom",
        action_type: "add_comment",
        time: 1757904096000,
        metadata: {
          comment_content: "Good!",
        },
      },
    ] as Activity[];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.childNodes).toMatchSnapshot();

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("loading state", async () => {
    const element = document.createElement(
      "ai-portal.activity-timeline"
    ) as ActivityTimeline;

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.querySelector(".loading")).toBeTruthy();

    act(() => {
      document.body.removeChild(element);
    });
  });
});
