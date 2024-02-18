import express from 'express';
import { adminLogin, createAdmin } from '../../controllers/adminController/adminAuthController';
import { getAllClients } from '../../controllers/adminController/adminOperationsController';
import { adminMiddleware } from '../../middleware/admin/adminMiddleware';

const AdminRoute = express.Router()

AdminRoute.post('/admin/create', createAdmin)
AdminRoute.post('/admin/login', adminLogin)
AdminRoute.get('/admin/clients/all', adminMiddleware, getAllClients)

export default AdminRoute;