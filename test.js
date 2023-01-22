let createTableTest = require("./test/integration-db/createTableTest")
let updateTableTest = require("./test/integration-db/updateTableTest")
let addForeignTableTest = require("./test/integration-db/addForeignTableTest")
let entityFactoryTest = require("./test/unit/entityFactoryTest")
let loaderTest = require("./test/unit/loaderTest")
let persisterTest = require("./test/unit/persisterTest")
const Irobase = require("./irobase");
let failureCount = 0

async function runTest(test, filter) {
    if (filter && test.constructor.name !== filter) {
        return
    }
    const irobase = new Irobase().init({
        database: "test",
        password: "test",
        user: "test",
    })
    try {
        console.log("Running test " + test.constructor.name)
        await test.run(irobase)
        console.log("Test passed")
    } catch (e) {
        console.log("Test failed: " + e)
        failureCount++
    }
    await irobase.endTest()
    console.log()
}

async function runSuite(filter) {
    try {
        await runTest(new entityFactoryTest(), filter)
        await runTest(new loaderTest(), filter)
        await runTest(new persisterTest(), filter)
        await runTest(new createTableTest(), filter)
        await runTest(new updateTableTest(), filter)
        await runTest(new addForeignTableTest(), filter)
    } catch (e) {
        console.error("Tests failed: " + e)
    }
    console.log(`${failureCount} tests failed`)
}

if (process.argv.length > 2) {
    runSuite(process.argv[2])
} else {
    runSuite()
}
