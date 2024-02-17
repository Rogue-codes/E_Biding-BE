import express from 'express';
import { adminLogin, createAdmin } from '../../controllers/adminController/adminController';

const AdminRoute = express.Router()

AdminRoute.post('/admin/create', createAdmin)
AdminRoute.post('/admin/login', adminLogin)

export default AdminRoute;