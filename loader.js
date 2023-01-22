const EntityFactory = require("./entityFactory")

module.exports = class loader {
    constructor(schemas, dataSource) {
        this.schemas = schemas
        this.dataSource = dataSource
        this.entityFactory = new EntityFactory(schemas)
        this.seenSchemas = {}
    }

    async load(entityName, column, id) {
        if (this.seenSchemas[entityName]) {
            if (this.seenSchemas[entityName][id]) {
                return this.seenSchemas[entityName][id]
            }
        } else {
            this.seenSchemas[entityName] = {}
        }
        const schema = this.schemas[entityName]
        const sql = schema.generateSelectScript(column, id)
        const data = await this.dataSource.query(sql)
        const instances = []
        for (const row of data.rows) {
            const blankEntity = this.entityFactory.createEntity(schema)
            const instance = Object.assign(blankEntity, row)
            this.seenSchemas[entityName][id] = instance
            for (const { columnName, foreignEntity } of schema.getReverseForeignKeys()) {
                const foreignKey = schema.getForeignKey()
                instance[columnName] = await this.load(foreignEntity, foreignKey, instance.id)
            }
            for (const { columnName, foreignEntity } of schema.getForeignKeys()) {
                if (instance[columnName]) {
                    instance[columnName] = (await this.load(foreignEntity, "id", instance[columnName]))[0]
                }
            }
            instances.push(instance)
        }
        return instances
    }
}
