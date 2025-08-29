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
import EditIcon from "@mui/icons-material/Edit";
import EditUserModal from "./editUserModal";

// Interface que define os dados de um usuário
type User = {
  id?: number;
  name: string;
  email: string;
  password?: string;
};

// Interface com as props esperadas pelo modal de perfil do usuário
type UserProfileModalProps = {
  open: boolean;
  onClose: () => void;
  user: User;
  onUserUpdate: (updatedUser: User) => void;
};

// Estilo do modal
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

// Componente que exibe os dados do usuário em um modal e permite edição de nome e email
const UserProfileModal: React.FC<UserProfileModalProps> = ({
  open,
  onClose,
  user,
  onUserUpdate,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  // Abre o modal de edição de usuário
  const handleEditUser = () => {
    setIsEditOpen(true);
  };

  // Trata a submissão dos dados editados
  const handleSubmitEdit = (updatedData: { name: string; email: string }) => {
    const updatedUser = {
      ...user,
      name: updatedData.name,
      email: updatedData.email,
    };
    setLocalUser(updatedUser);
    onUserUpdate(updatedUser);
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
            <Typography variant="h6">Meu Perfil</Typography>
            <IconButton onClick={onClose} aria-label="Fechar">
              <CloseIcon />
            </IconButton>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Nome</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Senha</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Editar</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{localUser.name}</TableCell>
                  <TableCell>{localUser.email}</TableCell>
                  <TableCell>
                    Para sua segurança, para editar senha contate o suporte
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={handleEditUser}
                      aria-label={`Editar usuário ${localUser.name}`}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>
      <EditUserModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userData={user}
        onSubmit={handleSubmitEdit}
      />
    </>
  );
};

export default UserProfileModal;
