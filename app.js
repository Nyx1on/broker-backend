import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env || 8000;



const startServer = async () => {
  try {
  } catch (error) {}
  app.listen(port, () => {
    console.log(`Server started on port: https://localhost:${port}/`);
  });
};

startServer();
