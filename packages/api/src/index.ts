import 'dotenv/config';
import 'reflect-metadata';
import { createServer } from 'http';
import { connectDataBase } from 'src/bootstrap/connectDataBase';
import { createExpressApp } from 'src/bootstrap/createExpressApp';

(async () => {
  await connectDataBase();
  const expressApp = createExpressApp();
  const nodeServer = createServer(expressApp);

  const { PORT } = process.env;
  nodeServer.listen(PORT, () => {
    console.log(`App is working on ${PORT}`);
  });
})();
