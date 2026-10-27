import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./helpers/app";
import { authHeaders } from "./helpers/auth";

describe("Products API", () => {
  it("requires authentication to list products", async () => {
    const res = await request(app).get("/api/products");
    expect([401, 403]).toContain(res.status);
  });

  it("lists products when authenticated", async () => {
    const res = await request(app).get("/api/products").set(authHeaders());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body) || Array.isArray(res.body.data)).toBe(true);
  });

  it("rejects an empty create payload", async () => {
    const res = await request(app).post("/api/products").set(authHeaders()).send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it("returns a client error for a non-existent product", async () => {
    const res = await request(app).get("/api/products/2147483647").set(authHeaders());
    expect([400, 404]).toContain(res.status);
  });
});
