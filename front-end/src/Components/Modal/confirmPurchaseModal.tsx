import { Box, Button, Modal, Stack, Typography } from "@mui/material";

import React from "react";

// Propriedades do modal de confirmação de compra
type ConfirmPurchaseModalProps = {
  open: boolean; // controla se o modal está aberto ou não
  onClose: () => void; // função chamada ao fechar o modal
  onConfirm: () => void; // função chamada ao confirmar a compra
  productTitle: string; // título do produto a ser comprado
  productPrice: number; // preço do produto a ser comprado
};

// Estilo para centralizar o modal na tela
const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

// Componente modal para confirmar a compra de um produto
const ConfirmPurchaseModal: React.FC<ConfirmPurchaseModalProps> = ({
  open,
  onClose,
  onConfirm,
  productTitle,
  productPrice,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Confirmar Compra
        </Typography>
        <Typography>
          Você deseja comprar o produto <strong>{productTitle}</strong> por{" "}
          <strong>R$ {productPrice.toFixed(2)}</strong>?
        </Typography>

        <Stack direction="row" spacing={2} mt={4} justifyContent="flex-end">
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancelar
          </Button>
          <Button onClick={onConfirm} color="primary" variant="contained">
            Comprar
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default ConfirmPurchaseModal;
