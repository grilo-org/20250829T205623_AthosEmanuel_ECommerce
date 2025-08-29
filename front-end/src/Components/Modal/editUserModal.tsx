import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

// Tipo dos dados do usuário
type User = {
  name: string;
  email: string;
};

// Props do modal de edição de usuário
type EditUserModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: User) => void;
  userData: User;
};

// Estilo do Modal
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
// Componente de modal que permite editar os dados de um usuário
const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  onSubmit,
  userData,
}) => {
  const [form, setForm] = useState<User>(userData);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  // Atualiza o formulário com os dados mais recentes ao abrir o modal
  useEffect(() => {
    setForm(userData);
    setErrors({});
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  // Função auxiliar para validar o formato do e-mail
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Função que realiza a validação dos campos do formulário
  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!form.name || form.name.trim().length < 3) {
      newErrors.name = "O nome deve ter pelo menos 3 letras.";
    }

    if (!form.email || !isValidEmail(form.email)) {
      newErrors.email = "E-mail inválido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função que envia os dados editados se forem válidos
  const handleSubmit = () => {
    if (validate()) {
      onSubmit(form);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" mb={2}>
          Editar Usuário
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            error={Boolean(errors.name)}
            helperText={errors.name}
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Salvar Alterações
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default EditUserModal;
