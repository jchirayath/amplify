import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "./Title";
import { Product } from "../pages/Dashboard";
import { TableContainer, TableFooter, TablePagination } from "@mui/material";
import { Storage } from "aws-amplify";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import IconButton from "@mui/material/IconButton";

interface ProductsTableProps {
  products: Product[];
}
const ProductsTable = ({ products }: ProductsTableProps) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - products.length) : 0;

  const fetchFileFromS3 = async (key: string) => {
    try {
      const fileUrl = await Storage.get(key, { level: "public" });
      window.open(fileUrl);
      console.log("File URL: ", fileUrl);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <TableContainer
      sx={{
        minWidth: 650,
        width: "100%",
      }}
    >
      <Title>Recent Products</Title>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell align="center" colSpan={4}>
              Left
            </TableCell>
            <TableCell align="center" colSpan={4}>
              Right
            </TableCell>
            <TableCell>File</TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell id="left-width" align="center">
              Width
            </TableCell>
            <TableCell
              style={{
                minWidth: "100px",
              }}
              align="center"
            >
              Length
            </TableCell>
            <TableCell
              style={{
                minWidth: "100px",
              }}
              align="center"
            >
              Height
            </TableCell>
            <TableCell
              style={{
                minWidth: "100px",
              }}
              align="center"
            >
              Logo
            </TableCell>
            <TableCell
              style={{
                minWidth: "100px",
              }}
              align="center"
            >
              Width
            </TableCell>
            <TableCell
              style={{
                minWidth: "100px",
              }}
              align="center"
            >
              Length
            </TableCell>
            <TableCell
              style={{
                minWidth: "100px",
              }}
              align="center"
            >
              Height
            </TableCell>
            <TableCell
              style={{
                minWidth: "100px",
              }}
              align="center"
            >
              Logo
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((product) => (
              <TableRow key={product.id}>
                <TableCell align="left">{product.date}</TableCell>
                <TableCell align="center">{product.leftWidth}</TableCell>
                <TableCell align="center">{product.leftLength}</TableCell>
                <TableCell align="center">{product.leftHeight}</TableCell>
                <TableCell align="center">{product.leftLogo}</TableCell>
                <TableCell align="center">{product.rightWidth}</TableCell>
                <TableCell align="center">{product.rightLength}</TableCell>
                <TableCell align="center">{product.rightHeight}</TableCell>
                <TableCell align="center">{product.rightLogo}</TableCell>
                <TableCell align="center">
                  {product.fileKey !== "" && (
                    <IconButton
                      type="button"
                      onClick={() => fetchFileFromS3(product.fileKey)}
                      aria-label="delete"
                    >
                      <FileDownloadIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={10}>
              <TablePagination
                rowsPerPageOptions={[5, 25, 100]}
                component="div"
                count={products.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;
