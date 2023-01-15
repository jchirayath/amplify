/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUsers = /* GraphQL */ `
  query GetUsers($id: String!) {
    getUsers(id: $id) {
      id
      name
      email
    }
  }
`;
export const listUserss = /* GraphQL */ `
  query ListUserss {
    listUserss {
      id
      name
      email
    }
  }
`;
export const getProducts = /* GraphQL */ `
  query GetProducts($id: String!) {
    getProducts(id: $id) {
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
export const listProductss = /* GraphQL */ `
  query ListProductss {
    listProductss {
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
export const listProductsByUser = /* GraphQL */ `
  query ListProductsByUser($ownerId: String!) {
    listProductsByUser(ownerId: $ownerId) {
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
