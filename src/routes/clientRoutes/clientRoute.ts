import express from 'express'
import { createClient } from '../../controllers/clientController/clientController'
import upload from '../../middleware/upload/upload'

const clientRoute = express.Router()

clientRoute.post('/client/create', upload.single("cacDoc"), createClient)

export default clientRoute