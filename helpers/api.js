const Validator = require('jsonschema').Validator
module.exports = {
    app: () => {
        const EXPRESS = require('express')
        const APP = EXPRESS()
        const BODY_PARSER = require('body-parser')
        APP.use(BODY_PARSER.json({ strict: false }))
        APP.use(BODY_PARSER.urlencoded({ extended: true }))

        return APP
    },

    message: (response, data = [], errors = [], message = null, code = null) => {
        const success = errors.length < 1

        if (message == null) {
            message = success ? 'success' : 'failed'
        }

        if (code == null) {
            code = success ? 200 : 400
        }

        return response.status(code).json({ successful: success, message: message, data: data, errors: errors })
    },

    destroyHttps: async () => {
        if (global.https_agent) {
            try {
                await global.https_agent.destroy()
                console.log('HTTPS agent Released')                
            } catch(error) {
                console.log('Unable to Release HTTPS agent: ', error)
            }
        } else {
            console.log('Nothing to Release: ', global.https_agent)
        }
    },

    validateAddCustomFormat: (name, functionRule) => {
        Validator.prototype.customFormats[name] = function(input) {
            return functionRule(input)
        }
    },

    validate: (schema, payload) => {
        const v = new Validator()
        const validation = v.validate(payload, schema)

        let errors = []
        for (const error of validation.errors) {
            errors.push(error.stack)
        }

        return {
            isValid: errors[0] === undefined,
            errors: errors,
            message: errors.join('; ')
        }
    }
}