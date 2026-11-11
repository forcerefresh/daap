import { describe, it, expect } from "vitest";
import {
  registerObjectTool,
  getObjectToolDefinitions,
  getLatestVersionsMap,
} from "./objectToolFactory";

describe("getLatestVersionsMap", () => {
  it("returns the highest semver version for each type", () => {
    const data = [
      { type: "a", version: "1.0.0" },
      { type: "a", version: "2.0.0" },
      { type: "a", version: "1.5.0" },
      { type: "b", version: "1.0.0" },
    ];
    const map = getLatestVersionsMap(data);
    expect(map.get("a")?.version).toBe("2.0.0");
    expect(map.get("b")?.version).toBe("1.0.0");
  });

  it("returns a single entry when only one version exists", () => {
    const data = [{ type: "x", version: "3.0.0" }];
    const map = getLatestVersionsMap(data);
    expect(map.get("x")?.version).toBe("3.0.0");
  });

  it("returns empty map for empty input", () => {
    const map = getLatestVersionsMap([]);
    expect(map.size).toBe(0);
  });
});

describe("registerObjectTool + getObjectToolDefinitions", () => {
  it("retrieves a registered tool by exact type (no version)", () => {
    const def = { type: "my-tool-exact", meta: { name: "My Tool" } };
    registerObjectTool(def);
    const result = getObjectToolDefinitions("my-tool-exact");
    expect(result?.type).toBe("my-tool-exact");
    expect(result?.meta.name).toBe("My Tool");
  });

  it("retrieves the latest registered version via 'latest'", () => {
    registerObjectTool({ type: "versioned-tool", version: "1.0.0", meta: { name: "V1" } });
    registerObjectTool({ type: "versioned-tool", version: "2.0.0", meta: { name: "V2" } });
    const result = getObjectToolDefinitions("versioned-tool", "latest");
    expect(result?.version).toBe("2.0.0");
    expect(result?.meta.name).toBe("V2");
  });

  it("returns null for an unregistered type", () => {
    const result = getObjectToolDefinitions("non-existent-tool");
    expect(result).toBeNull();
  });
});
