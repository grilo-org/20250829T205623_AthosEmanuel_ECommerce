import "./style.css";

import {
  Box,
  Button,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

// Props do modal para cadastro de produto
type ProductModalProps = {
  open: boolean; // controla se o modal está aberto
  onClose: () => void; // função para fechar o modal
  onSubmit: (product: Required<Product>) => void; // função para enviar os dados do produto
};

// Tipo que representa os dados do produto
type Product = {
  title: string;
  description: string;
  price: number;
  file?: File;
};

// Estilo para centralizar o modal e configurar sua aparência
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

// Componente modal que exibe o formulário para cadastrar um produto
const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  // Estado que armazena os dados do formulário
  const [form, setForm] = useState<Product>({
    title: "",
    description: "",
    price: 0,
    file: undefined,
  });

  // Referência para o input de arquivo para poder limpar seu valor
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reseta o formulário e limpa o input de arquivo sempre que o modal é fechado
  useEffect(() => {
    if (!open) {
      setForm({ title: "", description: "", price: 0, file: undefined });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open]);

  // Atualiza os valores dos campos de texto e número do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  // Atualiza o campo de arquivo com o arquivo selecionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, file }));
    }
  };

  // Valida o formulário e chama onSubmit para enviar os dados, depois fecha o modal
  const handleSubmit = () => {
    if (!form.title) {
      toast.error("Por favor, insira um título");
      return;
    }
    if (!form.description) {
      toast.error("Por favor, insira uma descrição");
      return;
    }
    if (!form.price) {
      toast.error("Por favor, insira um preço");
      return;
    }
    if (!form.file) {
      toast.error("Por favor, selecione um arquivo PDF");
      return;
    }

    onSubmit(form as Required<Product>);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          textAlign="center"
          mb={2}
        >
          <Typography variant="h6">Cadastrar Produto</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
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
          <label htmlFor="upload-file" className="upload-label">
            {form.file ? form.file.name : "Selecione o arquivo PDF"}
          </label>
          <input
            ref={fileInputRef}
            id="upload-file"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="upload-input"
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Cadastrar
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default ProductModal;
