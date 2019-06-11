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
const traceJson = getArgOption(options, '--path', 'trace.json')
const device = getArgOption(options, '--device', 'pc')

const ua = device === 'pc' ? UA_CHROME : UA_CHROME_MOBILE
const vp = device === 'pc' ? VIEWPORT_PC_DEFAULT : VIEWPORT_SP_DEFAULT
;(async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport(vp)
    await page.setUserAgent(ua)
    let requestList = {}
    page.on('request', async (req) => {
      const resource = req.resourceType()
      if (req.method() === 'GET' && (resource === 'xhr' || resource === 'fetch')) {
        const url = req.url()
        const start = await page.metrics()
        requestList[url] = {
          resource,
          start: start.Timestamp
        }
      }
    });
    page.on('requestfinished', async (req) => {
      const end = await page.metrics()
      const url = req.url()
      if (requestList.hasOwnProperty(url)) {
        const info = requestList[url] = {
          ...requestList[url],
          end: end.Timestamp,
          time: end.Timestamp - requestList[url].start
        }
        console.log(`${Math.floor((info.end - info.start) * 1000000) / 1000}ms: ${info.resource} -> ${url}`)
      }
    })
    await page.goto(url)
    // page.removeListener('request', logger);
    await browser.close()
    console.table(requestList)
    process.exit()
  } catch (err) {
    console.log(err)
    process.exit()
  }
})()
