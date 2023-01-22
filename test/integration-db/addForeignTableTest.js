const exampleObject = require("../../test-support/exampleObject")
const exampleObjectWithJob = require("../../test-support/exampleObjectWithJob")
const exampleRelatedObject = require("../../test-support/exampleRelatedObject")
const exampleSession = require("../../test-support/exampleSession")
const exampleSessionWithJob = require("../../test-support/exampleSessionWithJob")
const assertThat = require("../../test-support/assert")

module.exports = class addForeignTableTest {
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
                exampleObjectWithJob,
                exampleRelatedObject
            ],
            session: exampleSessionWithJob
        })
        await irobase.migrate()

        session = await irobase.beginTransaction(sessionId);
        session.exampleObjects[0].job = new exampleRelatedObject().build(
            "microsoft", "cloud architect", 100000)
        await irobase.endTransaction(sessionId)

        session = await irobase.beginTransaction(sessionId)
        assertThat(session.exampleObjects[0].age).isEqualTo(12)
        assertThat(session.exampleObjects[0].job.company).isEqualTo("microsoft")
        assertThat(session.exampleObjects[0].job.position).isEqualTo("cloud architect")
        assertThat(session.exampleObjects[0].job.salary).isEqualTo(100000)
        await irobase.endTransaction(sessionId)
    }
}
