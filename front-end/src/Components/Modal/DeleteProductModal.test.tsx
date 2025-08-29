import { fireEvent, render, screen } from "@testing-library/react";

import DeleteProductModal from "./deleteProductModal";

describe("DeleteProductModal Component", () => {
  const onCloseMock = jest.fn();
  const onConfirmMock = jest.fn();
  const productTitle = "Produto Teste";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal with product title and buttons", () => {
    render(
      <DeleteProductModal
        open={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        productTitle={productTitle}
      />
    );

    expect(screen.getByText("Confirmar Exclusão")).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(`Tem certeza que deseja excluir o produto`, "i")
      )
    ).toBeInTheDocument();
    expect(screen.getByText(productTitle)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancelar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /excluir/i })
    ).toBeInTheDocument();
  });

  test("calls onClose when clicking Cancelar", () => {
    render(
      <DeleteProductModal
        open={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        productTitle={productTitle}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test("calls onConfirm when clicking Excluir", () => {
    render(
      <DeleteProductModal
        open={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        productTitle={productTitle}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });
});
