import * as TypeORM from 'typeorm';
import { Container } from 'typedi';

export const connectDataBase = async (): Promise<TypeORM.Connection> => {
  TypeORM.useContainer(Container);
  const connectionOptions = await TypeORM.getConnectionOptions();
  return TypeORM.createConnection(connectionOptions);
};
