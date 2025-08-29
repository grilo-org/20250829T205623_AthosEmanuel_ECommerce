import { deleteUser, getAllUsers, getUser, putUser } from "./user";

import api from "../Api/axiosConfig";

jest.mock("../Api/axiosConfig");
const mockedApi = api as jest.Mocked<typeof api>;

describe("User Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getAllUsers returns data on success", async () => {
    const mockData = [{ id: 1, name: "User 1" }];
    mockedApi.get.mockResolvedValueOnce({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/user" },
    });

    const response = await getAllUsers();

    expect(mockedApi.get).toHaveBeenCalledWith("/user");
    expect(response).toEqual({ data: mockData, status: 200 });
  });

  test("deleteUser deletes user by id and returns data on success", async () => {
    const mockData = { success: true };
    mockedApi.delete.mockResolvedValueOnce({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/user/1" },
    });

    const response = await deleteUser(1);

    expect(mockedApi.delete).toHaveBeenCalledWith("/user/1");
    expect(response).toEqual({ data: mockData, status: 200 });
  });

  test("getUser returns logged user data on success", async () => {
    const mockData = { id: 1, name: "User Me" };
    mockedApi.get.mockResolvedValueOnce({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/user/me" },
    });

    const response = await getUser();

    expect(mockedApi.get).toHaveBeenCalledWith("/user/me");
    expect(response).toEqual({ data: mockData, status: 200 });
  });

  test("putUser updates logged user and returns data on success", async () => {
    const mockData = { id: 1, name: "User Updated" };
    const body = { name: "User Updated" };

    mockedApi.put.mockResolvedValueOnce({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/user/me" },
    });

    const response = await putUser(body);

    expect(mockedApi.put).toHaveBeenCalledWith("/user/me", body);
    expect(response).toEqual({ data: mockData, status: 200 });
  });

  // Error handling tests

  test.each([
    ["getAllUsers", getAllUsers, "/user"],
    ["deleteUser", () => deleteUser(1), "/user/1"],
    ["getUser", getUser, "/user/me"],
    ["putUser", () => putUser({ name: "Test" }), "/user/me"],
  ])("returns error status and data when %s fails", async (name, fn, url) => {
    mockedApi.get.mockRejectedValueOnce({
      response: { status: 500, data: { message: "Error" } },
      config: { url },
    });
    mockedApi.delete.mockRejectedValueOnce({
      response: { status: 500, data: { message: "Error" } },
      config: { url },
    });
    mockedApi.put.mockRejectedValueOnce({
      response: { status: 500, data: { message: "Error" } },
      config: { url },
    });

    // Mock correct method rejection depending on function
    if (name === "deleteUser") {
      mockedApi.delete.mockRejectedValueOnce({
        response: { status: 500, data: { message: "Error" } },
        config: { url },
      });
    } else if (name === "putUser") {
      mockedApi.put.mockRejectedValueOnce({
        response: { status: 500, data: { message: "Error" } },
        config: { url },
      });
    } else {
      mockedApi.get.mockRejectedValueOnce({
        response: { status: 500, data: { message: "Error" } },
        config: { url },
      });
    }

    const response = await fn();

    expect(response).toEqual({
      status: 500,
      data: { message: "Error" },
    });
  });
});
