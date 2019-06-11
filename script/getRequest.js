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
        requestList[url] = {
          resource,
          start: await page.metrics()
        }
      }
    });
    page.on('requestfinished', async (req) => {
      let end = await page.metrics()
      const url = req.url()
      const info = requestList[url]
      if (requestList.hasOwnProperty(url)) {
        console.log(`${info.resource}: ${url} -> ${Math.floor((end.Timestamp - info.start.Timestamp) * 1000000) / 1000}ms`)
      }
    })
    await page.goto(url)
    // page.removeListener('request', logger);
    await browser.close()
    process.exit()
  } catch (err) {
    console.log(err)
    process.exit()
  }
})()
