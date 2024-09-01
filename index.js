
const ORDERS_ENTITIES = require('./entities/orders')
const { applicationAuthentication } = require("./helpers/middlewares")
const API_HELPER = require('./helpers/api')
const APP = API_HELPER.app()
const ORDERS_VALIDATOR = require('./validators/orders')

APP.use(async function(req, res, next) {
    await applicationAuthentication(req, res, 'customer', next)
})

APP.post('/orders', async function (request, response) {
    try {
        console.log(`********** START : POST /orders: ORDERS CREATE API **********`);

        const validation = ORDERS_VALIDATOR.create(request)

        if (!validation.isValid) {
            return API_HELPER.message(response, [], validation.errors)
        }

        const orders = await ORDERS_ENTITIES.createOrder(request.body)

        return API_HELPER.message(response, orders, [], "Order successfully created")
    } catch (error) {
        console.log(`Unable to get products ERR::`, error.message); 
        return API_HELPER.message(response, [], error)
    } finally
    {
        console.log('********** END : POST /orders: ORDERS CREATE API **********');
    }
})

APP.get('/orders', async function (request, response) {
    try {
        console.log(`********** START : GET /orders: GET ORDERS API **********`);

        const orders = await ORDERS_ENTITIES.getOrders()
        return API_HELPER.message(response, orders, [], "Success")
    } catch (error) {
        console.log(`Unable to get products ERR::`, error.message);
        response.json({successful: false, message: error.message});y
        return API_HELPER.message(response, [], error)
    } finally
    {
        console.log('********** END : GET /orders: GET ORDERS API **********');
    }
})

APP.get('/orders/:uuid', async function (request, response) {
    try {
        console.log(`********** START : GET /orders/:uuid: GET ORDER BY UUID API **********`);

        const order = await ORDERS_ENTITIES.getOrderByUuid(request.params.uuid)

        return response.json({ success: true, message: "Success", data: order })
    } catch (error) {
        console.log(`Unable to get products ERR::`, err.message);
        return API_HELPER.message(response, [], error)
    } finally
    {
        console.log('********** END : GET /orders/:id: GET ORDER BY ID API **********');
    }
})

APP.patch('/orders/:uuid', async function (request, response) {
    try {
        console.log(`********** START : GET /orders/:uuid: GET ORDER BY UUID API **********`);
        const validation = ORDERS_VALIDATOR.update(request)

        if (!validation.isValid) {
            return API_HELPER.message(response, [], validation.errors)
        }
        const order = await ORDERS_ENTITIES.updateOrder(request.params.uuid, request.body)
        console.log(order);

        return response.json({ success: true, message: "Updated order successfully", data: order })
    } catch (error) {
        console.log(`Unable to get products ERR::`, error.message);
        return API_HELPER.message(response, [], error)
    } finally
    {
        console.log('********** END : GET /orders/:id: GET ORDER BY ID API **********');
    }
})

APP.listen(process.env.PORT, function () {
    console.log(`Sample service is running on port ${process.env.PORT}`)
})