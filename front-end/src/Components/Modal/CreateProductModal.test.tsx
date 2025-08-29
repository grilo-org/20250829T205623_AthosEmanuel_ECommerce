// ProductModal.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";

import { toast } from "react-toastify";
import ProductModal from "./createProductModal";

// Mock do toast
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("ProductModal", () => {
  const onCloseMock = jest.fn();
  const onSubmitMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal fields and buttons when open", () => {
    render(
      <ProductModal open={true} onClose={onCloseMock} onSubmit={onSubmitMock} />
    );

    expect(screen.getByText(/Cadastrar Produto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preço/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecione o arquivo PDF/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Cadastrar/i })
    ).toBeInTheDocument();
  });

  test("updates form fields correctly", () => {
    render(
      <ProductModal open={true} onClose={onCloseMock} onSubmit={onSubmitMock} />
    );

    fireEvent.change(screen.getByLabelText(/Título/i), {
      target: { value: "Produto Teste" },
    });
    fireEvent.change(screen.getByLabelText(/Descrição/i), {
      target: { value: "Descrição do produto" },
    });
    fireEvent.change(screen.getByLabelText(/Preço/i), {
      target: { value: "123.45" },
    });

    expect(screen.getByLabelText(/Título/i)).toHaveValue("Produto Teste");
    expect(screen.getByLabelText(/Descrição/i)).toHaveValue(
      "Descrição do produto"
    );
    expect(screen.getByLabelText(/Preço/i)).toHaveValue(123.45);
  });

  test("selects file and shows file name", () => {
    render(
      <ProductModal open={true} onClose={onCloseMock} onSubmit={onSubmitMock} />
    );

    const file = new File(["dummy content"], "arquivo.pdf", {
      type: "application/pdf",
    });

    const fileInput = screen
      .getByLabelText(/Selecione o arquivo PDF/i)
      .parentElement?.querySelector('input[type="file"]');

    fireEvent.change(fileInput!, { target: { files: [file] } });

    expect(screen.getByText("arquivo.pdf")).toBeInTheDocument();
  });

  test("shows toast if submitting without required fields", () => {
    render(
      <ProductModal open={true} onClose={onCloseMock} onSubmit={onSubmitMock} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    expect(toast.error).toHaveBeenCalledWith("Por favor, insira um título");
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  test("shows toast if missing file", () => {
    render(
      <ProductModal open={true} onClose={onCloseMock} onSubmit={onSubmitMock} />
    );

    fireEvent.change(screen.getByLabelText(/Título/i), {
      target: { value: "Produto Teste" },
    });
    fireEvent.change(screen.getByLabelText(/Descrição/i), {
      target: { value: "Desc" },
    });
    fireEvent.change(screen.getByLabelText(/Preço/i), {
      target: { value: "123.45" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    expect(toast.error).toHaveBeenCalledWith(
      "Por favor, selecione um arquivo PDF"
    );
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  test("submits form with file and calls onClose", () => {
    const file = new File(["content"], "arquivo.pdf", {
      type: "application/pdf",
    });

    render(
      <ProductModal open={true} onClose={onCloseMock} onSubmit={onSubmitMock} />
    );

    fireEvent.change(screen.getByLabelText(/Título/i), {
      target: { value: "Produto Teste" },
    });
    fireEvent.change(screen.getByLabelText(/Descrição/i), {
      target: { value: "Descrição" },
    });
    fireEvent.change(screen.getByLabelText(/Preço/i), {
      target: { value: "123.45" },
    });

    const fileInput = screen
      .getByLabelText(/Selecione o arquivo PDF/i)
      .parentElement?.querySelector('input[type="file"]')!;
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    expect(onSubmitMock).toHaveBeenCalledWith({
      title: "Produto Teste",
      description: "Descrição",
      price: 123.45,
      file,
    });
    expect(onCloseMock).toHaveBeenCalled();
  });

  test("resets form when modal closes", () => {
    const { rerender } = render(
      <ProductModal open={true} onClose={onCloseMock} onSubmit={onSubmitMock} />
    );

    fireEvent.change(screen.getByLabelText(/Título/i), {
      target: { value: "Produto Teste" },
    });
    fireEvent.change(screen.getByLabelText(/Descrição/i), {
      target: { value: "Descrição" },
    });
    fireEvent.change(screen.getByLabelText(/Preço/i), {
      target: { value: "123.45" },
    });

    const file = new File(["content"], "arquivo.pdf", {
      type: "application/pdf",
    });
    const fileInput = screen
      .getByLabelText(/Selecione o arquivo PDF/i)
      .parentElement?.querySelector('input[type="file"]')!;
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Fecha o modal
    rerender(
      <ProductModal
        open={false}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
      />
    );

    expect(screen.queryByDisplayValue("Produto Teste")).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("Descrição")).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("123.45")).not.toBeInTheDocument();
    expect(screen.queryByText("arquivo.pdf")).not.toBeInTheDocument();
  });
});
