import {
  deleteProduct,
  editProduct,
  fetchFileProduct,
  getAllProducts,
  getPurchasedByUser,
  postCreateProduct,
  postPurchaseProduct,
} from "./products";

import api from "../Api/axiosConfig";

jest.mock("../Api/axiosConfig");
const mockedApi = api as jest.Mocked<typeof api>;

describe("Product Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getAllProducts returns data on success", async () => {
    const mockData = [{ id: 1, title: "Prod 1" }];
    mockedApi.get.mockResolvedValueOnce({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/products" },
    });

    const response = await getAllProducts();

    expect(mockedApi.get).toHaveBeenCalledWith("/products");
    expect(response).toEqual({ data: mockData, status: 200 });
  });

  test("postCreateProduct posts formData and returns data on success", async () => {
    const mockData = { id: 1, title: "New Product" };
    const formData = new FormData();

    mockedApi.post.mockResolvedValueOnce({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/products" },
    });

    const response = await postCreateProduct(formData);

    expect(mockedApi.post).toHaveBeenCalledWith(
      "/products",
      formData,
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
    expect(response).toEqual({ data: mockData, status: 200 });
  });

  test("postPurchaseProduct posts body and returns data on success", async () => {
    const mockData = { purchaseId: 123 };
    const body = { productId: 1, userId: 2 };

    mockedApi.post.mockResolvedValueOnce({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/purchase" },
    });

    const response = await postPurchaseProduct(body);

    expect(mockedApi.post).toHaveBeenCalledWith("/purchase", body);
    expect(response).toEqual({ data: mockData, status: 200 });
  });

  test("deleteProduct deletes by id and returns data on success", async () => {
    const mockData = { success: true };
    mockedApi.delete.mockResolvedValueOnce({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/products/1" },
    });

    const response = await deleteProduct(1);

    expect(mockedApi.delete).toHaveBeenCalledWith("/products/1");
    expect(response).toEqual({ data: mockData, status: 200 });
  });

  test("editProduct patches by id with body and returns data on success", async () => {
    const mockData = { id: 1, title: "Updated" };
    const body = { title: "Updated" };

    mockedApi.patch.mockResolvedValueOnce({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/products/1" },
    });

    const response = await editProduct(1, body);

    expect(mockedApi.patch).toHaveBeenCalledWith("/products/1", body);
    expect(response).toEqual({ data: mockData, status: 200 });
  });

  test("fetchFileProduct returns full response including blob data", async () => {
    const blobData = new Blob(["file content"], { type: "application/pdf" });
    const axiosResponse = {
      data: blobData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/products/1/file" },
    };

    mockedApi.get.mockResolvedValueOnce(axiosResponse);

    const response = await fetchFileProduct(1);

    expect(mockedApi.get).toHaveBeenCalledWith("/products/1/file", {
      responseType: "blob",
      validateStatus: expect.any(Function),
    });
    expect(response).toEqual(axiosResponse);
  });

  test("getPurchasedByUser returns data on success", async () => {
    const mockData = [{ id: 1, title: "Prod 1" }];
    mockedApi.get.mockResolvedValueOnce({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: "/products/purchased/1" },
    });

    const response = await getPurchasedByUser(1);

    expect(mockedApi.get).toHaveBeenCalledWith("/products/purchased/1");
    expect(response).toEqual({ data: mockData, status: 200 });
  });

  // Tests for error handling (can be added similarly):
  test.each([
    ["getAllProducts", getAllProducts, "/products"],
    ["postCreateProduct", () => postCreateProduct(new FormData()), "/products"],
    ["postPurchaseProduct", () => postPurchaseProduct({}), "/purchase"],
    ["deleteProduct", () => deleteProduct(1), "/products/1"],
    ["editProduct", () => editProduct(1, {}), "/products/1"],
    [
      "getPurchasedByUser",
      () => getPurchasedByUser(1),
      "/products/purchased/1",
    ],
  ])("returns error status and data when %s fails", async (name, fn, url) => {
    mockedApi.get.mockRejectedValueOnce({
      response: { status: 500, data: { message: "Error" } },
      config: { url },
    });

    // For post, patch, delete, override mock with correct method:
    if (name === "postCreateProduct" || name === "postPurchaseProduct") {
      mockedApi.post.mockRejectedValueOnce({
        response: { status: 500, data: { message: "Error" } },
        config: { url },
      });
    } else if (name === "deleteProduct") {
      mockedApi.delete.mockRejectedValueOnce({
        response: { status: 500, data: { message: "Error" } },
        config: { url },
      });
    } else if (name === "editProduct") {
      mockedApi.patch.mockRejectedValueOnce({
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
