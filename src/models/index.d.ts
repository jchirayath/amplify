import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";



type EagerUsers = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

type LazyUsers = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export declare type Users = LazyLoading extends LazyLoadingDisabled ? EagerUsers : LazyUsers

export declare const Users: (new (init: ModelInit<Users>) => Users)

type EagerProduct = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Product, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly leftWidth: number;
  readonly leftLength: number;
  readonly leftHeight: number;
  readonly leftLogo: string;
  readonly rightWidth: number;
  readonly rightLength: number;
  readonly rightHeight: number;
  readonly rightLogo: string;
  readonly fileKey?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyProduct = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Product, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly leftWidth: number;
  readonly leftLength: number;
  readonly leftHeight: number;
  readonly leftLogo: string;
  readonly rightWidth: number;
  readonly rightLength: number;
  readonly rightHeight: number;
  readonly rightLogo: string;
  readonly fileKey?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Product = LazyLoading extends LazyLoadingDisabled ? EagerProduct : LazyProduct

export declare const Product: (new (init: ModelInit<Product>) => Product) & {
  copyOf(source: Product, mutator: (draft: MutableModel<Product>) => MutableModel<Product> | void): Product;
}