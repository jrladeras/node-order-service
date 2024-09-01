const API_HELPER = require('../helpers/api')

module.exports = {
    create: (request) =>{

        API_HELPER.validateAddCustomFormat('fulfillment_type_format', (input) => {
            const valids = ['Delivery', 'Pickup'] 
            return valids.includes(input)
        })

        API_HELPER.validateAddCustomFormat('mode_of_payment_type_format', (input) => {
            const valids = ['Cash', 'Online']
            return valids.includes(input)
        })

        API_HELPER.validateAddCustomFormat('payment_status_type_format', (input) => {
            const valids = ['Pending', 'Paid', 'Failed']
            return valids.includes(input)
        })

        const schema = {
            type: "object",
            properties: {
                mode_of_payment: { type: "string", format: 'mode_of_payment_type_format'},
                payment_network: { type: "string" },
                payment_status: { type: "string", minLength: 1, format: 'payment_status_type_format'},
                fulfillment_type: { type: "string", minLength: 1, format: 'fulfillment_type_format'},
                customer: {
                    type: "object",
                    properties: {
                        first_name: { type: "string", minLength: 1},
                        last_name: { type: "string", minLength: 1},
                        email: { type: "string", format: "email" },
                        contact_number: { type: "string", minLength: 1},
                    },
                    required: ["first_name", "last_name", "contact_number"]
                },
                items: {
                    type: "array",
                    minItems: 1,
                    items: {
                        properties: {
                            sku: { type: "string" },
                            name: { type: "string", minLength: 1},
                            quantity: { type: "number", minimum: 1},
                            price: { type: "number" },
                        },
                        required: ["sku", "name", "quantity", "price"]
                    }
                }
            },
            required: ["fulfillment_type", "customer", "items"]
        }

        return API_HELPER.validate(schema, request.body)
    },

    update: (request) => {
        API_HELPER.validateAddCustomFormat('fulfillment_type_format', (input) => {
            const valids = ['Delivery', 'Pickup'] 
            return valids.includes(input)
        })

        API_HELPER.validateAddCustomFormat('mode_of_payment_type_format', (input) => {
            const valids = ['Cash', 'Online']
            return valids.includes(input)
        })

        API_HELPER.validateAddCustomFormat('status_format', (input) => {
            const valids = ['Preparing', 'Ready', 'Completed']
            return valids.includes(input)
        })

        API_HELPER.validateAddCustomFormat('payment_status_type_format', (input) => {
            const valids = ['Pending', 'Paid', 'Failed']
            return valids.includes(input)
        })

        const schema = {
            type: "object",
            properties: {
                mode_of_payment: { type: "string", format: 'mode_of_payment_type_format'},
                payment_network: { type: "string" },
                payment_status: { type: "string", format: 'payment_status_type_format'},
                fulfillment_type: { type: "string", format: 'fulfillment_type_format'},
                order_status: { type: "string", format: 'status_format' },
            },
            required: []
        }

        return API_HELPER.validate(schema, request.body)
    }
}