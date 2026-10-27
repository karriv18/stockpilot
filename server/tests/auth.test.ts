import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./helpers/app";

describe("Auth API", () => {
  it("rejects missing credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "invalid-test-user@example.invalid",
      password: "wrong-password-for-test",
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect(res.body).not.toHaveProperty("token");
  });
});
