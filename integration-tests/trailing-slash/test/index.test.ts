import {describe, it, expect, beforeAll, afterAll} from "vitest"
import {
  killApp,
  findPort,
  launchApp,
  nextBuild,
  nextStart,
  runBlitzCommand,
  blitzLaunchApp,
  blitzBuild,
  blitzStart,
} from "../../utils/next-test-utils"
import webdriver from "../../utils/next-webdriver"

import {join} from "path"

let app: any
let appPort: number = 3000
const appDir = join(__dirname, "../")

const runTests = (mode?: string) => {
  describe("Trailing Slash", () => {
    it(
      "should render query result",
      async () => {
        const browser = await webdriver(appPort, "/use-query")
        let text = await browser.elementByCss("#page").text()
        expect(text).toMatch(/Loading/)
        await browser.waitForElementByCss("#content", 0)
        text = await browser.elementByCss("#content").text()
        expect(text).toMatch(/basic-result/)
        if (browser) await browser.close()
      },
      5000 * 60 * 2,
    )
  })
}
describe("Trailing Slash Tests", () => {
  describe("dev mode", () => {
    beforeAll(async () => {
      try {
	await runBlitzCommand(["prisma", "migrate", "reset", "--force"])
        appPort = await findPort()
        app = await blitzLaunchApp(appPort, {cwd: process.cwd()})
      } catch (error) {
        console.log(error)
      }
    }, 5000 * 60 * 2)
    afterAll(async () => await killApp(app))
    runTests()
  })

  describe("server mode", () => {
    beforeAll(async () => {
      try {
        await runBlitzCommand(["prisma", "generate"])
        await runBlitzCommand(["prisma", "migrate", "deploy"])
        await blitzBuild()
        appPort = await findPort()
        app = await blitzStart(appPort, {cwd: process.cwd()})
      } catch (err) {
        console.log(err)
      }
    }, 5000 * 60 * 2)
    afterAll(async () => await killApp(app))

    runTests()
  })
})
