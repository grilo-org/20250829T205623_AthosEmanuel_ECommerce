import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { BrowserRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { postRegister } from "../../Services/auth";
import SingIn from "./";

// Mock dos imports
jest.mock("../../Services/auth");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
const mockedPostRegister = postRegister as jest.MockedFunction<
  typeof postRegister
>;

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("SingIn Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const setup = () =>
    render(
      <BrowserRouter>
        <SingIn />
      </BrowserRouter>
    );

  test("renders form fields and buttons", () => {
    setup();

    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /criar conta/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /voltar/i })).toBeInTheDocument();
  });

  test("disables create button if form is invalid", () => {
    setup();

    const createButton = screen.getByRole("button", { name: /criar conta/i });

    // Empty fields -> disabled
    expect(createButton).toBeDisabled();

    // Enter invalid email and password
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "invalid" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Jo" },
    });

    expect(createButton).toBeDisabled();

    // Enter valid email, valid password but name too short (< 3)
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "Aa1!aaaa" },
    });
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Jo" },
    });

    expect(createButton).toBeDisabled();

    // Name with 3 characters
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Jon" },
    });

    expect(createButton).toBeEnabled();
  });

  test("calls postRegister and shows success toast and clears fields on success", async () => {
    setup();

    mockedPostRegister.mockResolvedValue({
      status: 200,
      data: { access_token: "abc123" },
    } as any);

    // Fill valid data
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "Aa1!aaaa" },
    });

    const createButton = screen.getByRole("button", { name: /criar conta/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockedPostRegister).toHaveBeenCalledWith({
        name: "John",
        email: "john@test.com",
        password: "Aa1!aaaa",
      });
      expect(localStorage.getItem("token")).toBe("abc123");
      expect(toast.success).toHaveBeenCalledWith(
        "Conta criada com sucesso !!!"
      );
      expect(screen.getByLabelText("Nome")).toHaveValue("");
      expect(screen.getByLabelText("Email")).toHaveValue("");
      expect(screen.getByLabelText("Senha")).toHaveValue("");
    });
  });

  test("shows error toast if postRegister returns 401", async () => {
    setup();

    mockedPostRegister.mockResolvedValue({
      status: 401,
      data: { message: "Unauthorized" },
    } as any);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "Aa1!aaaa" },
    });

    const createButton = screen.getByRole("button", { name: /criar conta/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Unauthorized");
    });
  });

  test("shows error toast on unexpected error", async () => {
    setup();

    mockedPostRegister.mockRejectedValue(new Error("fail"));

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "Aa1!aaaa" },
    });

    const createButton = screen.getByRole("button", { name: /criar conta/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Erro inexperado tente novamente!"
      );
    });
  });

  test("calls navigate('/') on click of back button", () => {
    setup();

    const backButton = screen.getByRole("button", { name: /voltar/i });
    fireEvent.click(backButton);

    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });
});
