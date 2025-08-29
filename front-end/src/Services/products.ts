import api from "../Api/axiosConfig";

// Busca todos os produtos cadastrados
const getAllProducts = async () => {
  try {
    const { data } = await api.get("/products");
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};

// Cria um novo produto com upload via FormData
const postCreateProduct = async (formData: FormData) => {
  try {
    const { data } = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};

// Realiza a compra de um produto
const postPurchaseProduct = async (body: any) => {
  try {
    const { data } = await api.post("/purchase", body);
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};

// Remove um produto pelo ID
const deleteProduct = async (id: number) => {
  try {
    const { data } = await api.delete(`/products/${id}`);
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};

// Edita um produto pelo ID
const editProduct = async (id: number, body: any) => {
  try {
    const { data } = await api.patch(`/products/${id}`, body);
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};

// Faz o download do arquivo PDF de um produto
const fetchFileProduct = async (id: number) => {
  try {
    const response = await api.get(`/products/${id}/file`, {
      responseType: "blob",
      validateStatus: () => true,
    });
    return response; // retorna o objeto completo do Axios
  } catch (error) {
    throw new Error("Erro inesperado na requisição");
  }
};

// Busca os produtos já comprados por um usuário
const getPurchasedByUser = async (id: number) => {
  try {
    const { data } = await api.get(`/products/purchased/${id}`);
    return { data, status: 200 };
  } catch (error: any) {
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data || { message: "Erro inesperado" },
    };
  }
};

export {
  deleteProduct,
  editProduct,
  fetchFileProduct,
  getAllProducts,
  getPurchasedByUser,
  postCreateProduct,
  postPurchaseProduct,
};
