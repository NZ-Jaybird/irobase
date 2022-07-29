const exampleObject = require("../../test-support/exampleObject")
const exampleObjectWithWeight = require("../../test-support/exampleObjectWithWeight")
const exampleSession = require("../../test-support/exampleSession")
const exampleSessionWithWeight = require("../../test-support/exampleSessionWithWeight")
const assertThat = require("../../test-support/assert")

module.exports = class updateTableTest {
    async run(irobase) {
        irobase.updateDomain({
            domain: [
                exampleObject
            ],
            session: exampleSession
        })
        await irobase.migrate()

        const sessionId = 100001
        let session = await irobase.beginTransaction(sessionId);
        session.exampleObjects.push(new exampleObject().build(12, "user", "March 12"))
        await irobase.endTransaction(sessionId)

        irobase.updateDomain({
            domain: [
                exampleObjectWithWeight
            ],
            session: exampleSessionWithWeight
        })
        await irobase.migrate()

        session = await irobase.beginTransaction(sessionId);
        session.exampleObjects[0].weight = 49.9
        await irobase.endTransaction(sessionId)

        session = await irobase.beginTransaction(sessionId)
        assertThat(session.exampleObjects[0].age).isEqualTo(12)
        assertThat(session.exampleObjects[0].weight).isEqualTo(49.9)
        await irobase.endTransaction(sessionId)
    }
}
