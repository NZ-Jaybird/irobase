class Assert {
    constructor(actual) {
        this.actual = actual
    }

    isEqualTo(expected) {
        if (expected !== this.actual) {
            throw `Expected ${expected} but was ${this.actual}`
        }
    }

    contains(expected) {
        if (!(this.actual.indexOf(expected) >= 0)) {
            throw `Expected a string containing ${expected} but was ${this.actual}`
        }
    }
}

module.exports = function assertThat(actual) {
    return new Assert(actual)
}
