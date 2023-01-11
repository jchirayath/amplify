// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Product, Users } = initSchema(schema);

export {
  Product,
  Users
};