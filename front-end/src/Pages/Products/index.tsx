import "./style.css";

import React, { useEffect, useState } from "react";
import { Button, ProductModal } from "../../Components";
import {
  deleteProduct,
  editProduct,
  getAllProducts,
  postCreateProduct,
  postPurchaseProduct,
} from "../../Services/products";
import { deleteUser, getAllUsers, getUser, putUser } from "../../Services/user";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../../Components/Card";
import ListUsersModal from "../../Components/Modal/listUsersModal";
import UserProfileModal from "../../Components/Modal/userProfileModal";

// Tipo dos dados de um produto retornado pela API
type ProductType = {
  id: number;
  title: string;
  description: string;
  price: number;
  fileUrl: string;
  purchased: boolean;
};

// Tipo para submissão de produto no cadastro (arquivo obrigatório)
type ProductSubmit = {
  title: string;
  description?: string;
  price: number;
  file: File;
};

// Tipo dos dados dos usuários da lista de usuários
type Users = {
  userId: number;
  name: string;
  email: string;
};

// Tipo dos dados de um único usuário (perfil)
type User = {
  id?: number;
  name: string;
  email: string;
};

// Componente principal da página de produtos
const Products: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [users, setUsers] = useState<Users[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [openModalListUsers, setOpenModalListUsers] = useState(false);
  const [openModalCreateProduct, setOpenModalCreateProduct] = useState(false);
  const [openModalUserProfile, setOpenModalUserProfile] = useState(false);

  const history = useNavigate();
  const role = localStorage.getItem("role");

  // Função para criar produto
  const handleCreateProduct = async (product: ProductSubmit) => {
    try {
      const formData = new FormData();
      formData.append("title", product.title);
      if (product.description)
        formData.append("description", product.description);
      formData.append("price", String(product.price));
      formData.append("file", product.file);

      const resp = await postCreateProduct(formData);
      if (resp.status === 200) {
        toast.success("Produto cadastrado com sucesso !!!");
        setRefreshTrigger((prev) => prev + 1);
      }
      if (resp.status === 403) {
        toast.error(resp.data.message);
      }
    } catch (error) {
      toast.error("Erro inesperado, tente novamente!");
    }
  };

  // Função para comprar o produto
  const handlePurchaseProduct = async (id: number) => {
    try {
      const body = { productId: id };
      const resp = await postPurchaseProduct(body);
      if (resp.status === 200) {
        toast.success("Produto comprado com sucesso !!!");
        setRefreshTrigger((prev) => prev + 1);
      }
      if (resp.status === 400) {
        toast.error(resp.data.message);
      }
    } catch (error) {}
  };

  // Função para editar produto
  const handleEditProduct = async (id: number, updatedData: any) => {
    try {
      const resp = await editProduct(id, updatedData);
      if (resp.status === 200) {
        toast.success("Produto atualizado com sucesso !!!");
        setRefreshTrigger((prev) => prev + 1);
      }
      if (resp.status === 400) {
        toast.error(resp.data.message);
      }
    } catch (error) {
      console.error("Erro ao atualizar o produto:", error);
      toast.error("Erro inesperado, tente novamente!");
    }
  };

  // Função para deletar produto
  const handleDeleteProduct = async (id: number) => {
    try {
      const resp = await deleteProduct(id);
      if (resp.status === 200) {
        toast.success("Produto excluído com sucesso !!!");
        setRefreshTrigger((prev) => prev + 1);
      }
      if (resp.status === 400) {
        toast.error(resp.data.message);
      }
    } catch (error) {
      toast.error("Erro inesperado, tente novamente!");
    }
  };

  // Função para buscar lista de usuários
  const handleGetAllUsers = async () => {
    try {
      const resp = await getAllUsers();
      if (resp) {
        setUsers(resp.data);
        setOpenModalListUsers(true);
      }
    } catch (error) {
      toast.error("Erro inesperado, tente novamente!");
    }
  };

  // Função para abrir modal de perfil do usuário
  const handleUserProfile = async () => {
    try {
      const resp = await getUser();
      if (resp) {
        setUser(resp.data);
        setOpenModalUserProfile(true);
      }
    } catch (error) {
      toast.error("Erro inesperado, tente novamente!");
    }
  };

  // Função para deletar usuário
  const handleDeleteUser = async (id: number) => {
    try {
      const resp = await deleteUser(id);
      if (resp.status === 200) {
        toast.success("Usuário excluído com sucesso !!!");
        handleGetAllUsers();
      }
      if (resp.status === 400) {
        toast.error(resp.data.message);
      }
    } catch (error) {
      console.error("Erro ao excluir o produto:", error);
      toast.error("Erro inesperado, tente novamente!");
    }
  };

  // Função para atualizar perfil do usuário
  const handleUserUpdate = async (updatedUser: User) => {
    try {
      const body = {
        name: updatedUser.name,
        email: updatedUser.email,
      };
      await putUser(body);
      setRefreshTrigger((prev) => prev + 1);
      toast.success("Usuário atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro inesperado, tente novamente!");
    }
  };

  // Função para redirecionar usuário para página dos seus produtos
  const handleUserProducts = () => {
    history("/user_products");
  };

  // Função para sair do sistema
  const handleExitStore = () => {
    localStorage.setItem("role", "");
    localStorage.setItem("token", "");
    localStorage.setItem("userId", "");
    history("/");
  };

  // useEffect que busca todos os produtos ao carregar ou atualizar refreshTrigger
  useEffect(() => {
    const handleProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data.data);
      } catch (error) {
        console.error("Erro ao buscar produtos", error);
      }
    };
    handleProducts();
  }, [refreshTrigger]);

  return (
    <div className="containerProducts">
      <h1>Produtos</h1>
      {role !== "user" && (
        <>
          <Button
            handleEvent={() => setOpenModalCreateProduct(true)}
            text="Cadastrar produto"
          />
          <Button
            handleEvent={() => handleGetAllUsers()}
            text="Lista de Usuários"
          />
        </>
      )}
      {role === "user" && (
        <>
          <Button
            handleEvent={() => handleUserProducts()}
            text="Visualizar meus produtos"
          />
          <Button
            handleEvent={() => handleUserProfile()}
            text="Visualizar meu perfil"
          />
        </>
      )}

      <div className="bodyProducts">
        {products.length > 0 ? (
          products.map((product) => (
            <Card
              key={product.id}
              id={product.id}
              title={product.title}
              description={product.description}
              price={product.price}
              purchased={product.purchased}
              productId={product.id}
              onPurchase={handlePurchaseProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              isAdm={role === "admin"}
            />
          ))
        ) : (
          <>
            <div></div>
            <p>Nenhum produto disponível.</p>
          </>
        )}

        <ProductModal
          open={openModalCreateProduct}
          onClose={() => setOpenModalCreateProduct(false)}
          onSubmit={handleCreateProduct}
        />
        <ListUsersModal
          open={openModalListUsers}
          onClose={() => setOpenModalListUsers(false)}
          clients={users}
          onDeleteUser={handleDeleteUser}
        />
        {user && (
          <>
            <UserProfileModal
              open={openModalUserProfile}
              onClose={() => setOpenModalUserProfile(false)}
              onUserUpdate={handleUserUpdate}
              user={user}
            />
          </>
        )}
      </div>

      <Button handleEvent={handleExitStore} text="Sair" />
    </div>
  );
};

export default Products;
