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
 * --resource: css | js | total
 */
const options = argv2option()
const url = getArgOption(options, '--url', 'https://www.google.co.jp')
const device = getArgOption(options, '--device', 'pc')
const resource = getArgOption(options, '--resource', 'css')

const ua = device === 'pc' ? UA_CHROME : UA_CHROME_MOBILE
const vp = device === 'pc' ? VIEWPORT_PC_DEFAULT : VIEWPORT_SP_DEFAULT
;(async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport(vp)
    await page.setUserAgent(ua)
    await Promise.all([
      page.coverage.startJSCoverage(),
      page.coverage.startCSSCoverage()
    ])
    await page.goto(url)
    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage()
    ])
    let totalBytes = 0
    let totalUsedBytes = 0
    // const coverage = [...jsCoverage, ...cssCoverage]
    const coverage =
      resource === 'total'
        ? [...cssCoverage, ...jsCoverage]
        : resource === 'js'
        ? jsCoverage
        : cssCoverage
    for (const entry of coverage) {
      const fileByte = entry.text.length
      const filePath = entry.url.replace(/\?(.+?)*/, '')
      totalBytes += entry.text.length
      const fileUsedByte = entry.ranges.reduce((used, range) => {
        return used + range.end - range.start - 1
      }, 0)
      totalUsedBytes += fileUsedByte
      console.log(
        `${(fileUsedByte / fileByte) *
          100}% -> ${fileUsedByte} / ${fileByte}bytes: ${filePath}`
      )
    }
    console.log(
      `${resource.toUpperCase()} Resource Coverage: ${(totalUsedBytes /
        totalBytes) *
        100}%`
    )
    process.exit()
  } catch (err) {
    console.log(err)
    process.exit()
  }
})()
