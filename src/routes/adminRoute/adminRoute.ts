import express from "express";
import {
  adminLogin,
  createAdmin,
} from "../../controllers/adminController/adminAuthController";
import {
  approveClient,
  getAllClients,
  getClientById,
} from "../../controllers/adminController/adminOperationsController";
import { adminMiddleware } from "../../middleware/admin/adminMiddleware";

const AdminRoute = express.Router();

AdminRoute.post("/admin/create", createAdmin);
AdminRoute.post("/admin/login", adminLogin);
AdminRoute.get("/admin/clients/all", adminMiddleware, getAllClients);
AdminRoute.get("/admin/client/:id", adminMiddleware, getClientById);
AdminRoute.patch("/admin/client/:id/approve", adminMiddleware, approveClient);

export default AdminRoute;
