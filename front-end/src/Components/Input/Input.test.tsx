import { fireEvent, render, screen } from "@testing-library/react";

import Input from "./index";

describe("Input component", () => {
  const onChangeMock = jest.fn();

  test("renders input with given props", () => {
    render(
      <Input
        value="hello"
        onChange={onChangeMock}
        placeholder="Type here"
        name="testInput"
        id="inputId"
      />
    );

    const input = screen.getByPlaceholderText("Type here") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("hello");
    expect(input.name).toBe("testInput");
    expect(input.id).toBe("inputId");
    expect(input.type).toBe("text");
  });

  test("calls onChange when input value changes", () => {
    render(<Input value="" onChange={onChangeMock} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "new value" } });

    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  test("renders password input and toggles visibility", () => {
    render(<Input value="123" onChange={onChangeMock} type="password" />);

    const input = screen.getByDisplayValue("123") as HTMLInputElement;
    const toggleButton = screen.getByRole("button", { name: /mostrar/i });

    expect(input.type).toBe("password");

    fireEvent.click(toggleButton);
    expect(
      screen.getByRole("button", { name: /ocultar/i })
    ).toBeInTheDocument();
    expect(input.type).toBe("text");

    fireEvent.click(screen.getByRole("button", { name: /ocultar/i }));
    expect(
      screen.getByRole("button", { name: /mostrar/i })
    ).toBeInTheDocument();
    expect(input.type).toBe("password");
  });

  test("renders disabled input", () => {
    render(<Input value="disabled" onChange={onChangeMock} disabled />);

    const input = screen.getByDisplayValue("disabled") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  test("applies custom styles", () => {
    render(
      <Input
        value=""
        onChange={onChangeMock}
        customStyles={{ backgroundColor: "red" }}
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveStyle("background-color: rgb(255, 0, 0)");
  });
});
