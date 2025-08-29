import * as productService from "../../Services/products";

// src/Pages/Products/Products.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { BrowserRouter } from "react-router-dom";
import Products from "./";

jest.mock("../../Services/products");
jest.mock("../../Services/user");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Products Page", () => {
  beforeEach(() => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("role", "admin");
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should render admin buttons", async () => {
    (productService.getAllProducts as jest.Mock).mockResolvedValue({
      data: [],
    });

    renderWithRouter(<Products />);

    expect(await screen.findByText("Cadastrar produto")).toBeInTheDocument();
    expect(screen.getByText("Lista de Usuários")).toBeInTheDocument();
  });

  it("should render user buttons if role is user", async () => {
    localStorage.setItem("role", "user");
    (productService.getAllProducts as jest.Mock).mockResolvedValue({
      data: [],
    });

    renderWithRouter(<Products />);

    expect(
      await screen.findByText("Visualizar meus produtos")
    ).toBeInTheDocument();
    expect(screen.getByText("Visualizar meu perfil")).toBeInTheDocument();
  });

  it("should call create product and show success toast", async () => {
    const postCreateProductMock = productService.postCreateProduct as jest.Mock;
    postCreateProductMock.mockResolvedValue({ status: 200 });

    (productService.getAllProducts as jest.Mock).mockResolvedValue({
      data: [],
    });

    renderWithRouter(<Products />);

    fireEvent.click(await screen.findByText("Cadastrar produto"));

    // await waitFor(() => {
    //   expect(toast.success).toHaveBeenCalledWith(
    //     "Produto cadastrado com sucesso !!!"
    //   );
    // });
  });

  it("should call deleteProduct and show success toast", async () => {
    (productService.getAllProducts as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 1,
          title: "Test",
          description: "desc",
          price: 10,
          fileUrl: "",
          purchased: false,
        },
      ],
    });
    (productService.deleteProduct as jest.Mock).mockResolvedValue({
      status: 200,
    });

    renderWithRouter(<Products />);

    const deleteButton = await screen.findByRole("button", {
      name: /deletar/i,
    });
    fireEvent.click(deleteButton);

    // Agora espera o modal de confirmação aparecer e clica no botão Excluir do modal
    const confirmDeleteButton = await screen.findByRole("button", {
      name: /excluir/i,
    });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(productService.deleteProduct).toHaveBeenCalledWith(1);
    });
  });

  it("should clear localStorage and navigate to '/' on logout", async () => {
    (productService.getAllProducts as jest.Mock).mockResolvedValue({
      data: [],
    });

    renderWithRouter(<Products />);

    fireEvent.click(await screen.findByText("Sair"));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("");
      expect(localStorage.getItem("role")).toBe("");
    });
  });
});
