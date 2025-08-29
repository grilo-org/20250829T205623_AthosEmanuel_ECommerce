import { fireEvent, render, screen } from "@testing-library/react";

import UserProfileModal from "./userProfileModal";

// Mock do EditUserModal para controlar abertura e submissão
jest.mock("./editUserModal", () => (props: any) => {
  const { open, onClose, userData, onSubmit } = props;

  if (!open) return null;

  return (
    <div data-testid="edit-user-modal">
      <button
        onClick={() => {
          // Simula submissão com nome e email alterados
          onSubmit({ name: "Novo Nome", email: "novoemail@example.com" });
          onClose();
        }}
      >
        Salvar
      </button>
      <div>{userData.name}</div>
      <div>{userData.email}</div>
      <button onClick={onClose}>Fechar</button>
    </div>
  );
});

describe("UserProfileModal Component", () => {
  const userMock = {
    id: 123,
    name: "Usuário Teste",
    email: "usuario@teste.com",
  };

  const onCloseMock = jest.fn();
  const onUserUpdateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders user data and opens edit modal on edit button click", () => {
    render(
      <UserProfileModal
        open={true}
        onClose={onCloseMock}
        user={userMock}
        onUserUpdate={onUserUpdateMock}
      />
    );

    expect(screen.getByText(userMock.name)).toBeInTheDocument();
    expect(screen.getByText(userMock.email)).toBeInTheDocument();

    const editButton = screen.getByLabelText(`Editar usuário ${userMock.name}`);
    fireEvent.click(editButton);

    expect(screen.getByTestId("edit-user-modal")).toBeInTheDocument();
  });

  test("calls onUserUpdate with updated data when edit modal submits", () => {
    render(
      <UserProfileModal
        open={true}
        onClose={onCloseMock}
        user={userMock}
        onUserUpdate={onUserUpdateMock}
      />
    );

    fireEvent.click(screen.getByLabelText(`Editar usuário ${userMock.name}`));
    fireEvent.click(screen.getByText("Salvar"));
    expect(onUserUpdateMock).toHaveBeenCalledWith({
      ...userMock,
      name: "Novo Nome",
      email: "novoemail@example.com",
    });

    expect(screen.queryByTestId("edit-user-modal")).not.toBeInTheDocument();
  });

  test("calls onClose when close icon is clicked", () => {
    render(
      <UserProfileModal
        open={true}
        onClose={onCloseMock}
        user={userMock}
        onUserUpdate={onUserUpdateMock}
      />
    );

    const closeButton = screen.getByRole("button", { name: /fechar/i });
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
