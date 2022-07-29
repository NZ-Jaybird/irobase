let createTableTest = require("./test/integration-db/createTableTest")
let updateTableTest = require("./test/integration-db/updateTableTest")
let loaderTest = require("./test/unit/loaderTest")
const Irobase = require("./irobase");

async function runTest(test) {
    const irobase = new Irobase().init({
        database: "test",
        password: "test",
        user: "test",
    })
    try {
        await test.run(irobase)
        console.log("Test passed")
    } catch (e) {
        console.log("Test failed: " + e)
    }
    await irobase.endTest()
}

async function runSuite() {
    try {
        await runTest(new loaderTest())
        await runTest(new createTableTest())
        await runTest(new updateTableTest())
    } catch (e) {
        console.error("Tests failed: " + e)
    }
}

runSuite()
