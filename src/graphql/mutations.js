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
      ownerId
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
      ownerId
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
      ownerId
    }
  }
`;
