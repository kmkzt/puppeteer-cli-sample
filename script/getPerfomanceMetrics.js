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
// const capturePath = getArgOption(options, '--path', 'capture/google.png')
const device = getArgOption(options, '--device', 'pc')

const ua = device === 'pc' ? UA_CHROME : UA_CHROME_MOBILE
const vp = device === 'pc' ? VIEWPORT_PC_DEFAULT : VIEWPORT_SP_DEFAULT

;(async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport(vp)
    await page.setUserAgent(ua)
    await page.goto(url)
    const metrics = await page.metrics()
    console.log(metrics)
    process.exit()
    // return metrics.reduce((acc, i) => ({ ...acc, [i.name]: i.value }), {})
  } catch (err) {
    console.log(err)
    process.exit()
  }
})()
