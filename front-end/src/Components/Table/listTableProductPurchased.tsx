import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import React from "react";
import { toast } from "react-toastify";
import { fetchFileProduct } from "../../Services/products";

// Tipo que representa os dados básicos de um produto para exibição na tabela
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
}

// Propriedades esperadas pelo componente ProductTable
type ProductTableProps = {
  products: Product[];
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  onPurchase?: (id: number) => void;
  isAdm?: boolean;
};

// Componente que exibe uma tabela listando produtos com botão para download do arquivo PDF
const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  // Função para baixar o arquivo PDF do produto
  const handleDownloadFile = async (id: number, title: string) => {
    try {
      const resp = await fetchFileProduct(id);

      if (resp.status === 403) {
        toast.error("Você atingiu o limite de downloads para este produto.");
        return;
      }

      const blob = new Blob([resp.data as BlobPart], {
        type: "application/pdf",
      });
      toast.success("Download realizado com sucesso!");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Erro inesperado, tente novamente!");
    }
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" p={2}>
        Lista de Produtos
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Título</strong>
            </TableCell>
            <TableCell>
              <strong>Descrição</strong>
            </TableCell>
            <TableCell>
              <strong>Preço</strong>
            </TableCell>
            <TableCell>
              <strong>Ação</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.title}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>R$ {product.price.toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleDownloadFile(product.id, product.title)}
                >
                  Baixar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductTable;
