// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Users, Products } = initSchema(schema);

export {
  Users,
  Products
};