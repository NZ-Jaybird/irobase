module.exports = async function migrate(targetSchemas, dataSource) {
    for (const schema of Object.values(targetSchemas)) {
        const sql = schema.generateCreateTableScript()
        await dataSource.query(sql)
    }
}
