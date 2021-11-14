class Assert {
    constructor(actual) {
        this.actual = actual
    }

    isEqualTo(expected) {
        if (expected !== this.actual) {
            throw `Expected ${expected} but was ${this.actual}`
        }
    }
}

module.exports = function assertThat(actual) {
    return new Assert(actual)
}
