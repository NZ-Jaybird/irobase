const createEntity = require("./entityFactory")

module.exports = class loader {
    constructor(schemas, dataSource) {
        this.schemas = schemas
        this.dataSource = dataSource
    }

    async load(schema, column, id) {
        const sql = schema.generateSelectScript(column, id)
        const data = await this.dataSource.query(sql)
        const instances = []
        for (const row of data.rows) {
            const blankEntity = createEntity(schema)
            const instance = Object.assign(blankEntity, row)
            for (const {columnName, foreignEntity} of schema.getReverseForeignKeys()) {
                instance[columnName] = await this.load(this.schemas[foreignEntity], column, instance.id)
            }
            instances.push(instance)
        }
        return instances
    }
}
