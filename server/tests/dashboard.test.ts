import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./helpers/app";
import { authHeaders } from "./helpers/auth";

describe("Dashboard API", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/dashboard");
    expect([401, 403]).toContain(res.status);
  });

  it("returns dashboard summary when authenticated", async () => {
    const res = await request(app).get("/api/dashboard").set(authHeaders());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("stats");
    expect(res.body).toHaveProperty("movements");
    expect(res.body).toHaveProperty("lowStock");
  });
});
