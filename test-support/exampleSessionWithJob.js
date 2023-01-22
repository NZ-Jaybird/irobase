const exampleObject = require("./exampleObjectWithJob")

module.exports = class ExampleSession {
    constructor() {
        this.exampleObjects = [exampleObject]
    }

    build(exampleObjects) {
        this.exampleObjects = exampleObjects

        return this
    }
}
