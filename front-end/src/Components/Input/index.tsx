import "./style.css";

import React, { useState } from "react";

// Define as propriedades esperadas pelo componente Input.
interface InputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  customStyles?: React.CSSProperties;
  disabled?: boolean;
  name?: string;
  id?: string;
}

// Componente de input reutilizável com suporte a tipos variados e
// opção de mostrar/ocultar senha quando type="password".
const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  type = "text",
  customStyles,
  disabled = false,
  name,
  id,
}) => {
  // Estado que controla a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);

  // Verifica se o tipo do input é senha
  const isPassword = type === "password";
  // Define o tipo do input conforme estado showPassword
  const inputType = isPassword && !showPassword ? "password" : "text";

  return (
    <div className="input-wrapper" style={{ position: "relative" }}>
      <input
        name={name}
        className="inputBody"
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={customStyles}
        disabled={disabled}
        id={id}
      />

      {/* Botão para mostrar ou ocultar a senha, visível somente para inputs do tipo password */}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.9rem",
            color: "#666",
          }}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? "Ocultar" : "Mostrar"}
        </button>
      )}
    </div>
  );
};

export default Input;
