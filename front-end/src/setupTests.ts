import "@testing-library/jest-dom";

if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Not implemented: navigation")
  ) {
    return;
  }
  originalError(...args);
};

beforeEach(() => {
  if (!global.URL) {
    (global as any).URL = {};
  }
  if (!global.URL.createObjectURL) {
    global.URL.createObjectURL = jest.fn();
  }

  jest
    .spyOn(global.URL, "createObjectURL")
    .mockReturnValue("blob:http://localhost/test");
});
