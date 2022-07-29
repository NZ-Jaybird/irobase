module.exports = class ExampleObject {
    constructor() {
        this.age = 0
        this.name = ""
        this.birthday = ""
        this.weight = 1.1
    }

    build(age, name, birthday, weight) {
        this.age = age
        this.name = name
        this.birthday = birthday
        this.weight = weight

        return this
    }
}
