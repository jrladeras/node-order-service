
const MDB_ORDERS = require('../models/ORDERS');
const { v4: uuidv4} = require('uuid');

module.exports = {
    getOrders: async (params) => {    
        return await new MDB_ORDERS().docs(params)
    },

    getOrderByUuid: async (uuid) => {    
        return await new MDB_ORDERS().docs({uuid})
    },

    createOrder: async (body) => {    
        return await new MDB_ORDERS().add(
            {
                uuid: uuidv4(), 
                order_status: 'Pending',
                ...body
            })
    },

    updateOrder: async (uuid, body) => {    
        console.log(uuid, body);
        return await new MDB_ORDERS().update(uuid, body)
    }
}