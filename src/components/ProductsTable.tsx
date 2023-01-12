import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "./Title";
import { Product } from "../pages/Dashboard";
interface ProductsTableProps {
    products: Product[];
}
const ProductsTable = ({products}: ProductsTableProps) => {
  return (
    <React.Fragment>
      <Title>Recent Products</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Left Width</TableCell>
            <TableCell>Left Length</TableCell>
            <TableCell>Left Height</TableCell>
            <TableCell>Left Logo</TableCell>
            <TableCell>Right Width</TableCell>
            <TableCell>Right Length</TableCell>
            <TableCell>Right Height</TableCell>
            <TableCell>Right Logo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.date}</TableCell>
              <TableCell>{product.leftWidth}</TableCell>
              <TableCell>{product.leftLength}</TableCell>
              <TableCell>{product.leftHeight}</TableCell>
              <TableCell>{product.leftLogo}</TableCell>
              <TableCell>{product.rightWidth}</TableCell>
              <TableCell>{product.rightLength}</TableCell>
              <TableCell>{product.rightHeight}</TableCell>
              <TableCell>{product.rightLogo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
};

export default ProductsTable;
