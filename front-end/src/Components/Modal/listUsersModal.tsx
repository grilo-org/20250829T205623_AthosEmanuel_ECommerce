import {
  Box,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteUserModal from "./deleteUserModal";

// Tipo representando um cliente (usuário)
type Client = {
  userId: number;
  name: string;
  email: string;
};

// Props esperadas pelo componente de modal de listagem de usuários
type ListUsersModalProps = {
  open: boolean; // Indica se o modal está visível
  onClose: () => void; // Função para fechar o modal
  clients: Client[]; // Lista de clientes a ser exibida
  onDeleteUser: (id: number) => void; // Função chamada ao confirmar exclusão
};

// Estilo customizado do modal
const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: 700,
  maxHeight: "80vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

// Componente que exibe um modal com a lista de usuários e opção de exclusão
const ListUsersModal: React.FC<ListUsersModalProps> = ({
  open,
  onClose,
  clients,
  onDeleteUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<Client | null>(null); // Usuário selecionado para exclusão
  const [confirmOpen, setConfirmOpen] = useState(false); // Controle de visibilidade do modal de confirmação

  // Abre o modal de confirmação de exclusão e define o usuário selecionado
  const handleOpenDelete = (client: Client) => {
    setSelectedUser(client);
    setConfirmOpen(true);
  };

  // Confirma a exclusão do usuário selecionado
  const handleConfirmDelete = () => {
    if (selectedUser) {
      onDeleteUser(selectedUser.userId);
      setConfirmOpen(false);
      setSelectedUser(null);
    }
  };

  // Fecha o modal de confirmação e limpa o usuário selecionado
  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Lista de Clientes</Typography>
            <IconButton onClick={onClose} aria-label="Fechar">
              <CloseIcon />
            </IconButton>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Nome</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Ação</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.length > 0 ? (
                  clients.map((client) => (
                    <TableRow key={client.userId}>
                      <TableCell>{client.userId}</TableCell>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDelete(client)}
                          aria-label={`Excluir usuário ${client.name}`}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>

      {selectedUser && (
        <DeleteUserModal
          open={confirmOpen}
          onClose={handleCloseConfirm}
          onConfirm={handleConfirmDelete}
          userName={selectedUser.name}
        />
      )}
    </>
  );
};

export default ListUsersModal;
