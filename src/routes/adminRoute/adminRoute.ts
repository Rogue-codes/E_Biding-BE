import express from "express";
import {
  adminLogin,
  createAdmin,
} from "../../controllers/adminController/adminAuthController";
import {
  approveClient,
  downloadPDF,
  getAllClients,
  getClientById,
  rejectClient,
} from "../../controllers/adminController/adminOperationsController";
import { adminMiddleware } from "../../middleware/admin/adminMiddleware";
import { createAuction, updateAuction } from "../../controllers/adminController/auctionManagement";
import { uploadImg } from "../../middleware/upload/uploadImg";

const AdminRoute = express.Router();

AdminRoute.post("/admin/create", createAdmin);
AdminRoute.post("/admin/login", adminLogin);
AdminRoute.get("/admin/clients/all", adminMiddleware, getAllClients);
AdminRoute.get("/admin/client/:id", adminMiddleware, getClientById);
AdminRoute.patch("/admin/client/:id/approve", adminMiddleware, approveClient);
AdminRoute.delete("/admin/client/:id/reject", adminMiddleware, rejectClient);
AdminRoute.get("/admin/client/:id/download-cac", adminMiddleware, downloadPDF);
AdminRoute.post("/admin/auction/create", adminMiddleware, uploadImg.single("auctionImg"), createAuction);
AdminRoute.put("/admin/auction/update/:id", adminMiddleware, uploadImg.single("auctionImg"), updateAuction);

export default AdminRoute;
