import "./style.css";

import React from "react";

// Interface que define as propriedades aceitas pelo componente Button
interface ButtonProps {
  text: string;
  handleEvent: (event: React.MouseEvent<HTMLButtonElement>) => void;
  customStyles?: React.CSSProperties;
  disable?: boolean;
}

/**
 * Componente de botão reutilizável.
 * Recebe texto, evento de clique, estilos opcionais e estado de desabilitação.
 */
const Button: React.FC<ButtonProps> = ({
  text,
  customStyles,
  handleEvent,
  disable,
}) => {
  return (
    <button
      style={customStyles}
      onClick={handleEvent}
      className="buttonBody"
      disabled={disable}
    >
      {text}
    </button>
  );
};

export default Button;
