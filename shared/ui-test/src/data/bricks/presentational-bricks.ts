import { BrickCommandConf } from "../../interfaces.js";

export const presentationalBricks: BrickCommandConf[] = [
  {
    brick: "presentational-bricks.brick-general-search",
    targets: [
      {
        selectors: [
          {
            type: "css-selector",
            value: ".ant-input",
          },
        ],
        actions: [
          {
            name: "click",
          },
          {
            name: "type",
          },
        ],
      },
      {
        selectors: [
          {
            type: "css-selector",
            value: "button.ant-btn-icon-only",
          },
        ],
        actions: [
          {
            name: "click",
            params: {
              type: "icon",
            },
          },
        ],
      },
    ],
  },
  {
    brick: "presentational-bricks.brick-link",
    targets: [
      {
        selectors: [
          {
            type: "css-selector",
            value: "a",
          },
        ],
        actions: [
          {
            name: "click",
          },
        ],
      },
    ],
  },
  {
    brick: "presentational-bricks.brick-tag",
    targets: [
      {
        selectors: [
          {
            type: "css-selector",
            value: ".ant-tag",
            multiple: true,
            field: "tagIndex",
          },
        ],
        actions: [
          {
            name: "click",
          },
        ],
      },
    ],
  },
  {
    brick: "presentational-bricks.general-pagination",
    targets: [
      {
        selectors: [
          {
            type: "css-selector",
            value: ".ant-pagination-next",
          },
          {
            type: "css-selector",
            value: ".ant-pagination-item-link",
          },
        ],
        actions: [
          {
            name: "click",
            params: {
              type: "next",
            },
          },
        ],
      },
      {
        selectors: [
          {
            type: "css-selector",
            value: ".ant-pagination-prev",
          },
          {
            type: "css-selector",
            value: ".ant-pagination-item-link",
          },
        ],
        actions: [
          {
            name: "click",
            params: {
              type: "prev",
            },
          },
        ],
      },
    ],
  },
  {
    brick: "presentational-bricks.modal-confirm",
    targets: [
      {
        isolate: true,
        selectors: [
          { type: "css-selector", value: ".ant-modal-confirm" },
          {
            type: "css-selector",
            value: ".ant-modal-confirm-content",
          },
          {
            type: "css-selector",
            value: "input",
          },
        ],
        actions: [
          {
            name: "type",
          },
        ],
      },
    ],
  },
];
