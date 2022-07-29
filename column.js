module.exports = class Column {
    buildColumn(columnName, field, entity, entities, schemas) {
        const fieldType = typeof(field);
        switch (fieldType) {
            case 'number':
                if (Math.floor(field) === field) {
                    this.dataType = "integer"
                } else {
                    this.dataType = "real"
                }
                break;
            case 'string':
                this.dataType = "text"
                break;
            case 'function':
                this.#foreignField(field, entities)
                this.dataType = "integer"
                break;
            case 'object':
                if (!Array.isArray(field)) {
                    throw "Invalid object type in domain entity"
                }
                if (1 !== field.length) {
                    throw "Invalid array size for domain entity"
                }
                const arrayType = field[0]
                this.#foreignField(arrayType, entities)
                this.metaType = "reverseForeignKey"
                const foreignSchema = schemas[this.foreignEntity]
                if (foreignSchema) {
                    foreignSchema.addForeignKey(entity.name)
                }
                break;
            default:
                throw "Unsupported field type for domain entity: " + fieldType
        }
        this.columnName = columnName

        return this
    }

    buildForeignKeyColumn(foreignEntityName) {
        this.foreignEntity = foreignEntityName
        this.dataType = "integer"
        this.columnName = foreignEntityName + "Id"

        return this
    }

    isForeignKeyFor(entityName) {
        return !this.metaType && this.foreignEntity && this.foreignEntity.toLowerCase() === entityName
    }

    isReverseForeignKeyFor(entityName) {
        return "reverseForeignKey" === this.metaType && this.foreignEntity === entityName
    }

    isReal() {
        return !!this.dataType
    }

    generateCreateTableScript() {
        return `${this.columnName} ${this.dataType}`
    }

    generateScriptForValue(value) {
        if (this.dataType === "integer") {
            return value
        } else {
            return `'${value}'`
        }
    }

    #foreignField(entity, entities) {
        if (!entities.includes(entity)) {
            throw "Unknown domain entity"
        }
        this.foreignEntity = entity.name
    }
}
