import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./helpers/app";
import { authHeaders } from "./helpers/auth";

describe("Inventory API", () => {
  it("requires authentication to list inventory", async () => {
    const res = await request(app).get("/api/inventory");
    expect([401, 403]).toContain(res.status);
  });

  it("lists inventory for an authenticated user", async () => {
    const res = await request(app).get("/api/inventory").set(authHeaders());
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  it("rejects invalid stock-in quantity", async () => {
    const res = await request(app).post("/api/inventory/stock-in")
      .set(authHeaders()).send({ productId: -1, quantity: 0 });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it("rejects invalid stock-out quantity", async () => {
    const res = await request(app).post("/api/inventory/stock-out")
      .set(authHeaders()).send({ productId: -1, quantity: 0 });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});
