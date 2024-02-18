import express from "express";
import {
    clientLogin,
  createClient,
  forgotPassword,
  logout,
  resetPassword,
  verifyClientEmail,
} from "../../controllers/clientController/clientController";
import upload from "../../middleware/upload/upload";

const clientRoute = express.Router();

clientRoute.post("/client/create", upload.single("cacDoc"), createClient);
clientRoute.post("/client/verify-email", verifyClientEmail);
clientRoute.post("/client/login", clientLogin);
clientRoute.post("/client/forgot-password", forgotPassword);
clientRoute.put("/client/reset-password", resetPassword);
clientRoute.post("/client/logout", logout);

export default clientRoute;
