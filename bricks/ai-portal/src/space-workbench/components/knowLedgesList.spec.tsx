import React from "react";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@next-core/react-element", () => ({
  wrapBrick: jest.fn((tagName: string) => {
    // eslint-disable-next-line react/display-name
    return ({ children, onClick, icon, ...props }: any) => (
      <div data-testid={`wrapped-${tagName}`} onClick={onClick} {...props}>
        {icon && <span data-testid="button-icon">{icon.icon}</span>}
        {children}
      </div>
    );
  }),
}));

jest.mock("../i18n.js", () => ({
  K: {
    LOADING: "LOADING",
    ADD_KNOWLEDGE: "ADD_KNOWLEDGE",
    NO_KNOWLEDGE: "NO_KNOWLEDGE",
  },
  t: (key: string) => key,
}));

jest.mock("./EmptyState.js", () => ({
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
}));

jest.mock("../../cruise-canvas/utils/file.js", () => ({
  getFileTypeAndIcon: (mimeType: string, name: string) => {
    if (name.endsWith(".pdf")) return ["pdf", "pdf-icon.png"];
    if (name.endsWith(".docx")) return ["document", "doc-icon.png"];
    return ["file", "file-icon.png"];
  },
}));

jest.mock("moment", () => {
  const mockMoment = () => ({
    format: () => "2024-01-01",
  });
  return mockMoment;
});

import { KnowledgesList } from "./knowLedgesList";
import type { KnowledgeItem } from "../interfaces";

describe("KnowledgesList", () => {
  const mockKnowledges: KnowledgeItem[] = [
    {
      instanceId: "k1",
      name: "document.pdf",
      ctime: "2024-01-01T00:00:00Z",
      mtime: "2024-01-02T00:00:00Z",
    },
    {
      instanceId: "k2",
      name: "report.docx",
      ctime: "2024-01-03T00:00:00Z",
    },
  ];

  const mockOnKnowledgeClick = jest.fn();
  const mockOnAddKnowledge = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("应该在 knowledges 为 undefined 时显示加载状态", () => {
    render(
      <KnowledgesList
        knowledges={undefined}
        onKnowledgeClick={mockOnKnowledgeClick}
        onAddKnowledge={mockOnAddKnowledge}
      />
    );

    expect(screen.getByText("LOADING")).toBeInTheDocument();
  });

  test("应该在 knowledges 为空数组时显示空状态", () => {
    render(
      <KnowledgesList
        knowledges={[]}
        onKnowledgeClick={mockOnKnowledgeClick}
        onAddKnowledge={mockOnAddKnowledge}
      />
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("NO_KNOWLEDGE")).toBeInTheDocument();
  });

  test("应该渲染添加知识按钮", () => {
    render(
      <KnowledgesList
        knowledges={mockKnowledges}
        onKnowledgeClick={mockOnKnowledgeClick}
        onAddKnowledge={mockOnAddKnowledge}
      />
    );

    expect(screen.getByText("ADD_KNOWLEDGE")).toBeInTheDocument();
    expect(screen.getByTestId("button-icon")).toBeInTheDocument();
  });

  test("应该正确渲染知识列表", () => {
    render(
      <KnowledgesList
        knowledges={mockKnowledges}
        onKnowledgeClick={mockOnKnowledgeClick}
        onAddKnowledge={mockOnAddKnowledge}
      />
    );

    expect(screen.getByText("document.pdf")).toBeInTheDocument();
    expect(screen.getByText("report.docx")).toBeInTheDocument();
    expect(screen.getAllByText("2024-01-01").length).toBeGreaterThan(0);
  });

  test("应该调用 onAddKnowledge 回调", () => {
    render(
      <KnowledgesList
        knowledges={mockKnowledges}
        onKnowledgeClick={mockOnKnowledgeClick}
        onAddKnowledge={mockOnAddKnowledge}
      />
    );

    const addButton = screen.getByText("ADD_KNOWLEDGE");
    fireEvent.click(addButton);

    expect(mockOnAddKnowledge).toHaveBeenCalledTimes(1);
  });

  test("应该调用 onKnowledgeClick 回调并传递正确的知识项", () => {
    render(
      <KnowledgesList
        knowledges={mockKnowledges}
        onKnowledgeClick={mockOnKnowledgeClick}
        onAddKnowledge={mockOnAddKnowledge}
      />
    );

    const firstKnowledge = screen.getByText("document.pdf");
    fireEvent.click(firstKnowledge);

    expect(mockOnKnowledgeClick).toHaveBeenCalledTimes(1);
    expect(mockOnKnowledgeClick).toHaveBeenCalledWith(
      expect.objectContaining({
        instanceId: "k1",
        name: "document.pdf",
      })
    );
  });
});
