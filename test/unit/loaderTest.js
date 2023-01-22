const exampleObject = require("../../test-support/exampleObjectWithSessionId")
const exampleSession = require("../../test-support/exampleSessionWithId")
const assertThat = require("../../test-support/assert")
const Loader = require("../../loader")
const Schema = require("../../schema")

module.exports = class loaderTest {
    async run() {
        const domain = [exampleObject, exampleSession]
        const schemas = {}
        const sessionId = 10001;

        schemas["examplesession"] = new Schema(exampleSession, domain, schemas)
        schemas.ExampleObject = new Schema(exampleObject, domain, schemas)

        // scenario 1 - setup dataSource with no data
        console.log("part 1: load empty object")
        let dataSource = {
            query: sql => { return { rows: [] } }
        }
        let loader = new Loader(schemas, dataSource)

        let session = await loader.load("examplesession", "id", sessionId);
        assertThat(session.length).isEqualTo(0)
        console.log("part 1 complete")

        // scenario 2 - setup dataSource with extant data
        console.log("part 2: load existing object")

        dataSource = {
            query: sql => {
                if (sql.includes("FROM examplesession")) {
                    return { rows: [{ id: sessionId }] }
                } else if (sql.includes("FROM exampleobject")) {
                    return {
                        rows: [{
                            age: 33,
                            name: "Smith",
                            birthday: "Jan",
                            sessionId: sessionId
                        }]
                    }
                } else {
                    throw "unexpected query: " + sql;
                }
            }
        }
        loader = new Loader(schemas, dataSource)
        session = await loader.load("examplesession", "id", sessionId);
        assertThat(session.length).isEqualTo(1)

        console.log("part 2 complete")
    }
}
