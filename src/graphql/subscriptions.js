/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUsers = /* GraphQL */ `
  subscription OnCreateUsers {
    onCreateUsers {
      id
      name
      email
    }
  }
`;
export const onCreateProducts = /* GraphQL */ `
  subscription OnCreateProducts {
    onCreateProducts {
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
export const onCreateProduct = /* GraphQL */ `
  subscription OnCreateProduct($filter: ModelSubscriptionProductFilterInput) {
    onCreateProduct(filter: $filter) {
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
export const onUpdateProduct = /* GraphQL */ `
  subscription OnUpdateProduct($filter: ModelSubscriptionProductFilterInput) {
    onUpdateProduct(filter: $filter) {
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
export const onDeleteProduct = /* GraphQL */ `
  subscription OnDeleteProduct($filter: ModelSubscriptionProductFilterInput) {
    onDeleteProduct(filter: $filter) {
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
