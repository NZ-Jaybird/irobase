const Schema = require("./schema")
const migrate = require("./migrate")
const Loader = require("./loader")
const persist = require("./persister")
const DataSource = require("./dataSource")
const EntityFactory = require("./entityFactory")

function isNonEmptyString(string) {
    return string && typeof (string) === 'string' && 0 < string.length
}

function getDataSource(args) {
    if (!isNonEmptyString(args.user)) {
        throw "Invalid database user"
    }
    if (!isNonEmptyString(args.database)) {
        throw "Invalid database"
    }
    if (!args.password && typeof (args.password) !== 'string') {
        throw "Invalid password"
    }
    const port = Number(args.port) || 5432
    const host = args.host || "localhost"
    if (!isNonEmptyString(host)) {
        throw "Invalid database host"
    }
    if (isNaN(port)) {
        throw "Invalid port for database connection"
    }
    return new DataSource(args.user, host, args.database, args.password, port)
}

function defineSessionWrapper(session) {
    return class Session extends session {
        constructor() {
            super()
            this.token = ""
        }
    }
}

module.exports = class Irobase {

    init(args) {
        this.dataSource = getDataSource(args)
        this.transactions = {}

        console.log("Irobase ready")

        return this
    }

    updateDomain(args) {
        if (this.transactions.length > 0) {
            throw "Cannot update domain while sessions are active"
        }

        if (typeof (args.session) !== 'function') {
            throw "Invalid session entity"
        }
        this.sessionEntity = defineSessionWrapper(args.session)

        const entities = args.domain || []
        if (!Array.isArray(entities)) {
            throw "Invalid domain"
        }
        entities.push(this.sessionEntity)

        this.schemas = {}
        entities.forEach(entity => {
            if (typeof (entity) !== 'function') {
                throw "Invalid domain entity"
            }
            if (entity === args.session) {
                throw "The session entity cannot be a domain entity"
            }
            this.schemas[entity.name] = new Schema(entity, entities, this.schemas)
        })

        this.entityFactory = new EntityFactory(this.schemas)
    }

    async migrate() {
        if (!this.transactions) {
            throw "Irobase is not initialised"
        }

        // TODO: deal with extant schemas
        await migrate(this.schemas, this.dataSource)
    }

    async beginTransaction(token) {
        console.log("Starting irobase transaction for token " + token)

        if (!this.transactions) {
            throw "Irobase is not initialised"
        }

        if (!token) {
            throw "Must specify a token"
        }

        const loader = new Loader(this.schemas, this.dataSource)

        let session;
        try {
            session = (await loader.load(this.sessionEntity.name, "token", token))[0]
        } catch (e) {
            throw "Error loading session: " + e
        }

        if (!session) {
            const sessionSchema = this.schemas[this.sessionEntity.name]
            session = this.entityFactory.createEntity(sessionSchema)
            session.token = token
        }

        console.log("Started irobase transaction for token " + token)

        return this.transactions[token] = session
    }

    async endTransaction(token) {
        console.log("Ending irobase transaction for token " + token)

        if (!this.transactions) {
            throw "Irobase is not initialised"
        }

        let session = this.transactions[token]
        if (!session) {
            throw "No transaction for session"
        }

        await persist(session, this.schemas, this.dataSource)

        delete this.transactions[token]

        console.log("Ended irobase transaction for token " + token)
    }

    async endTest() {
        if (!this.schemas) {
            return
        }
        for (const schema of Object.values(this.schemas)) {
            await this.dataSource.query(`drop table if exists ${schema.schemaName}`)
        }
    }
}
