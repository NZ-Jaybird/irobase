module.exports = class RelatedObject {
    constructor() {
        this.company = ""
        this.position = ""
        this.salary = 0
    }

    build(company, position, salary) {
        this.company = company
        this.position = position
        this.salary = salary

        return this
    }
}
