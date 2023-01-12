// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Product, Users, Products } = initSchema(schema);

export {
  Product,
  Users,
  Products
};