import * as toastify from "react-toastify";
import * as productsService from "../../Services/products";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Id } from "react-toastify";
import ProductTable from "./listTableProductPurchased";

describe("ProductTable", () => {
  const productsMock = [
    { id: 1, title: "Product One", description: "Description One", price: 10 },
    {
      id: 2,
      title: "Product Two",
      description: "Description Two",
      price: 20.5,
    },
  ];

  let fetchFileProductSpy: jest.SpyInstance;
  let toastErrorSpy: jest.SpyInstance;
  let toastSuccessSpy: jest.SpyInstance;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    toastErrorSpy = jest
      .spyOn(toastify.toast, "error")
      .mockImplementation((): Id => 1 as Id);

    toastSuccessSpy = jest
      .spyOn(toastify.toast, "success")
      .mockImplementation((): Id => 1 as Id);

    fetchFileProductSpy = jest.spyOn(productsService, "fetchFileProduct");

    // Mock seguro para URL.createObjectURL
    jest
      .spyOn(global.URL, "createObjectURL")
      .mockReturnValue("blob:http://localhost/test");

    // Evita recursão infinita ao salvar a referência original
    originalCreateElement = document.createElement;

    jest
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string): any => {
        if (tagName === "a") {
          return {
            href: "",
            download: "",
            click: jest.fn(),
            remove: jest.fn(),
            setAttribute: jest.fn(),
          };
        }
        return originalCreateElement.call(document, tagName);
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders table headers and product data correctly", () => {
    render(<ProductTable products={productsMock} />);

    expect(screen.getByText("Lista de Produtos")).toBeInTheDocument();

    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Descrição")).toBeInTheDocument();
    expect(screen.getByText("Preço")).toBeInTheDocument();
    expect(screen.getByText("Ação")).toBeInTheDocument();

    expect(screen.getByText("Product One")).toBeInTheDocument();
    expect(screen.getByText("Description One")).toBeInTheDocument();
    expect(screen.getByText("R$ 10.00")).toBeInTheDocument();

    expect(screen.getByText("Product Two")).toBeInTheDocument();
    expect(screen.getByText("Description Two")).toBeInTheDocument();
    expect(screen.getByText("R$ 20.50")).toBeInTheDocument();
  });

  it("calls fetchFileProduct and shows success toast on successful download", async () => {
    fetchFileProductSpy.mockResolvedValue({
      data: new Blob(["test"], { type: "application/pdf" }),
      status: 200,
    });

    render(<ProductTable products={productsMock} />);
    const buttons = screen.getAllByRole("button", { name: /Baixar/i });

    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(fetchFileProductSpy).toHaveBeenCalledWith(1);
      expect(toastSuccessSpy).toHaveBeenCalledWith(
        "Download realizado com sucesso!"
      );
    });
  });

  it("shows error toast if fetchFileProduct returns 403 status", async () => {
    fetchFileProductSpy.mockResolvedValue({
      data: {},
      status: 403,
    });

    render(<ProductTable products={productsMock} />);
    const buttons = screen.getAllByRole("button", { name: /Baixar/i });

    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith(
        "Você atingiu o limite de downloads para este produto."
      );
    });
  });

  it("shows error toast if fetchFileProduct throws error", async () => {
    fetchFileProductSpy.mockRejectedValue(new Error("Network error"));

    render(<ProductTable products={productsMock} />);
    const buttons = screen.getAllByRole("button", { name: /Baixar/i });

    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith(
        "Erro inesperado, tente novamente!"
      );
    });
  });
});
