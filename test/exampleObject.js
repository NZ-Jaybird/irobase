module.exports = class ExampleObject {
    constructor() {
        this.age = 0
        this.name = ""
        this.birthday = ""
    }

    build(age, name, birthday) {
        this.age = age
        this.name = name
        this.birthday = birthday

        return this
    }
}
