import { fireEvent, render, screen } from "@testing-library/react";

import ConfirmPurchaseModal from "./confirmPurchaseModal";

describe("ConfirmPurchaseModal component", () => {
  const onCloseMock = jest.fn();
  const onConfirmMock = jest.fn();
  const productTitle = "Produto Teste";
  const productPrice = 123.45;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal with correct title, product info and buttons when open", () => {
    render(
      <ConfirmPurchaseModal
        open={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        productTitle={productTitle}
        productPrice={productPrice}
      />
    );

    expect(screen.getByText(/confirmar compra/i)).toBeInTheDocument();

    expect(
      screen.getByText((content) =>
        content.startsWith("Você deseja comprar o produto")
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(productTitle, { selector: "strong" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`R$ ${productPrice.toFixed(2)}`, { selector: "strong" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancelar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /comprar/i })
    ).toBeInTheDocument();
  });

  test("calls onClose when Cancelar button is clicked", () => {
    render(
      <ConfirmPurchaseModal
        open={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        productTitle={productTitle}
        productPrice={productPrice}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test("calls onConfirm when Comprar button is clicked", () => {
    render(
      <ConfirmPurchaseModal
        open={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        productTitle={productTitle}
        productPrice={productPrice}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /comprar/i }));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  test("does not render modal content when open is false", () => {
    render(
      <ConfirmPurchaseModal
        open={false}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        productTitle={productTitle}
        productPrice={productPrice}
      />
    );

    expect(screen.queryByText(/confirmar compra/i)).not.toBeInTheDocument();
  });
});
