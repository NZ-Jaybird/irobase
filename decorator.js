const load = require("./loader")

class DecoratedArray extends Array {
    constructor(foreignInstance) {
        super();
        this.foreignInstance = foreignInstance
    }
    push() {
        Object.values(arguments).forEach(element => element[this.foreignInstance.constructor.name + "Id"] = this.foreignInstance)
        return super.push(arguments);
    }
}

module.exports = function decorate(instance, entityName, schemas, dataSource) {
    Object.entries(instance).forEach(([name, field]) => {
        if (typeof(field) === 'object') {
            if (instance.id) {
                delete instance[name]
            } else {
                instance[name] = new DecoratedArray(instance)
            }
        }
    })
    return new Proxy(instance, {
        get: async (obj, key) => {
            if (obj[key]) {
                return obj[key]
            } else {
                const schema = schemas[entityName]
                const foreignSchema = schemas[schema.getForeignEntityForColumn(key)]
                if (foreignSchema) {
                    const valueFromDb = await load(foreignSchema, entityName + "Id", obj.id, dataSource)
                    if (valueFromDb) {
                        valueFromDb.push = foreignInstance => {
                            foreignInstance[name + "Id"] = instance
                            return Array.prototype.push.apply(this, foreignInstance)
                        }
                        return obj[key] = valueFromDb
                    }
                }
            }
        }
    })
}
