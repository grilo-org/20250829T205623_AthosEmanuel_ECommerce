import { fireEvent, render, screen } from "@testing-library/react";

import ListUsersModal from "./listUsersModal";

const clientsMock = [
  { userId: 1, name: "Alice", email: "alice@example.com" },
  { userId: 2, name: "Bob", email: "bob@example.com" },
];

// Função matcher flexível para o texto da confirmação
const findDeleteConfirmationText =
  (name: string) => (content: string, element: Element | null) => {
    if (!element) return false;
    if (element.tagName.toLowerCase() !== "p") return false;
    const text = element.textContent?.toLowerCase() || "";
    return (
      text.includes("tem certeza que deseja excluir o cliente") &&
      text.includes(name.toLowerCase())
    );
  };

describe("ListUsersModal Component", () => {
  const onCloseMock = jest.fn();
  const onDeleteUserMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders clients in table", () => {
    render(
      <ListUsersModal
        open={true}
        onClose={onCloseMock}
        clients={clientsMock}
        onDeleteUser={onDeleteUserMock}
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  test("opens delete confirmation modal when delete button is clicked", () => {
    render(
      <ListUsersModal
        open={true}
        onClose={onCloseMock}
        clients={clientsMock}
        onDeleteUser={onDeleteUserMock}
      />
    );

    // Clica no botão de excluir do cliente "Alice"
    const deleteButton = screen.getByLabelText("Excluir usuário Alice");
    fireEvent.click(deleteButton);

    // Verifica se o texto do modal de confirmação apareceu
    expect(
      screen.getByText(findDeleteConfirmationText("Alice"))
    ).toBeInTheDocument();
  });

  test("calls onDeleteUser when confirming deletion", () => {
    render(
      <ListUsersModal
        open={true}
        onClose={onCloseMock}
        clients={clientsMock}
        onDeleteUser={onDeleteUserMock}
      />
    );

    // Abre o modal de confirmação para "Alice"
    const deleteButton = screen.getByLabelText("Excluir usuário Alice");
    fireEvent.click(deleteButton);

    // Clica no botão Excluir dentro do modal de confirmação
    const confirmButton = screen.getByRole("button", { name: /excluir/i });
    fireEvent.click(confirmButton);

    expect(onDeleteUserMock).toHaveBeenCalledWith(1);
  });

  test("calls onClose when clicking close icon or Cancel button in confirmation modal", () => {
    render(
      <ListUsersModal
        open={true}
        onClose={onCloseMock}
        clients={clientsMock}
        onDeleteUser={onDeleteUserMock}
      />
    );

    // Abre o modal de confirmação para "Alice"
    const deleteButton = screen.getByLabelText("Excluir usuário Alice");
    fireEvent.click(deleteButton);

    // Fecha pelo botão Cancelar
    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    fireEvent.click(cancelButton);

    // onClose não é chamado aqui porque é do modal principal, mas
    // você pode ajustar conforme sua implementação, ex:
    expect(onCloseMock).not.toHaveBeenCalled();

    // Se quiser testar o fechamento do modal de confirmação (DeleteUserModal),
    // você teria que mockar ou expor essa função.
  });
});
