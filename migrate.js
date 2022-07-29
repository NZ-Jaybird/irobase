async function getColumnsForExistingSchema(dataSource) {
    return await dataSource.query("SELECT *" +
        "  FROM information_schema.columns" +
        " WHERE table_schema = 'your_schema'" +
        "   AND table_name   = 'your_table';")
}

async function getExistingTables(dataSource) {
    const tableData = await dataSource.query(
        `SELECT table_schema || '.' || table_name AS table
         FROM information_schema.tables
         WHERE table_type = 'BASE TABLE'
           AND table_schema NOT IN (
             'pg_catalog'
             , 'information_schema');`)
    return tableData
        .rows
        .map(row => row.table)
}

async function updateTable(table, targetSchema, dataSource) {
    const columnQuery =
        "SELECT column_name, data_type " +
        "FROM INFORMATION_SCHEMA.COLUMNS " +
        `WHERE TABLE_NAME = '${targetSchema.schemaName}';`
    let columnData = (await dataSource.query(columnQuery)).rows
    for (const column of Object.values(targetSchema.columns)) {
        let columnExists = columnData.some(cd => cd.column_name === column.columnName.toLowerCase());
        if (columnExists || !column.isReal()) {
            columnData = columnData.filter(cd => cd.column_name !== column.columnName.toLowerCase())
        } else {
            const addColumnSql = targetSchema.generateAddColumnScript(column)
            await dataSource.query(addColumnSql)
        }
    }
    // remove columns in columnData from db
}

module.exports = async function migrate(targetSchemas, dataSource) {
    let existingSchemas = await getExistingTables(dataSource)
    for (const schema of Object.values(targetSchemas)) {
        let searchElement = `public.${schema.schemaName}`
        if (existingSchemas.includes(searchElement)) {
            await updateTable(searchElement, schema, dataSource)
            existingSchemas = existingSchemas.filter(existing => existing !== schema.schemaName)
        } else {
            const sql = schema.generateCreateTableScript()
            await dataSource.query(sql)
        }
    }

    for (const schemaName of existingSchemas) {
        // delete
    }
}
