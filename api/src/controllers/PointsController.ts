import {Request, Response} from 'express'
import knex from '../database/connection'

export default class PointsController {
    async index (request: Request, response: Response){
        // serialização
        // API Transform
        const {city, uf, items} = request.query
        const parsedItems: Array<Number> = String(items).split(',').map(item => Number(item.trim()))
        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')
        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.100.10:3333/uploads/${point.image}`
            }
        })
        return response.json({points: serializedPoints})
    }

    async create (request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
        } = request.body
        const trx = await knex.transaction()
        const items: string = request.body.items
        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
        }
        const [point_id] = await trx('points').insert(point)
        const pointsItems = items.split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id
                }
        })
        await trx('point_items').insert(pointsItems)
        await trx.commit()
        return response.json({
            ...point,
            id: point_id,
        })
    }

    async show (request: Request, response: Response) {
        const {id} = request.params
        const point = await knex('points')
            .select('*')
            .where('id', id).first()
        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
        if(!point){
            return response.status(400).json({message: "Point not found."})
        }
        const serializedPoint = {
            ...point,
            image_url: `http://192.168.100.10:3333/uploads/${point.image}`
        }
        return response.json({point: serializedPoint, items})
    }
}