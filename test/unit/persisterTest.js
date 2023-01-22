const exampleObject = require("../../test-support/exampleObjectWithJob")
const exampleRelatedObject = require("../../test-support/exampleRelatedObject")
const exampleSession = require("../../test-support/exampleSessionWithJob")
const assertThat = require("../../test-support/assert")
const persist = require("../../persister")
const Schema = require("../../schema")

module.exports = class persisterTest {
    async run() {
        const domain = [exampleObject, exampleRelatedObject, exampleSession]
        const schemas = {}

        schemas.ExampleSession = new Schema(exampleSession, domain, schemas)
        schemas.ExampleObject = new Schema(exampleObject, domain, schemas)
        schemas.RelatedObject = new Schema(exampleRelatedObject, domain, schemas)

        // verify foreign key is populated correctly
        const session = new exampleSession().build([new exampleObject().build(
            33,
            "name",
            "18 January",
            new exampleRelatedObject().build(
                "JonathanXYZ",
                "Developer",
                "0"
            )
        )])

        const capturedSql = []
        let dataSource = {
            query: sql => {
                capturedSql.push(sql)
                return { rows: [{ id: 1 }] }
            }
        }

        await persist(session, schemas, dataSource)

        assertThat(capturedSql[2]).contains("'18 January',1,1")
    }
}
