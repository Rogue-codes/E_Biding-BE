import express from "express";
import {
  adminLogin,
  adminLogout,
  createAdmin,
  validateToken,
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
import verifyToken from "../../middleware/auth/verifyToken";

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
AdminRoute.get("/validate-token", verifyToken, validateToken);
AdminRoute.post("/admin/logout", adminLogout);

export default AdminRoute;
