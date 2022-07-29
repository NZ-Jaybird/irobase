const exampleObject = require("./exampleObject")

module.exports = class ExampleSession {
    constructor() {
        this.exampleObjects = [exampleObject]
        this.sessionid = -1
    }
}
