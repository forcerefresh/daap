import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("../../inputs/input-utils", () => ({
  getFontFamilyField: vi.fn(() => null),
  getUnitNumericFiled: vi.fn(() => null),
}));
vi.mock("../../inputs/color-input/color-input", () => ({
  default: vi.fn(() => null),
}));
vi.mock("./AIContextMenu", () => ({
  default: vi.fn(() => null),
}));
vi.mock("react-redux", () => ({
  connect: () => (C: any) => C,
}));
vi.mock("../../store/store", () => ({
  IStore: {},
}));
vi.mock("../../integration", () => ({
  IntegrationContext: React.createContext({ platform: { hasAiTextAssistant: false } }),
}));
vi.mock("./TextToolbar.module.scss", () => ({ default: {} }));
vi.mock("../../inputs/color-input/color-input.module.scss", () => ({ default: {} }));
vi.mock("@blueprintjs/core", () => ({
  Button: vi.fn(({ children, onClick }: any) => <button onClick={onClick}>{children}</button>),
  Icon: vi.fn(() => null),
  Popover: vi.fn(({ children }: any) => <div>{children}</div>),
  Spinner: vi.fn(() => null),
}));

import TextToolbar from "./TextToolbar";

const baseProps: any = {
  mode: "editor",
  object: {
    id: "obj-1",
    properties: {
      font: { fontFamily: "Arial", source: "system-fonts" },
      color: { r: 0, g: 0, b: 0, a: 1 },
      fontSize: "16px",
      bold: false,
      italic: false,
      underline: false,
      textAlign: "left",
    },
  },
  updateObject: vi.fn(),
  updateObjectForPreview: vi.fn(),
  deleteObject: vi.fn(),
  aiLoading: {},
};

describe("TextToolbar", () => {
  it("renders without crashing", () => {
    const { container } = render(<TextToolbar {...baseProps} />);
    expect(container).toBeTruthy();
  });

  it("renders nothing when object is undefined", () => {
    const { container } = render(
      <TextToolbar {...{ ...baseProps, object: undefined }} />,
    );
    expect(container.innerHTML).not.toContain("inputsHolder");
  });
});
