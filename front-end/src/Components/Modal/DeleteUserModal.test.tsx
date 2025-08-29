import { fireEvent, render, screen } from "@testing-library/react";

import DeleteUserModal from "./deleteUserModal";

describe("DeleteUserModal Component", () => {
  const onCloseMock = jest.fn();
  const onConfirmMock = jest.fn();
  const userName = "Usuário Teste";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with userName and buttons", () => {
    render(
      <DeleteUserModal
        open={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        userName={userName}
      />
    );

    expect(screen.getByText(/confirmar exclusão/i)).toBeInTheDocument();

    expect(
      screen.getByText((content, element) => {
        const hasText = content.includes(
          "Tem certeza que deseja excluir o cliente"
        );
        const hasStrong =
          element?.querySelector("strong")?.textContent === userName;
        return hasText && hasStrong;
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancelar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /excluir/i })
    ).toBeInTheDocument();
  });

  test("calls onClose when Cancelar button is clicked", () => {
    render(
      <DeleteUserModal
        open={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        userName={userName}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test("calls onConfirm when Excluir button is clicked", () => {
    render(
      <DeleteUserModal
        open={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        userName={userName}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /excluir/i }));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });
});
