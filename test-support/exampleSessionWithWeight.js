const exampleObject = require("./exampleObjectWithWeight")

module.exports = class ExampleSession {
    constructor() {
        this.exampleObjects = [exampleObject]
    }
}
