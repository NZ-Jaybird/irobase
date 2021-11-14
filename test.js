let createTableTest = require("./test/createTableTest")

async function run() {
    try {
        await new createTableTest().run()
    } catch (e) {
        throw  "Test failed: " + e
    }

    console.log("Test passed")
}

run()
