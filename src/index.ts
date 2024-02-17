import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import AdminRoute from "./routes/adminRoute/adminRoute";
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import clientRoute from "./routes/clientRoutes/clientRoute";
try {
  mongoose.connect(process.env.CONNECTION_URI as string);
  console.log("mongo db connection established");
} catch (error) {
  console.log(error);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'))
app.use(cookieParser())

app.use("/api/v1/e-biding", AdminRoute)
app.use("/api/v1/e-biding", clientRoute)

app.get("/api/v1/e-biding", (req: Request, res: Response) => {
  res.json({
    message: `welcome to e-biding app`,
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
