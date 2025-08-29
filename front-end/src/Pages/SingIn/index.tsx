import "./style.css";

import React, { useState } from "react";
import { Button, Input } from "../../Components";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { postRegister } from "../../Services/auth";

// Componente responsável pela tela de cadastro de novo usuário
const SingIn: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useNavigate();

  // Expressão Regular que verifica se é um email válido
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Expressão Regular que verifica se a senha é forte (mínimo 8 caracteres, letras maiúsculas/minúsculas, número e símbolo)
  const isValidPassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

  // Regras de senha exibidas como checklist na interface
  const passwordRules = [
    { label: "1 letra minúscula", test: /[a-z]/ },
    { label: "1 letra maiúscula", test: /[A-Z]/ },
    { label: "1 número", test: /\d/ },
    { label: "1 caractere especial", test: /[\W_]/ },
    { label: "mínimo de 8 caracteres", test: /.{8,}/ },
  ];

  // Verifica se o formulário está válido com base no email e senha
  const isFormValid = () => {
    return isValidEmail(email) && isValidPassword(password);
  };

  // Realiza a chamada para a API de registro, salva o token e limpa os campos
  const handleCreateAccount = async () => {
    try {
      const body = {
        name: name,
        email: email,
        password: password,
      };
      const resp = await postRegister(body);

      if (resp.status === 200) {
        localStorage.setItem("token", resp.data.access_token);
        toast.success("Conta criada com sucesso !!!");
        setName("");
        setEmail("");
        setPassword("");
      }
      if (resp.status === 401) {
        toast.error(resp.data.message);
      }
    } catch (error) {
      toast.error("Erro inexperado tente novamente!");
    }
  };

  // Redireciona para a página de login
  const handleBackHome = async () => {
    history("/");
  };

  return (
    <div className="containerSingIn">
      <div className="containerFormSingIn">
        <h1>Cadastrar</h1>
        <div>
          <label htmlFor="nameInputSingIn">Nome</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="nameInputSingIn"
          />
        </div>
        <div>
          <label htmlFor="emailInputSingIn">Email</label>
          <Input
            id="emailInputSingIn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>
        <div>
          <label htmlFor="passwordInputSingIn">Senha</label>
          <Input
            id="passwordInputSingIn"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
          <ul style={{ fontSize: "0.8rem", listStyle: "none", padding: 0 }}>
            {passwordRules.map((rule, index) => (
              <li
                key={index}
                style={{
                  color: rule.test.test(password) ? "lightGreen" : "gray",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {rule.test.test(password) ? "✅" : "⚪"} {rule.label}
              </li>
            ))}
          </ul>
        </div>
        <Button
          text="Criar conta"
          handleEvent={() => handleCreateAccount()}
          disable={!isFormValid() || name.length < 3}
        />

        <Button
          text="Voltar"
          handleEvent={() => handleBackHome()}
          disable={false}
        />
      </div>
    </div>
  );
};

export default SingIn;
