const Column = require("./column")

module.exports = class Schema {
    constructor(entity, entities, schemas) {
        this.columns = {}
        const instance = new entity()
        Object.entries(instance).forEach(([columnName, field]) => this.columns[columnName] = new Column()
            .buildColumn(columnName, field, entity, entities, schemas))
        Object.entries(schemas).forEach(([schemaName, schema]) => {
            if (schema.hasReverseForeignKeyFor(entity.name)) {
                this.addForeignKey(schemaName)
            }
        })
        this.schemaName = entity.name.toLowerCase()
        this.entity = entity
    }

    addForeignKey(entityName) {
        this.columns[entityName.toLowerCase() + "Id"] = new Column().buildForeignKeyColumn(entityName)
    }

    hasReverseForeignKeyFor(entityName) {
        return Object.values(this.columns).some(column => column.isReverseForeignKeyFor(entityName))
    }

    getForeignKeyColumnName(entityName) {
        return Object.values(this.columns).filter(column => column.isForeignKeyFor(entityName))[0].columnName
    }

    getReverseForeignKeys() {
        return Object.entries(this.columns)
            .filter(([_, column]) => !column.isReal())
            .map(([columnName, column]) => {
                return { columnName, foreignEntity: column.foreignEntity }
            })
    }

    getForeignKeys() {
        return Object.entries(this.columns)
            .filter(([_, column]) => column.isForeignKey())
            .map(([columnName, column]) => {
                return { columnName, foreignEntity: column.foreignEntity }
            })
    }

    generateCreateTableScript() {
        const columnSql = Object.values(this.columns)
            .filter(column => column.isReal())
            .map(column => column.generateCreateTableScript())
            .join(",\n")
        return `CREATE TABLE ${this.schemaName} ( 
                    id SERIAL PRIMARY KEY,
                    ${columnSql}
                );`
    }

    generateSelectScript(columnName, value) {
        let resolvedValue
        if (columnName === "id") {
            resolvedValue = value
        } else {
            const column = this.columns[columnName]
            if (!column) {
                console.log(Object.keys(this.columns))
                throw "Unknown column: " + columnName
            }

            resolvedValue = column.generateScriptForValue(value)
        }

        return `SELECT * FROM ${this.schemaName} WHERE ${columnName} = ${resolvedValue}`
    }

    generateInsertScript(instance) {
        const fields = []
        const values = []
        console.log("generateInsertScript")
        Object.entries(this.columns).forEach(([columnName, column]) => {
            if (column.isReal()) {
                fields.push(columnName)
                const value = instance[columnName]
                values.push(column.generateScriptForValue(value))
            }
        })
        return `INSERT INTO ${this.schemaName}(${fields}) VALUES (${values}) RETURNING *`
    }

    generateUpdateScript(instance) {
        const fieldUpdates = []
        console.log("generateUpdateScript")
        Object.entries(this.columns).forEach(([columnName, column]) => {
            if (column.isReal()) {
                const value = instance[columnName]
                fieldUpdates.push(`${columnName} = ${column.generateScriptForValue(value)}`)
            }
        })
        return `UPDATE ${this.schemaName} SET ${fieldUpdates.join(",")} WHERE id = ${instance.id}`
    }

    generateAddColumnScript(column) {
        return `ALTER TABLE ${this.schemaName} ADD COLUMN ${column.generateCreateTableScript()}`
    }

    getForeignEntityForColumn(columnName) {
        const column = this.columns[columnName]
        if (column) {
            return column.foreignEntity
        }
    }

    getForeignKey() {
        return `${this.schemaName}Id`
    }
}
