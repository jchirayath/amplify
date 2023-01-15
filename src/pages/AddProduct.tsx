import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { v4 as uuidv4 } from "uuid";
import { API, Storage } from "aws-amplify";
import { createProducts } from "../graphql/mutations";
import useAuth from "../hooks/useAuth";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import * as Yup from "yup";
import { Formik } from "formik";
import { useEffect } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";
import { FileUpload, FileUploadProps } from "../components/FileUpload";

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = React.useState<File | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  const fileUploadProp: FileUploadProps = {
    accept: "image/*",
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files !== null && event.target?.files?.length > 0) {
        console.log(`Saving ${event.target.value}`);
        setFile(event.target.files[0]);
      }
    },
    onDrop: (event: React.DragEvent<HTMLElement>) => {
      if (
        event.dataTransfer.files !== null &&
        event.dataTransfer.files.length > 0
      ) {
        console.log(`Drop ${event.dataTransfer.files[0].name}`);
        setFile(event.dataTransfer.files[0]);
      }
    },
  };

  const validationSchema = Yup.object({
    leftWidth: Yup.number()
      .min(7.5, "Width should be positive.")
      .required("Left Width is required"),
    leftLength: Yup.number()
      .min(7.5, "Length should be positive.")
      .required("Left Length is required"),
    leftHeight: Yup.number()
      .min(7.5, "Height should be positive.")
      .required("Left Height is required"),
    leftLogo: Yup.string().required("Logo is required"),
    rightWidth: Yup.number()
      .min(7.5, "Width should be positive.")
      .required("Right Width is required"),
    rightLength: Yup.number()
      .min(7.5, "Length should be positive.")
      .required("Right Length is required"),
    rightHeight: Yup.number()
      .min(7.5, "Height should be positive.")
      .required("Right Height is required"),
    rightLogo: Yup.string().required("Logo is required"),
  });
  const getName = (user: any): string => {
    if (user?.attributes?.name === null) {
      return "";
    }
    return user?.attributes?.name;
  };

  const getEmail = (user: any): string => {
    if (user?.attributes?.email === null) {
      return "";
    }
    return user?.attributes?.email;
  };

  const getUsername = (user: any): string => {
    if (user?.username === null) {
      return "";
    }
    return user?.username;
  }

  useEffect(() => {
    if (user) {
      const name = getName(user);
      setFirstName(name.split(" ")[0]);
      setLastName(name.split(" ")[1]);
    }
  }, [user]);

  return (
    <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
      <Formik
        initialValues={{
          leftWidth: 0,
          leftLength: 0,
          leftHeight: 0,
          leftLogo: "",
          rightWidth: 0,
          rightLength: 0,
          rightHeight: 0,
          rightLogo: "",
          submit: null,
        }}
        validationSchema={validationSchema}
        onSubmit={async (
          values: any,
          { setErrors, setStatus, setSubmitting }: any
        ): Promise<void> => {
          try {
            setSubmitting(true);
            const userEmail = getEmail(user);
            const ownerId = getUsername(user);
            console.log('User Email: ', userEmail);
            console.log('Owner Id: ', ownerId);
            const productId = uuidv4();
            let productFileName = "";

            console.log(`File: ${file?.name}`);
            // if it has product file save it to s3
            if (file) {
              productFileName = `${productId}-${file.name}`;
              const fileUploadResponse = await Storage.put(
                productFileName,
                file,
                {
                  contentType: file?.type,
                }
              );
              console.log(`File upload response: ${fileUploadResponse}`);
            }

            // save new product
            const response = await API.graphql({
              query: createProducts,
              variables: {
                createProductsInput: {
                  id: productId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  leftWidth: values.leftWidth,
                  leftLength: values.leftLength,
                  leftHeight: values.leftHeight,
                  leftLogo: values.leftLogo,
                  rightWidth: values.rightWidth,
                  rightLength: values.rightLength,
                  rightHeight: values.rightHeight,
                  rightLogo: values.rightLogo,
                  ownerId: ownerId,
                  fileKey: productFileName,
                  email: userEmail,
                },
              },
            });
            console.log("Added Product: ", response);
            setStatus({ success: true });
            setSubmitting(false);
            navigate("/");
          } catch (err: any) {
            console.log("Error adding product: ", err);
            setStatus({ success: false });
            setErrors({ submit: err?.errors[0]?.message });
            setSubmitting(false);
          }
        }}
      >
        {({
          errors,
          handleChange,
          handleSubmit,
          status,
          isSubmitting,
          touched,
          values,
        }): JSX.Element => (
          <Paper
            component="form"
            onSubmit={handleSubmit}
            variant="outlined"
            sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
          >
            <Typography component="h1" variant="h4" align="center">
              Add New Product
            </Typography>
            <Typography variant="h6" gutterBottom>
              Product Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="firstName"
                  disabled
                  name="firstName"
                  value={firstName}
                  label="First name"
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="lastName"
                  disabled
                  name="lastName"
                  value={lastName}
                  label="Last name"
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  <b>Left</b>
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  required
                  value={values?.leftWidth}
                  onChange={handleChange}
                  error={Boolean(touched.leftWidth && errors.leftWidth)}
                  helperText={touched.leftWidth && errors.leftWidth}
                  type="number"
                  id="leftWidth"
                  name="leftWidth"
                  label="Left Width"
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  required
                  value={values?.leftLength}
                  onChange={handleChange}
                  error={Boolean(touched.leftLength && errors.leftLength)}
                  helperText={touched.leftLength && errors.leftLength}
                  type="number"
                  id="leftLength"
                  name="leftLength"
                  label="Left Length"
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  required
                  value={values?.leftHeight}
                  onChange={handleChange}
                  error={Boolean(touched.leftHeight && errors.leftHeight)}
                  helperText={touched.leftHeight && errors.leftHeight}
                  type="number"
                  id="leftHeight"
                  name="leftHeight"
                  label="Left Height"
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel id="left-logo-select-label">Left Logo</InputLabel>
                  <Select
                    labelId="left-logo-select-label"
                    variant="outlined"
                    name="leftLogo"
                    id="leftLogo"
                    label="Left Logo"
                    value={values?.leftLogo ? values?.leftLogo : ""}
                    onChange={handleChange}
                    error={Boolean(touched.leftLogo && errors.leftLogo)}
                  >
                    <MenuItem key="" value=""></MenuItem>
                    <MenuItem key="yes" value={"yes"}>
                      Yes
                    </MenuItem>
                    <MenuItem key="yes" value={"No"}>
                      No
                    </MenuItem>
                  </Select>
                  {touched.leftLogo && errors.leftLogo && (
                    <FormHelperText
                      sx={{
                        color: "red",
                      }}
                    >
                      {errors.leftLogo}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  <b>Right</b>
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  required
                  value={values?.rightWidth}
                  onChange={handleChange}
                  error={Boolean(touched.rightWidth && errors.rightWidth)}
                  helperText={touched.rightWidth && errors.rightWidth}
                  type="number"
                  id="rightWidth"
                  name="rightWidth"
                  label="Right Width"
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  required
                  value={values?.rightLength}
                  onChange={handleChange}
                  error={Boolean(touched.rightLength && errors.rightLength)}
                  helperText={touched.rightLength && errors.rightLength}
                  type="number"
                  id="rightLength"
                  name="rightLength"
                  label="Right Length"
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  required
                  value={values?.rightHeight}
                  onChange={handleChange}
                  error={Boolean(touched.rightHeight && errors.rightHeight)}
                  helperText={touched.rightHeight && errors.rightHeight}
                  type="number"
                  id="rightHeight"
                  name="rightHeight"
                  label="Right Height"
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel id="right-logo-select-label">
                    Right Logo
                  </InputLabel>
                  <Select
                    labelId="right-logo-select-label"
                    variant="outlined"
                    name="rightLogo"
                    id="rightLogo"
                    label="Right Logo"
                    value={values?.rightLogo ? values?.rightLogo : ""}
                    onChange={handleChange}
                    error={Boolean(touched.rightLogo && errors.rightLogo)}
                  >
                    <MenuItem key="" value=""></MenuItem>
                    <MenuItem key="yes" value={"yes"}>
                      Yes
                    </MenuItem>
                    <MenuItem key="yes" value={"No"}>
                      No
                    </MenuItem>
                  </Select>
                  {touched.rightLogo && errors.rightLogo && (
                    <FormHelperText
                      sx={{
                        color: "red",
                      }}
                    >
                      {errors.rightLogo}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <FileUpload {...fileUploadProp} />
                </Grid>
              </Grid>
              {/*Display Error with Icon*/}
              {errors?.submit && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ErrorOutlineIcon sx={{ color: "red", mr: 1 }} />
                    <Typography variant="body2" color="error">
                      {errors?.submit}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {/*Display Error with Icon*/}
              {status?.success && (
                <Grid
                  item
                  xs={12}
                  sx={{
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <CheckCircleOutlineIcon sx={{ color: "green", mr: 1 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "green",
                      }}
                    >
                      New product added successfully.
                    </Typography>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="contained"
                    color="primary"
                    sx={{ m: 3 }}
                  >
                    Add Product
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Formik>
    </Container>
  );
};

export default AddProduct;
