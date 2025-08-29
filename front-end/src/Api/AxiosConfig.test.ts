describe("api axios instance", () => {
  beforeEach(() => {
    jest.resetModules(); // reseta cache do jest para permitir reimportar módulo
    localStorage.clear();
  });

  // Helper para extrair handlers do interceptor
  function getRequestInterceptorHandlers(instance: any) {
    return instance.interceptors.request.handlers;
  }

  test("should create axios instance with correct baseURL", () => {
    const api = require("./axiosConfig").default;

    expect(api.defaults.baseURL).toBe("http://localhost:4000"); // Ajustado para o valor fixo do código
  });

  test("should add Authorization header with token if token exists", async () => {
    localStorage.setItem("token", "my-token");
    const api = require("./axiosConfig").default;

    const handlers = getRequestInterceptorHandlers(api);
    const fulfilledFn = handlers[0].fulfilled;

    const config = { headers: {} };
    const newConfig = await fulfilledFn(config);

    expect(newConfig.headers.Authorization).toBe("Bearer my-token");
  });

  test("should add headers object if not present and add token", async () => {
    localStorage.setItem("token", "my-token");
    const api = require("./axiosConfig").default;

    const handlers = getRequestInterceptorHandlers(api);
    const fulfilledFn = handlers[0].fulfilled;

    const config = {};
    const newConfig = await fulfilledFn(config);

    expect(newConfig.headers.Authorization).toBe("Bearer my-token");
  });

  test("should not add Authorization header if no token in localStorage", async () => {
    localStorage.removeItem("token");
    const api = require("./axiosConfig").default;

    const handlers = getRequestInterceptorHandlers(api);
    const fulfilledFn = handlers[0].fulfilled;

    const config = { headers: { "Content-Type": "application/json" } };
    const newConfig = await fulfilledFn(config);

    expect(newConfig.headers.Authorization).toBeUndefined();
    expect(newConfig.headers["Content-Type"]).toBe("application/json");
  });

  test("should reject error in interceptor", async () => {
    const api = require("./axiosConfig").default;

    const handlers = getRequestInterceptorHandlers(api);
    const rejectedFn = handlers[0].rejected;

    const error = new Error("Request failed");

    await expect(rejectedFn(error)).rejects.toThrow("Request failed");
  });
});
export {};
