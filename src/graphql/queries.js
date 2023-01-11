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
export const getProduct = /* GraphQL */ `
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      leftWidth
      leftLength
      leftHeight
      leftLogo
      rightWidth
      rightLength
      rightHeight
      rightLogo
      fileKey
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listProducts = /* GraphQL */ `
  query ListProducts(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        leftWidth
        leftLength
        leftHeight
        leftLogo
        rightWidth
        rightLength
        rightHeight
        rightLogo
        fileKey
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncProducts = /* GraphQL */ `
  query SyncProducts(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncProducts(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        leftWidth
        leftLength
        leftHeight
        leftLogo
        rightWidth
        rightLength
        rightHeight
        rightLogo
        fileKey
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
