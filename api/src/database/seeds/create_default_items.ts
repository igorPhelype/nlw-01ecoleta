import Knex from 'knex'

export async function seed(knex: Knex){
    const items_length = (await knex('items').select()).length
    if(items_length === 0){
        await knex('items').insert([
            {title: 'Lâmpadas', image: 'lampadas.svg'},
            {title: 'Pilhas e Baterias', image: 'baterias.svg'},
            {title: 'Papéis e Papelão', image: 'papeis-papelao.svg'},
            {title: 'Resíduos Eletrônicos', image: 'eletronicos.svg'},
            {title: 'Resíduos Orgânicos', image: 'organicos.svg'},
            {title: 'Óleo de Cozinha', image: 'oleo.svg'}
        ])
    }else{
        console.log('Seed cancelada')
    }
}