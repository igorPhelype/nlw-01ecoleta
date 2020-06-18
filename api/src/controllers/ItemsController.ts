import {Request, Response} from 'express'
import knex from '../database/connection'

export default class ItemsController {
    // index, show, create, update, delete
    async index (request: Request, response: Response) {
        const items = await knex('items').select()
        const serializedItems = items.map(item => {
            return {
                ...item,
                image_url: 'http://192.168.100.10:3333/uploads/'+item.image
            }
        })
        return response.json({items: serializedItems})
    }
}