import express from 'express'
import { getAllAuctions } from '../../controllers/adminController/auctionManagement'

const publicRoute = express.Router()

publicRoute.get("/auctions/all", getAllAuctions)

export default publicRoute