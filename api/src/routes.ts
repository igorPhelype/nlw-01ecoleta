import express, { request, response } from 'express'
import knex from './database/connection'
import ItemsController from './controllers/ItemsController'
import PointsController from './controllers/PointsController'
import multer from 'multer'
import multerConfig from './config/multer'
import { celebrate, Joi } from "celebrate";

const routes = express.Router()
const upload = multer(multerConfig)

const itemsController = new ItemsController()
const pointsController = new PointsController()

// items
routes.get('/items', itemsController.index)

// points
routes.get('/points', pointsController.index)
routes.post(
    '/point',
    upload.single('image'),
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.string().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required(),
            items: Joi.string().required(),
        })
    }, {
        abortEarly: false
    }),
    pointsController.create
)
routes.get('/point/:id', pointsController.show)

export default routes

// Pesquisar:
// Service Pattern
// Repository Pattern (Data Mapper)