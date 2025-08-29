import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

// Define as propriedades esperadas pelo modal de edição de produto
type EditProductModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
  productData: Product;
};

// Define o formato esperado de um produto
type Product = {
  title: string;
  description: string;
  price: number;
};

// Componente de modal que permite editar os dados de um produto existente
const EditProductModal: React.FC<EditProductModalProps> = ({
  open,
  onClose,
  onSubmit,
  productData,
}) => {
  const [form, setForm] = useState<Product>(productData);

  // Atualiza os dados do formulário sempre que os dados do produto mudarem
  useEffect(() => {
    setForm(productData);
  }, [productData]);

  // Lida com a mudança de campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  // Dispara o evento de submissão e fecha o modal
  const handleSubmit = () => {
    onSubmit(form);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={2}>
          Editar Produto
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Título"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Descrição"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />
          <TextField
            label="Preço"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Salvar Alterações
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80vw",
  maxWidth: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default EditProductModal;
