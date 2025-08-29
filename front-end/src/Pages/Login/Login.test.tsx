// src/pages/Login/Login.test.tsx

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import React from "react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { postLogin } from "../../Services/auth";
import Login from "./index";

// --- Mocks ---
const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("../../Services/auth", () => ({
  postLogin: jest.fn(),
}));

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  test("should render login form elements", () => {
    renderComponent();

    expect(screen.getByText("LOGIN")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Registrar/i })
    ).toBeInTheDocument();
  });

  test("Login button should be disabled initially", () => {
    renderComponent();
    const loginButton = screen.getByRole("button", { name: /Login/i });
    expect(loginButton).toBeDisabled();
  });

  test("Login button should be enabled when form is valid", () => {
    renderComponent();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Senha");
    const loginButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(loginButton).toBeEnabled();
  });

  test("should show error toast for invalid email format", () => {
    renderComponent();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Senha");
    const loginButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(loginButton).toBeDisabled();
  });

  test("should show error toast for password less than 8 characters", () => {
    renderComponent();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Senha");
    const loginButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "short" } });

    expect(loginButton).toBeDisabled();
  });

  test("should call postLogin and navigate on successful login", async () => {
    (postLogin as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: {
        user: { role: "admin", userId: "123" },
        access_token: "fake-token",
      },
    });

    renderComponent();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Senha");
    const loginButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(postLogin).toHaveBeenCalledTimes(1);
      expect(postLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(localStorage.getItem("role")).toBe("admin");
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(localStorage.getItem("userId")).toBe("123");
      expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/products");
    });
  });

  test("should show error toast on 401 login failure", async () => {
    (postLogin as jest.Mock).mockResolvedValueOnce({
      status: 401,
      data: { message: "Credenciais inválidas" },
    });

    renderComponent();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Senha");
    const loginButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(postLogin).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith("Credenciais inválidas");
      expect(mockedUsedNavigate).not.toHaveBeenCalled();
    });
  });

  test("should show generic error toast on unexpected login error", async () => {
    (postLogin as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    renderComponent();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Senha");
    const loginButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(postLogin).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith(
        "Erro inexperado tente novamente!"
      );
      expect(mockedUsedNavigate).not.toHaveBeenCalled();
    });
  });

  test("should navigate to /sing_in when Registrar button is clicked", () => {
    renderComponent();

    const registerButton = screen.getByRole("button", { name: /Registrar/i });
    fireEvent.click(registerButton);

    expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/sing_in");
  });
});
