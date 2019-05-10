const puppeteer = require('puppeteer')
const { UA_CHROME, UA_CHROME_MOBILE } = require('./constants/useragent.js')
const {
  VIEWPORT_PC_DEFAULT,
  VIEWPORT_SP_DEFAULT
} = require('./constants/viewport.js')
const { argv2option, getArgOption } = require('./utils/arg.js')

/**
 * CAPTURE CLI OPTION
 * --url: capute url
 * --path: capture image dist path
 *
 */
const options = argv2option()
const url = getArgOption(options, '--url', 'https://www.google.co.jp')
const traceJson = getArgOption(options, '--path', 'trace/google.json')
const device = getArgOption(options, '--device', 'pc')

const ua = device === 'pc' ? UA_CHROME : UA_CHROME_MOBILE
const vp = device === 'pc' ? VIEWPORT_PC_DEFAULT : VIEWPORT_SP_DEFAULT
;(async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport(vp)
    await page.setUserAgent(ua)
    await page.tracing.start({
      path: traceJson,
      screenshots: true
    })
    await page.goto(url)
    await page.tracing.stop()
    await browser.close()
    process.exit()
  } catch (err) {
    console.log(err)
    process.exit()
  }
})()
