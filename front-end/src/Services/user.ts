import api from "../Api/axiosConfig";
import { User } from "./auth";

// Busca todos os usuários cadastrados (apenas para admins)
const getAllUsers = async () => {
  try {
    const { data } = await api.get("/user");
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};

// Remove um usuário pelo ID (restrito a admins)
const deleteUser = async (id: number) => {
  try {
    const { data } = await api.delete(`/user/${id}`);
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};

// Obtém os dados do usuário atualmente autenticado
const getUser = async () => {
  try {
    const { data } = await api.get("/user/me");
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};

// Atualiza os dados do usuário atualmente autenticado
const putUser = async (body: User) => {
  try {
    const { data } = await api.put("/user/me", body);
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};

export { deleteUser, getAllUsers, getUser, putUser };
