import api from "../Api/axiosConfig";

export interface User {
  name?: string;
  email?: string;
  password?: string;
}

/**
 * Realiza requisição POST para autenticação do usuário.
 * @param body - Objeto contendo email e senha do usuário.
 * @returns Objeto com dados da resposta e status HTTP.
 */
export const postLogin = async (body: User) => {
  try {
    const { data } = await api.post("/auth/login", body);
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};

/**
 * Realiza requisição POST para cadastro de novo usuário.
 * @param body - Objeto contendo nome, email e senha do usuário.
 * @returns Objeto com dados da resposta e status HTTP.
 */
export const postRegister = async (body: User) => {
  try {
    const { data } = await api.post("/auth/register", body);
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};
