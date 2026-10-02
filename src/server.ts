import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, env.HOST, () => {
  console.log(`Plant Care API is running at http://${env.HOST}:${env.PORT}`);
});
