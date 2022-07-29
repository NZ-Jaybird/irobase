const exampleObject = require("../../test-support/exampleObject")
const exampleSession = require("../../test-support/exampleSessionWithId")
const assertThat = require("../../test-support/assert")
const Loader = require("../../loader")
const Schema = require("../../schema")

module.exports = class loaderTest {
    async run() {
        const domain = [ exampleObject, exampleSession ]
        const schemas = {}
        const sessionId = 10001;

        schemas.session = new Schema(exampleSession, domain, schemas)
        schemas.ExampleObject = new Schema(exampleObject, domain, schemas)

        // scenario 1 - setup dataSource with no data
        let dataSource = {
            query: sql => { return { rows: [] } }
        }
        let loader = new Loader(schemas, dataSource)

        let session = await loader.load(schemas.session, "sessionid", sessionId);
        assertThat(session.length).isEqualTo(0)

        // scenario 2 - setup dataSource with extant data

        dataSource = {
            query: sql => {
                if (sql.includes("examplesession")) {
                    return { rows: [ { sessionid: sessionId } ] }
                } else if (sql.includes("exampleobject")) {
                    return {rows: [ {
                            age: 33,
                            name: "Smith",
                            birthday: "Jan",
                            sessionid: sessionId
                        }]}
                } else {
                    throw "unexpected query: " + sql;
                }
            }
        }
        loader = new Loader(schemas, dataSource)
        session = await loader.load(schemas.session, "sessionid", sessionId);
        assertThat(session.length).isEqualTo(1)
    }
}
