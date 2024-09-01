const MONGOOSE  = require('../helpers/mongo');

module.exports = class MODEL {
    constructor(collection, schema) {
        this.collection     = collection;
        this.schema         = schema
        this.collection     = MONGOOSE.con.model(collection, schema, collection);
    }

    async doc (id)
    {
        try 
        {
            const collection = this.collection;
            return await collection.findById(id);
        }
        catch (error)
        {
            return error;
        }
    }

    async docs (data = {}) {
        try {
            const collection = this.collection;
            return await collection.find(data);
        } catch (error) {
            return error;
        }
    }

    async add(data = {}) {
        try {
            const collection = this.collection;
            const modelObj = new collection(data);
            return await modelObj.save();            
        } catch (error) {
            return error;
        }
    }

    async update(uuid, options = {}) {
        try {
            const collection = this.collection;
            return await collection.updateOne({uuid}, options, {new: true});
        } catch (error) {
            return error;
        }
    }
}