module.exports = async function persist(session, schemas, dataSource) {
    // TODO: Support partial persisting
    const instanceStack = [session]
    while (instanceStack.length > 0) {
        const instance = instanceStack.pop()
        const schema = schemas[(await instance.constructor).name]
        const sql = schema.generateInsertScript(instance)
        const results = await dataSource.query(sql)
        instance.id = results.rows[0].id
        Object.values(instance).forEach(field => {
            if (typeof(field) === 'object') {
                if (Array.isArray(field)) {
                    field.forEach(element => {
                        element[schema.schemaName + "Id"] = instance.id
                        if (!element.id) {
                            instanceStack.push(element)
                        }
                    })
                } else {
                    if (!field.id) {
                        instanceStack.push(field)
                    }
                }
            }
        })
    }
}
