import "./style.css";

import React, { useEffect, useState } from "react";
import { Button, ProductTable } from "../../Components";

import { useNavigate } from "react-router-dom";
import { getPurchasedByUser } from "../../Services/products";

// Tipo que representa um produto adquirido pelo usuário
type ProductType = {
  id: number;
  title: string;
  description: string;
  price: number;
  fileUrl: string;
  purchased: boolean;
};

const UserProducts: React.FC = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [refreshTrigger] = useState(0);
  const id = localStorage.getItem("userId");
  const history = useNavigate();

  // Navega para a página de listagem de produtos
  const handleBackProducts = () => {
    history("/products");
  };

  // Remove dados de autenticação e redireciona para a página inicial (logout)
  const handleExitStore = () => {
    localStorage.setItem("role", "");
    localStorage.setItem("token", "");
    localStorage.setItem("userId", "");
    history("/");
  };

  // Busca os produtos adquiridos pelo usuário no backend sempre que refreshTrigger mudar
  useEffect(() => {
    const handleProducts = async () => {
      try {
        const data = await getPurchasedByUser(Number(id));
        setProducts(data.data);
      } catch (error) {
        console.error("Erro ao buscar produtos", error);
      }
    };
    handleProducts();
  }, [refreshTrigger]);

  return (
    <div className="containerUserProducts">
      <h1>Meus Produtos</h1>
      <div>
        {products.length > 0 ? (
          <ProductTable products={products} />
        ) : (
          <p>Nenhum produto adquirido.</p>
        )}
      </div>
      <Button handleEvent={handleBackProducts} text="Voltar" />
      <Button handleEvent={handleExitStore} text="Sair" />
    </div>
  );
};

export default UserProducts;
