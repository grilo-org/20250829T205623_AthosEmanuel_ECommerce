import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login, Products, SingIn } from "./Pages";

import { ToastContainer } from "react-toastify";
import UserProducts from "./Pages/UserProducts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/sing_in" element={<SingIn />} />
        <Route path="/products" element={<Products />} />
        <Route path="/user_products" element={<UserProducts />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
