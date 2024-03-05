import express from 'express'
import { getAllAuctions, getAuctionById } from '../../controllers/adminController/auctionManagement'

const publicRoute = express.Router()

publicRoute.get("/auctions/all", getAllAuctions)
publicRoute.get("/auction/:id", getAuctionById)

export default publicRoute