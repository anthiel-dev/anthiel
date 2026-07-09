import { app } from "./app";
import { env } from "./env";

app.listen(env.PORT);

console.log(`🦊 Backend running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`🔐 Auth endpoints at http://${app.server?.hostname}:${app.server?.port}/api/auth`);
