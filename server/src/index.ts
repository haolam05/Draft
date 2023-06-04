import express from "express";
import { Create, Draft, Join, Dummy } from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port = 8088;
const app = express();
app.use(bodyParser.json());
app.get("/api/dummy", Dummy);
app.get("/api/join", Join);
app.post("/api/draft", Draft);
app.post("/api/create", Create);
app.listen(port, () => console.log(`Server listening on ${port}`));
