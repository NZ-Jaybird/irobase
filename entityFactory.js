module.exports = class entityFactory {
    constructor(schemas) {
        this.schemas = schemas
    }

    createEntity(schema) {
        const instance = new schema.entity()
        for (const column of Object.values(schema.columns)) {
            if (column.isReverseForeignKey()) {
                instance[column.columnName].pop()
            } else if (column.isForeignKey()) {
                instance[column.columnName] = this.createEntity(this.schemas[column.foreignEntity])
            }
        }
        return instance;
    }
}
