import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { fetchFileProduct } from "../../Services/products";
import ProductCard from "./";
// ProductCard.test.tsx
import { toast } from "react-toastify";

// Mock modals
jest.mock("../index", () => ({
  ConfirmPurchaseModal: ({ open, onClose, onConfirm }: any) =>
    open ? (
      <div data-testid="purchase-modal">
        <button onClick={onConfirm}>Confirm Purchase</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
  EditProductModal: ({ open, onClose, onSubmit }: any) =>
    open ? (
      <div data-testid="edit-modal">
        <button
          onClick={() =>
            onSubmit({ title: "New", description: "New", price: 123 })
          }
        >
          Confirm Edit
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
  DeleteProductModal: ({ open, onClose, onConfirm }: any) =>
    open ? (
      <div data-testid="delete-modal">
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock("../../Services/products", () => ({
  fetchFileProduct: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const defaultProps = {
  title: "Test Product",
  description: "Test Description",
  price: 99.9,
  purchased: false,
  productId: 1,
  onPurchase: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  isAdm: false,
  id: 1,
};

describe("ProductCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders product details correctly", () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("R$ 99.90")).toBeInTheDocument();
  });

  it("shows 'Comprar' button if user is not admin and hasn't purchased", () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText("Comprar")).toBeInTheDocument();
  });

  it("opens purchase modal when 'Comprar' is clicked", () => {
    render(<ProductCard {...defaultProps} />);
    fireEvent.click(screen.getByText("Comprar"));
    expect(screen.getByTestId("purchase-modal")).toBeInTheDocument();
  });

  it("calls onPurchase when confirming purchase", () => {
    render(<ProductCard {...defaultProps} />);
    fireEvent.click(screen.getByText("Comprar"));
    fireEvent.click(screen.getByText("Confirm Purchase"));
    expect(defaultProps.onPurchase).toHaveBeenCalledWith(1);
  });

  it("shows 'Baixar' button if user purchased product", () => {
    render(<ProductCard {...defaultProps} purchased={true} />);
    expect(screen.getByText("Baixar")).toBeInTheDocument();
  });

  it("shows admin action buttons when isAdm is true", () => {
    render(<ProductCard {...defaultProps} isAdm={true} />);
    expect(screen.getByText("Editar")).toBeInTheDocument();
    expect(screen.getByText("Deletar")).toBeInTheDocument();
  });

  it("opens edit modal and calls onEdit", () => {
    render(<ProductCard {...defaultProps} isAdm={true} />);
    fireEvent.click(screen.getByText("Editar"));
    fireEvent.click(screen.getByText("Confirm Edit"));
    expect(defaultProps.onEdit).toHaveBeenCalledWith(1, {
      title: "New",
      description: "New",
      price: 123,
    });
  });

  it("opens delete modal and calls onDelete", () => {
    render(<ProductCard {...defaultProps} isAdm={true} />);
    fireEvent.click(screen.getByText("Deletar"));
    fireEvent.click(screen.getByText("Confirm Delete"));
    expect(defaultProps.onDelete).toHaveBeenCalledWith(1);
  });

  it("handles 403 error on download", async () => {
    (fetchFileProduct as jest.Mock).mockResolvedValue({
      data: {},
      status: 403,
    });

    render(<ProductCard {...defaultProps} purchased={true} />);
    fireEvent.click(screen.getByText("Baixar"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Você atingiu o limite de downloads para este produto"
      );
    });
  });

  it("handles unexpected error on download", async () => {
    (fetchFileProduct as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    render(<ProductCard {...defaultProps} purchased={true} />);
    fireEvent.click(screen.getByText("Baixar"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Erro inesperado, tente novamente!"
      );
    });
  });
});
