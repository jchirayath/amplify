/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const deleteUsers = /* GraphQL */ `
  mutation DeleteUsers($id: String!) {
    deleteUsers(id: $id) {
      id
      name
      email
    }
  }
`;
export const createUsers = /* GraphQL */ `
  mutation CreateUsers($createUsersInput: CreateUsersInput!) {
    createUsers(createUsersInput: $createUsersInput) {
      id
      name
      email
    }
  }
`;
export const updateUsers = /* GraphQL */ `
  mutation UpdateUsers($updateUsersInput: UpdateUsersInput!) {
    updateUsers(updateUsersInput: $updateUsersInput) {
      id
      name
      email
    }
  }
`;
export const deleteProducts = /* GraphQL */ `
  mutation DeleteProducts($id: String!) {
    deleteProducts(id: $id) {
      id
      email
      leftWidth
      leftLength
      leftHeight
      leftLogo
      rightWidth
      rightLength
      rightHeight
      rightLogo
      createdAt
      updatedAt
      fileKey
    }
  }
`;
export const createProducts = /* GraphQL */ `
  mutation CreateProducts($createProductsInput: CreateProductsInput!) {
    createProducts(createProductsInput: $createProductsInput) {
      id
      email
      leftWidth
      leftLength
      leftHeight
      leftLogo
      rightWidth
      rightLength
      rightHeight
      rightLogo
      createdAt
      updatedAt
      fileKey
    }
  }
`;
export const updateProducts = /* GraphQL */ `
  mutation UpdateProducts($updateProductsInput: UpdateProductsInput!) {
    updateProducts(updateProductsInput: $updateProductsInput) {
      id
      email
      leftWidth
      leftLength
      leftHeight
      leftLogo
      rightWidth
      rightLength
      rightHeight
      rightLogo
      createdAt
      updatedAt
      fileKey
    }
  }
`;
export const createProduct = /* GraphQL */ `
  mutation CreateProduct(
    $input: CreateProductInput!
    $condition: ModelProductConditionInput
  ) {
    createProduct(input: $input, condition: $condition) {
      id
      leftWidth
      leftLength
      leftHeight
      leftLogo
      rightWidth
      rightLength
      rightHeight
      rightLogo
      email
      fileKey
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateProduct = /* GraphQL */ `
  mutation UpdateProduct(
    $input: UpdateProductInput!
    $condition: ModelProductConditionInput
  ) {
    updateProduct(input: $input, condition: $condition) {
      id
      leftWidth
      leftLength
      leftHeight
      leftLogo
      rightWidth
      rightLength
      rightHeight
      rightLogo
      email
      fileKey
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteProduct = /* GraphQL */ `
  mutation DeleteProduct(
    $input: DeleteProductInput!
    $condition: ModelProductConditionInput
  ) {
    deleteProduct(input: $input, condition: $condition) {
      id
      leftWidth
      leftLength
      leftHeight
      leftLogo
      rightWidth
      rightLength
      rightHeight
      rightLogo
      email
      fileKey
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
