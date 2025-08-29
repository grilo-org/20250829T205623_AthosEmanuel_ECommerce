import "./style.css";

import React, { useState } from "react";
import { Button, Input } from "../../Components";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { postLogin } from "../../Services/auth";

// Componente de login da aplicação
const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useNavigate();

  // Função que valida se o email tem um formato válido
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Função que verifica se o formulário está válido:
  // - senha com no mínimo 8 caracteres
  // - email em formato válido
  const isFormValid = () => {
    return password.length >= 8 && isValidEmail(email);
  };

  // Função que executa o login do usuário
  const handleLogin = async () => {
    try {
      const body = {
        email: email,
        password: password,
      };
      const resp = await postLogin(body);

      if (resp.status === 200) {
        localStorage.setItem("role", resp.data.user.role);
        localStorage.setItem("token", resp.data.access_token);
        localStorage.setItem("userId", resp.data.user.userId);
        history("/products");
      }

      if (resp.status === 401) {
        toast.error(resp.data.message);
      }
    } catch (error) {
      toast.error("Erro inexperado tente novamente!");
    }
  };

  // Função que redireciona para a página de registro
  const handleSingIn = async () => {
    history("/sing_in");
  };

  return (
    <div className="containerHome">
      <div className="containerForm">
        <h1>LOGIN</h1>

        <label htmlFor="emailInputLogin">Email</label>
        <Input
          id="emailInputLogin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <label htmlFor="passwordInputLogin">Senha</label>
        <Input
          id="passwordInputLogin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <Button
          text="Login"
          handleEvent={() => handleLogin()}
          disable={!isFormValid()}
        />
        <Button text="Registrar" handleEvent={() => handleSingIn()} />
      </div>
    </div>
  );
};

export default Login;
