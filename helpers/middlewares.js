const API_HELPER = require('../helpers/api')

module.exports = {
    applicationAuthentication: async (request, response, type = 'customer', next) => {
        try {
            let headers = request.headers;
            let token = headers['authorization'];

            if (!token || token == '') {
                response.status(401).json({
                    successful: false,
                    message: "Invalid Token"
                });
                response.end();
            }
            let jwtJSON = JSON.parse(module.exports.jwtParsePayload(request.headers['authorization']));

            if (jwtJSON && jwtJSON.role === type) {
                next();
                
            } else {
                response.status(401).json({
                    successful: false,
                    message: "Invalid Token"
                });
                response.end();
            }
        }
        catch (error) {
            response.status(error.status).json({
                successful: false,
                message: "An error has occured",
                error: error
            })
            response.end();
        }
        finally{
            response.on('finish', async () => {
                await API_HELPER.destroyHttps()
                console.log(`----- API END`)
            })
        }
    },

    jwtParsePayload(jwt) {
        let _ob = jwt.split('.');
        let buf = Buffer.from(_ob[1], 'base64').toString("ascii");
        return buf;
    }
}