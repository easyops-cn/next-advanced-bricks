import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SpaceGuide, type SpaceGuideProps } from "./SpaceGuide.js";

// Mock SVG imports
jest.mock("../../images/magic.svg", () => ({
  __esModule: true,
  default: () => <svg data-testid="magic-svg" />,
}));

// Mock the i18n module
jest.mock("../../i18n.js", () => ({
  K: {
    SPACE_GUIDE_SECTION_TITLE: "SPACE_GUIDE_SECTION_TITLE",
    SPACE_GUIDE_CARD_1_TITLE: "SPACE_GUIDE_CARD_1_TITLE",
    SPACE_GUIDE_CARD_2_TITLE: "SPACE_GUIDE_CARD_2_TITLE",
    SPACE_GUIDE_CARD_3_TITLE: "SPACE_GUIDE_CARD_3_TITLE",
  },
  t: jest.fn((key: string) => {
    const translations: Record<string, string> = {
      SPACE_GUIDE_SECTION_TITLE: "我可以协助您完成:",
      SPACE_GUIDE_CARD_1_TITLE: "管理业务案例",
      SPACE_GUIDE_CARD_2_TITLE: "发起业务流",
      SPACE_GUIDE_CARD_3_TITLE: "管理空间知识",
    };
    return translations[key] || key;
  }),
}));

// Mock wrapped components
jest.mock("@next-core/react-element", () => ({
  wrapBrick: jest.fn((tagName: string) => {
    const MockComponent = ({ className }: any) => {
      if (tagName === "ai-portal.space-logo") {
        return (
          <div data-testid="mock-space-logo" className={className}>
            Space Logo
          </div>
        );
      }
      return <div data-testid={`mock-${tagName}`} />;
    };
    MockComponent.displayName = `Mock${tagName}`;
    return MockComponent;
  }),
}));

describe("SpaceGuide", () => {
  const defaultProps: SpaceGuideProps = {
    spaceDetail: {
      name: "测试空间",
      instanceId: "space-123",
      description: "这是一个测试空间的描述",
    },
    onCardClick: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render space detail correctly", () => {
    const { container } = render(<SpaceGuide {...defaultProps} />);

    // 验证主容器
    expect(
      container.querySelector(".space-guide-container")
    ).toBeInTheDocument();

    // 验证空间名称
    const title = container.querySelector(".guide-title");
    expect(title).toHaveTextContent("测试空间");

    // 验证空间描述
    const description = container.querySelector(".guide-description");
    expect(description).toHaveTextContent("这是一个测试空间的描述");

    // 验证 SpaceLogo
    expect(container.querySelector(".space-logo")).toBeInTheDocument();
  });

  test("should render section title and three guide cards", () => {
    const { container } = render(<SpaceGuide {...defaultProps} />);

    // 验证 section title
    const sectionTitle = container.querySelector(".section-title");
    expect(sectionTitle).toHaveTextContent("我可以协助您完成:");

    // 验证三张卡片
    const cards = container.querySelectorAll(".guide-card");
    expect(cards.length).toBe(3);

    const cardTitles = container.querySelectorAll(".card-title");
    expect(cardTitles[0]).toHaveTextContent("管理业务案例");
    expect(cardTitles[1]).toHaveTextContent("发起业务流");
    expect(cardTitles[2]).toHaveTextContent("管理空间知识");
  });

  test("should render cards with icons and background images", () => {
    const { container } = render(<SpaceGuide {...defaultProps} />);

    const cards = container.querySelectorAll(".guide-card");

    // 验证每张卡片的结构
    cards.forEach((card) => {
      // 验证背景图片
      const style = (card as HTMLElement).style;
      expect(style.backgroundImage).toContain("url(");

      // 验证图标
      const icon = card.querySelector(".card-icon") as HTMLImageElement;
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("alt");
      expect(icon).toHaveAttribute("src");
    });
  });

  test("should call onCardClick with correct index when cards are clicked", async () => {
    const onCardClick = jest.fn();
    const { container } = render(
      <SpaceGuide {...defaultProps} onCardClick={onCardClick} />
    );

    const cards = container.querySelectorAll(".guide-card");

    // 点击第一张卡片
    await act(async () => {
      fireEvent.click(cards[0]);
    });
    expect(onCardClick).toHaveBeenCalledWith(0);

    // 点击第二张卡片
    await act(async () => {
      fireEvent.click(cards[1]);
    });
    expect(onCardClick).toHaveBeenCalledWith(1);

    // 点击第三张卡片
    await act(async () => {
      fireEvent.click(cards[2]);
    });
    expect(onCardClick).toHaveBeenCalledWith(2);

    expect(onCardClick).toHaveBeenCalledTimes(3);
  });

  test("should update when props change and handle missing onCardClick", async () => {
    const { container, rerender } = render(<SpaceGuide {...defaultProps} />);

    // 验证初始渲染
    expect(container.querySelector(".guide-title")).toHaveTextContent(
      "测试空间"
    );

    // 更新 props
    const updatedProps: SpaceGuideProps = {
      spaceDetail: {
        name: "新空间",
        instanceId: "space-456",
        description: "新的空间描述",
      },
    };

    rerender(<SpaceGuide {...updatedProps} />);

    // 验证更新后的内容
    expect(container.querySelector(".guide-title")).toHaveTextContent("新空间");
    expect(container.querySelector(".guide-description")).toHaveTextContent(
      "新的空间描述"
    );

    // 验证没有 onCardClick 时点击不会报错
    const firstCard = container.querySelectorAll(".guide-card")[0];
    await act(async () => {
      expect(() => {
        fireEvent.click(firstCard);
      }).not.toThrow();
    });
  });
});
