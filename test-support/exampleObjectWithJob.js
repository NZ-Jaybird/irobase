const exampleRelatedObject = require("./exampleRelatedObject")

module.exports = class ExampleObject {
    constructor() {
        this.age = 0
        this.name = ""
        this.birthday = ""
        this.job = exampleRelatedObject
    }

    build(age, name, birthday, job) {
        this.age = age
        this.name = name
        this.birthday = birthday
        this.job = job

        return this
    }
}
