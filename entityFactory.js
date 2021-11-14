module.exports = function createEntity(schema) {
    const instance = new schema.entity()
    schema.getReverseForeignKeys().forEach(key => {
        instance[key.columnName].pop()
    })
    return instance;
}
