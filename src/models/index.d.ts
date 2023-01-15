import { ModelInit, MutableModel } from "@aws-amplify/datastore";
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

type EagerProducts = {
  readonly id: string;
  readonly email: string;
  readonly leftWidth: number;
  readonly leftLength: number;
  readonly leftHeight: number;
  readonly leftLogo: string;
  readonly rightWidth: number;
  readonly rightLength: number;
  readonly rightHeight: number;
  readonly rightLogo: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly fileKey?: string | null;
  readonly ownerId: string;
}

type LazyProducts = {
  readonly id: string;
  readonly email: string;
  readonly leftWidth: number;
  readonly leftLength: number;
  readonly leftHeight: number;
  readonly leftLogo: string;
  readonly rightWidth: number;
  readonly rightLength: number;
  readonly rightHeight: number;
  readonly rightLogo: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly fileKey?: string | null;
  readonly ownerId: string;
}

export declare type Products = LazyLoading extends LazyLoadingDisabled ? EagerProducts : LazyProducts

export declare const Products: (new (init: ModelInit<Products>) => Products)

