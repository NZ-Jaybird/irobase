const Schema = require("./schema")
const migrate = require("./migrate")
const Loader = require("./loader")
const persist = require("./persister")
const DataSource = require("./dataSource")
const createEntity = require("./entityFactory")

function isNonEmptyString(string) {
    return string && typeof(string) === 'string' && 0 < string.length
}

function getDataSource(args) {
    if (!isNonEmptyString(args.user)) {
        throw "Invalid database user"
    }
    if (!isNonEmptyString(args.database)) {
        throw "Invalid database"
    }
    if (!args.password && typeof(args.password) !== 'string') {
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
            this.sessionId = ""
        }
    }
}

module.exports = class Irobase {

    init(args) {
        if (typeof(args.session) !== 'function') {
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
            if (typeof(entity) !== 'function') {
                throw "Invalid domain entity"
            }
            if (entity === args.session) {
                throw "The session entity cannot be a domain entity"
            }
            this.schemas[entity.name] = new Schema(entity, entities, this.schemas)
        })

        this.dataSource = getDataSource(args)
        this.transactions = {}
        this.loader = new Loader(this.schemas, this.dataSource)

        return this
    }

    async migrate() {
        if (!this.transactions) {
            throw "Irobase is not initialised"
        }

        // TODO: deal with extant schemas
        await migrate(this.schemas, this.dataSource)
    }

    async beginTransaction(sessionId) {
        if (!this.transactions) {
            throw "Irobase is not initialised"
        }

        if (!sessionId) {
            throw "Must specify a sessionId"
        }

        let session;
        const sessionSchema = this.schemas[this.sessionEntity.name];
        try {
            session = (await this.loader.load(sessionSchema, "sessionId", sessionId))[0]
        } catch (e) {
            throw "Error loading session: " + e
        }

        if (!session) {
            session = createEntity(sessionSchema)
            session.sessionId = sessionId
        }

        return this.transactions[sessionId] = session
    }

    async endTransaction(sessionId) {
        if (!this.transactions) {
            throw "Irobase is not initialised"
        }

        let session = this.transactions[sessionId]
        if (!session) {
            throw "No transaction for session"
        }

        await persist(session, this.schemas, this.dataSource)

        delete this.transactions[sessionId]
    }

    async startTest() {
        if (!this.transactions) {
            throw "Irobase is not initialised"
        }

        await this.dataSource.query("BEGIN;")
    }

    async endTest() {
        if (!this.transactions) {
            throw "Irobase is not initialised"
        }

        await this.dataSource.query("ROLLBACK;")
    }
}
