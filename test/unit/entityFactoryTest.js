const EntityFactory = require("../../entityFactory")
const Schema = require("../../schema")
const assertThat = require("../../test-support/assert")
const exampleObjectWithJob = require("../../test-support/exampleObjectWithJob")
const exampleRelatedObject = require("../../test-support/exampleRelatedObject")

module.exports = class entityFactoryTest {
    async run() {
        const schemas = {}

        const domain = [exampleObjectWithJob, exampleRelatedObject]
        const schema = new Schema(exampleObjectWithJob, domain, schemas)

        schemas["ExampleObject"] = schema
        schemas["RelatedObject"] = new Schema(exampleRelatedObject, domain, schemas)

        const entityFactory = new EntityFactory(schemas)
        const exampleObject = entityFactory.createEntity(schema)

        assertThat(exampleObject.age).isEqualTo(0)
        assertThat(exampleObject.job.company).isEqualTo("")
    }
}
