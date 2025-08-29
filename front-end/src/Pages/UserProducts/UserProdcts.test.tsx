import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { BrowserRouter } from "react-router-dom";
import { getPurchasedByUser } from "../../Services/products";
import UserProducts from "./";

// Mock do serviço getPurchasedByUser
jest.mock("../../Services/products", () => ({
  getPurchasedByUser: jest.fn(),
}));

// Mock do useNavigate do react-router-dom
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("UserProducts Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("userId", "1");
    localStorage.setItem("role", "user");
    localStorage.setItem("token", "token123");
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders title and buttons", async () => {
    (getPurchasedByUser as jest.Mock).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <UserProducts />
      </BrowserRouter>
    );

    // Aguarda até que o título e botões estejam no DOM (após update de estado)
    await waitFor(() => {
      expect(screen.getByText("Meus Produtos")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /voltar/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sair/i })).toBeInTheDocument();
    });
  });

  test("shows 'Nenhum produto adquirido.' when products list is empty", async () => {
    (getPurchasedByUser as jest.Mock).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <UserProducts />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("Nenhum produto adquirido.")).toBeInTheDocument()
    );
  });

  test("renders ProductTable when products are returned", async () => {
    const productsMock = [
      {
        id: 1,
        title: "Produto 1",
        description: "Descrição 1",
        price: 10,
        fileUrl: "url1",
        purchased: true,
      },
    ];

    (getPurchasedByUser as jest.Mock).mockResolvedValue({ data: productsMock });

    render(
      <BrowserRouter>
        <UserProducts />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Nenhum produto adquirido.")
      ).not.toBeInTheDocument();
      expect(screen.getByText("Produto 1")).toBeInTheDocument();
    });
  });

  test("calls navigate with /products when Voltar button is clicked", async () => {
    (getPurchasedByUser as jest.Mock).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <UserProducts />
      </BrowserRouter>
    );

    const voltarButton = await screen.findByRole("button", { name: /voltar/i });
    fireEvent.click(voltarButton);

    expect(mockedNavigate).toHaveBeenCalledWith("/products");
  });

  test("clears localStorage and navigates to / when Sair button is clicked", async () => {
    (getPurchasedByUser as jest.Mock).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <UserProducts />
      </BrowserRouter>
    );

    const sairButton = await screen.findByRole("button", { name: /sair/i });
    fireEvent.click(sairButton);

    await waitFor(() => {
      expect(localStorage.getItem("role")).toBe("");
      expect(localStorage.getItem("token")).toBe("");
      expect(localStorage.getItem("userId")).toBe("");
      expect(mockedNavigate).toHaveBeenCalledWith("/");
    });
  });
});
