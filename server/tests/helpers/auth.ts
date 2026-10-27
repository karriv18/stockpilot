export function authHeaders() {
  const token = process.env.TEST_AUTH_TOKEN;
  if (!token) {
    throw new Error("Set TEST_AUTH_TOKEN to a valid token for the dedicated test database.");
  }
  return { Authorization: `Bearer ${token}` };
}
