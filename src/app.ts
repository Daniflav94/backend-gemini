import express from "express";
import path from "path";
import { router } from "./routes/router";

require("dotenv").config();

const cors = require('cors');

const port = process.env.PORT || 4000;

const app = express();


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: false}));

app.use(cors({origin: ["http://localhost:5173"]}));
app.use(express.static(__dirname));

app.use(router);

app.listen(port, () => {
  console.log(`App rodando na porta ${port}`);
});