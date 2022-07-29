const exampleObject = require("../../test-support/exampleObject")
const exampleSession = require("../../test-support/exampleSession")
const assertThat = require("../../test-support/assert")

module.exports = class createTableTest {
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

        session = await irobase.beginTransaction(sessionId)
        assertThat(session.exampleObjects[0].age).isEqualTo(12)
        assertThat(session.exampleObjects[0].name).isEqualTo("user")
        assertThat(session.exampleObjects[0].birthday).isEqualTo("March 12")
        await irobase.endTransaction(sessionId)
    }
}
