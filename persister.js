module.exports = async function persist(session, schemas, dataSource) {
    // TODO: Support partial persisting
    const instanceStack = [session]
    while (instanceStack.length > 0) {
        const instance = instanceStack.pop()
        const schema = schemas[(await instance.constructor).name]
        for (const [fieldName, field] of Object.entries(instance)) {
            if (typeof (field) === 'object') { // TODO: Improve model to avoid using typeof here
                if (!Array.isArray(field)) {
                    instance[fieldName].id = await persist(field, schemas, dataSource)
                }
            }
        }
        let sql;
        if (instance.id) {
            sql = schema.generateUpdateScript(instance)
        } else {
            sql = schema.generateInsertScript(instance)
        }
        const results = await dataSource.query(sql)
        if (!instance.id) {
            instance.id = results.rows[0].id
        }
        Object.values(instance).forEach(field => {
            if (typeof (field) === 'object') { // TODO: Improve model to avoid using typeof here
                if (Array.isArray(field)) {
                    field.forEach(element => {
                        element[schema.schemaName + "Id"] = instance.id // TODO: is this necessary for an update?
                        instanceStack.push(element)
                    })
                }
            }
        })
    }

    return session.id
}
