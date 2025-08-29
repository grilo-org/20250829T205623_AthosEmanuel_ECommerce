import { User, postRegister } from "./auth";

import api from "../Api/axiosConfig";

jest.mock("../Api/axiosConfig");
const mockedApi = api as jest.Mocked<typeof api>;

describe("postRegister", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns data and status 200 on success", async () => {
    const user: User = { email: "test@example.com", password: "Abc123$!" };
    const mockData = { access_token: "token123" };

    mockedApi.post.mockResolvedValueOnce({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/auth/register" }, // <<< obrigatório
    });

    const response = await postRegister(user);

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/register", user);
    expect(response).toEqual({ data: mockData, status: 200 });
  });

  test("returns error status and message on failure", async () => {
    const user: User = { email: "fail@test.com", password: "failPass1!" };
    const errorResponse = {
      response: {
        status: 401,
        data: { message: "Unauthorized" },
      },
      config: { url: "/auth/register" },
    };

    mockedApi.post.mockRejectedValueOnce(errorResponse);

    const response = await postRegister(user);

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/register", user);
    expect(response).toEqual({
      status: 401,
      data: { message: "Unauthorized" },
    });
  });

  test("returns default error on unknown failure", async () => {
    const user: User = { email: "fail@test.com", password: "failPass1!" };

    mockedApi.post.mockRejectedValueOnce({});

    const response = await postRegister(user);

    expect(response).toEqual({
      status: 500,
      data: { message: "Erro inesperado" },
    });
  });
});
