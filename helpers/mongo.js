const dotenv    = require('dotenv').config();
const MONGOOSE  = require('mongoose');

try {
    if(dotenv.error) {
        throw dotenv.error;
    }
    
    const connection_info = {
        DB_USER         :   process.env.DB_USER,
        DB_PASS         :   process.env.DB_PASS,
        DB_HOST         :   process.env.DB_HOST,
        DB_PORT         :   process.env.DB_PORT,
        DB_NAME         :   process.env.DB_NAME,
        DB_AUTH_SOURCE  :   process.env.DB_AUTH_SOURCE
    };

    let connection_url;
    if(connection_info.DB_HOST == 'localhost')
    {
        connection_url = `mongodb://${connection_info.DB_HOST}:${connection_info.DB_PORT}/${connection_info.DB_NAME}?authSource=${connection_info.DB_AUTH_SOURCE}`;
    }
    else
    {
        connection_url = `mongodb://${connection_info.DB_USER}:${connection_info.DB_PASS}@${connection_info.DB_HOST}/${connection_info.DB_NAME}?retryWrites=true&w=majority`;
    }

    const connection = MONGOOSE.createConnection(connection_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        async function(error) {
            if (error) {
                console.log("ERROR", error);
                console.log('access denied');
            } else {
                console.log("access granted");
                console.log(connection_info);
            }
        }
    );

    MONGOOSE.pluralize(null);
    MONGOOSE.con = connection;

    module.exports = MONGOOSE;
} catch (error) {
    console.log(error);
}