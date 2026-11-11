import { describe, it, expect, vi, beforeEach } from "vitest";
import { JSONSourceConnector } from "./json-source-connector";

describe("JSONSourceConnector", () => {
  let connector: JSONSourceConnector;

  beforeEach(() => {
    connector = new JSONSourceConnector();
  });

  it("starts in notloaded state", () => {
    expect((connector as any).state).toBe("notloaded");
  });

  it("loadData fetches and parses json", async () => {
    const mockData = { key: "value" };
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockData),
    } as any);

    await connector.loadData("http://example.com/data.json");
    expect(connector.data).toEqual(mockData);
    expect((connector as any).state).toBe("loaded");
  });

  it("loadData sets state to error on failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network error"));

    await connector.loadData("http://bad-url.com/data.json");
    expect((connector as any).state).toBe("error");
  });

  it("getDataByPath returns value immediately when loaded", async () => {
    connector.data = { user: { name: "Alice" } };
    (connector as any).state = "loaded";

    const result = await connector.getDataByPath("user.name");
    expect(result).toBe("Alice");
  });

  it("getDataByPath subscribes and resolves after loadData", async () => {
    const mockData = { score: 42 };
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockData),
    } as any);

    const promise = connector.getDataByPath("score");
    await connector.loadData("http://example.com/data.json");
    const result = await promise;
    expect(result).toBe(42);
  });
});
