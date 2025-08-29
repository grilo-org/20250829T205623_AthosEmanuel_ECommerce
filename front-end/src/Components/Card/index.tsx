import "./style.css";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  ConfirmPurchaseModal,
  DeleteProductModal,
  EditProductModal,
} from "../index";

import { toast } from "react-toastify";
import { fetchFileProduct } from "../../Services/products";

// Define as propriedades esperadas pelo componente ProductCard.
type ProductCardProps = {
  title: string;
  description: string;
  price: number;
  purchased: boolean;
  productId: number;
  onPurchase: (productId: number) => void;
  onEdit: (productId: number, product: Product) => void;
  onDelete: (productId: number) => void;
  isAdm: boolean;
  id: number;
};

// Tipo auxiliar que representa os dados básicos de um produto.
type Product = {
  title: string;
  description: string;
  price: number;
};

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  price,
  purchased,
  productId,
  onPurchase,
  onEdit,
  onDelete,
  isAdm,
  id,
}) => {
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  /**
   * Chama a função onPurchase passada pelo pai para confirmar a compra,
   * e fecha o modal de compra.
   */
  const handleConfirmPurchase = () => {
    onPurchase(productId);
    setPurchaseModalOpen(false);
  };

  /**
   * Chama a função onEdit com os dados atualizados do produto,
   * e fecha o modal de edição.
   */
  const handleConfirmEdit = (updatedProduct: Product) => {
    onEdit(productId, updatedProduct);
    setEditModalOpen(false);
  };

  /**
   * Chama a função onDelete para confirmar a exclusão do produto,
   * e fecha o modal de exclusão.
   */
  const handleConfirmDelete = () => {
    onDelete(productId);
    setDeleteModalOpen(false);
  };

  /**
   * Baixa o arquivo PDF do produto via API.
   * Exibe toast de erro se o usuário atingir o limite de downloads.
   */
  const handleDownloadFile = async (id: number) => {
    try {
      const resp = await fetchFileProduct(id);
      const blob = new Blob([resp.data as BlobPart], {
        type: "application/pdf",
      });

      if (resp.status === 403) {
        toast.error("Você atingiu o limite de downloads para este produto");
      } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Download realizado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro inesperado, tente novamente!");
    }
  };

  return (
    <div className="cardContainer">
      <Card
        sx={{
          width: 370,
          height: 200,
          borderRadius: 4,
          boxShadow: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "box-shadow 0.3s",
          "&:hover": {
            boxShadow: 6,
          },
        }}
      >
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>

        <CardActions
          sx={{
            mt: "auto",
            px: 2,
            pb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle1"
            color="success.main"
            fontWeight="bold"
          >
            R$ {price.toFixed(2)}
          </Typography>

          {isAdm ? (
            <div className="containerActionsButtons">
              <Button
                onClick={() => setDeleteModalOpen(true)}
                variant="contained"
                color="error"
                size="small"
              >
                Deletar
              </Button>
              <Button
                onClick={() => setEditModalOpen(true)}
                variant="contained"
                color="primary"
                size="small"
              >
                Editar
              </Button>
              <Button
                onClick={() => handleDownloadFile(id)}
                variant="contained"
                color="success"
                size="small"
              >
                Baixar
              </Button>
            </div>
          ) : purchased ? (
            <Button
              onClick={() => handleDownloadFile(id)}
              variant="contained"
              color="success"
              size="small"
            >
              Baixar
            </Button>
          ) : (
            <Button
              onClick={() => setPurchaseModalOpen(true)}
              variant="contained"
              color="primary"
              size="small"
            >
              Comprar
            </Button>
          )}
        </CardActions>
      </Card>

      <ConfirmPurchaseModal
        open={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        onConfirm={handleConfirmPurchase}
        productTitle={title}
        productPrice={price}
      />

      <EditProductModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleConfirmEdit}
        productData={{ title, description, price }}
      />

      <DeleteProductModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productTitle={title}
      />
    </div>
  );
};

export default ProductCard;
