import { fireEvent, render, screen } from "@testing-library/react";

import EditProductModal from "./editProductModal";

describe("EditProductModal Component", () => {
  const onCloseMock = jest.fn();
  const onSubmitMock = jest.fn();
  const productData = {
    title: "Produto Inicial",
    description: "Descrição inicial",
    price: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with initial product data", () => {
    render(
      <EditProductModal
        open={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
        productData={productData}
      />
    );

    expect(screen.getByDisplayValue(productData.title)).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(productData.description)
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(productData.price.toString())
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /salvar alterações/i })
    ).toBeInTheDocument();
  });

  test("updates form fields and submits updated data", () => {
    render(
      <EditProductModal
        open={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
        productData={productData}
      />
    );

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: "Novo Produto" },
    });

    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: "Nova descrição" },
    });

    fireEvent.change(screen.getByLabelText(/preço/i), {
      target: { value: "150" },
    });

    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    expect(onSubmitMock).toHaveBeenCalledWith({
      title: "Novo Produto",
      description: "Nova descrição",
      price: 150,
    });
    expect(onCloseMock).toHaveBeenCalled();
  });
});
