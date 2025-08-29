import { fireEvent, render, screen } from "@testing-library/react";

import EditUserModal from "./editUserModal";

describe("EditUserModal Component", () => {
  const onCloseMock = jest.fn();
  const onSubmitMock = jest.fn();
  const userData = { name: "João", email: "joao@email.com" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with initial user data", () => {
    render(
      <EditUserModal
        open={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
        userData={userData}
      />
    );

    expect(screen.getByLabelText(/nome/i)).toHaveValue(userData.name);
    expect(screen.getByLabelText(/email/i)).toHaveValue(userData.email);
    expect(
      screen.getByRole("button", { name: /salvar alterações/i })
    ).toBeInTheDocument();
  });

  test("shows validation errors for invalid input", () => {
    render(
      <EditUserModal
        open={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
        userData={{ name: "", email: "invalid-email" }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    expect(
      screen.getByText(/o nome deve ter pelo menos 3 letras/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    expect(onSubmitMock).not.toHaveBeenCalled();
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  test("calls onSubmit and onClose on valid submit", () => {
    render(
      <EditUserModal
        open={true}
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
        userData={userData}
      />
    );

    const nameInput = screen.getByLabelText(/nome/i);
    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.change(nameInput, { target: { value: "Maria" } });
    fireEvent.change(emailInput, { target: { value: "maria@email.com" } });

    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    expect(onSubmitMock).toHaveBeenCalledWith({
      name: "Maria",
      email: "maria@email.com",
    });
    expect(onCloseMock).toHaveBeenCalled();
  });
});
