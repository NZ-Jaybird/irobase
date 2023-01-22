const exampleObject = require("./exampleObjectWithSessionId")

module.exports = class ExampleSession {
    constructor() {
        this.exampleObjects = [exampleObject]
        this.id = -1
    }
}
