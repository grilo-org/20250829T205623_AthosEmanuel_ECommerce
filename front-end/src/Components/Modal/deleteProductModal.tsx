import { Box, Button, Modal, Stack, Typography } from "@mui/material";

import React from "react";

// Props do modal de exclusão de produto
type DeleteProductModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productTitle: string;
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

// Componente de modal que exibe a confirmação de exclusão de produto
const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  open,
  onClose,
  onConfirm,
  productTitle,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Confirmar Exclusão
        </Typography>
        <Typography variant="body1" mb={3}>
          Tem certeza que deseja excluir o produto{" "}
          <strong>{productTitle}</strong>?
        </Typography>
        <Stack spacing={2} direction="row" justifyContent="flex-end">
          <Button onClick={onClose} color="primary" variant="contained">
            Cancelar
          </Button>
          <Button onClick={onConfirm} color="error" variant="contained">
            Excluir
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default DeleteProductModal;
