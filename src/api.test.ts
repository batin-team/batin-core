import { app } from "./index";

describe("Hono Health Check Test", () => {
  it("should return ok for /health", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});
