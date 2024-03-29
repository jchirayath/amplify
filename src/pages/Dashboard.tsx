import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import ProductsTable from "../components/ProductsTable";
import Copyright from "../components/CopyRight";
import * as React from "react";
import { API } from "aws-amplify";
import {listProductsByUser} from "../graphql/queries";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";
import useAuth from "../hooks/useAuth";

export interface Product {
  id: string;
  date: string;
  leftWidth: number;
  leftLength: number;
  leftHeight: number;
  rightWidth: number;
  rightLength: number;
  rightHeight: number;
  leftLogo: string;
  rightLogo: string;
  fileKey: string;
}
const Dashboard = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const { user } = useAuth();

  const mapProducts = async (fetchedProducts: any) => {
    const mappedProducts: Product[] = [];
    await (async () => {
      for (const fProduct of fetchedProducts) {
        mappedProducts.push({
          id: fProduct.id,
          date: new Date(fProduct.createdAt).toLocaleDateString(),
          leftWidth: fProduct.leftWidth,
          leftLength: fProduct.leftLength,
          leftHeight: fProduct.leftHeight,
          rightWidth: fProduct.rightWidth,
          rightLength: fProduct.rightLength,
          rightHeight: fProduct.rightHeight,
          leftLogo: fProduct.leftLogo,
          rightLogo: fProduct.rightLogo,
          fileKey: fProduct.fileKey? fProduct.fileKey : "",
        });
      }
    })();
    return mappedProducts;
  };

  const loadProducts = async () => {
    try {
      const username = getUsername(user);
      const allProducts: any = await API.graphql({ query: listProductsByUser, variables: {
          ownerId: username
        } });
      console.log("Products: ", allProducts);
      // map response list to products array

      // set products
      const mappedProducts = await mapProducts(allProducts?.data?.listProductsByUser);
      setProducts(mappedProducts);
    } catch (err) {
      console.log("Error fetching products: ", err);
    }

  };

  const getUsername = (user: any): string => {
    if (user?.username === null) {
      return "";
    }
    return user?.username;
  }

  React.useEffect(() => {
    loadProducts();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Chart */}
        {/*<Grid item xs={12} md={8} lg={9}>*/}
        {/*  <Paper*/}
        {/*    sx={{*/}
        {/*      p: 2,*/}
        {/*      display: "flex",*/}
        {/*      flexDirection: "column",*/}
        {/*      height: 240,*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <Chart />*/}
        {/*  </Paper>*/}
        {/*</Grid>*/}
        {/* Recent Deposits */}
        {/*<Grid item xs={12} md={4} lg={3}>*/}
        {/*  <Paper*/}
        {/*    sx={{*/}
        {/*      p: 2,*/}
        {/*      display: "flex",*/}
        {/*      flexDirection: "column",*/}
        {/*      height: 240,*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <Deposits />*/}
        {/*  </Paper>*/}
        {/*</Grid>*/}
        {/* Recent Products */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Grid
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
              item
              xs={12}
            >
              <IconButton size="medium" type="button" onClick={loadProducts}>
                <RefreshIcon color="primary" />
              </IconButton>
            </Grid>
            <ProductsTable products={products} />
          </Paper>
        </Grid>
      </Grid>
      <Copyright sx={{ pt: 4 }} />
    </Container>
  );
};

export default Dashboard;
