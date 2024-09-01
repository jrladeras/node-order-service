const MONGOOSE  = require('../helpers/mongo');
const MODEL     = require('./MODEL');
const Schema    = MONGOOSE.Schema;

const schema    = new Schema(
{
    uuid: { type: String,  required: true, index: true },
    order_status: { type: String,  required: true },
    customer: { type: Object,  required: true },
    fulfillment_type: { type: String,  required: true },
    payment_status: { type: String,  required: true },
    mode_of_payment: { type: String,  required: false },
    payment_network: { type: String,  required: false },
    items: { type: Array,  required: true },
});


class MDB_ORDERS extends MODEL
{
    constructor()
    {
        super('orders', schema);
    }
}

module.exports = MDB_ORDERS;