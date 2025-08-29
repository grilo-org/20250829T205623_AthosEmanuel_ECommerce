import { fireEvent, render, screen } from "@testing-library/react";

import Button from "./index";

describe("Button Component", () => {
  test("should render with the correct text", () => {
    const buttonText = "Meu Botão";
    render(<Button text={buttonText} handleEvent={() => {}} />);
    expect(
      screen.getByRole("button", { name: buttonText })
    ).toBeInTheDocument();
  });

  test("should call handleEvent when clicked", () => {
    const handleClick = jest.fn();
    render(<Button text="Clicar" handleEvent={handleClick} />);
    fireEvent.click(screen.getByRole("button", { name: /clicar/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("should be disabled when disable prop is true", () => {
    const handleClick = jest.fn();
    render(
      <Button text="Desabilitado" handleEvent={handleClick} disable={true} />
    );
    const button = screen.getByRole("button", { name: /desabilitado/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("should be enabled when disable prop is false", () => {
    const handleClick = jest.fn();
    render(
      <Button text="Habilitado" handleEvent={handleClick} disable={false} />
    );

    const button = screen.getByRole("button", { name: /habilitado/i });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
