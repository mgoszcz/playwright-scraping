const playwright = require('playwright');
const randomUserAgent = require('random-useragent');
const fs = require('fs')

const BASE_URL='https://github.com/topics/playwright';

;(async () => {
  // Create random agent
  const agent = randomUserAgent.getRandom()
  // Setup browser
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext( {userAgent: agent} );
  const page = await context.newPage( {bypassCSP: true} );
  await page.setDefaultTimeout(30000);
  await page.setViewportSize({ width: 800, height: 600})
  await page.goto(BASE_URL);
  // Get data from website
  // It will get all elements of this type from page and call a callback on each
  const repositories = page.$$eval("article.border", (repoCards) => {
    return repoCards.map((card) => {
      const [user, repo] = card.querySelectorAll('h3, a')

      const formatText = (element) => element && element.innerText.trim()

      return {
        user: formatText(user),
        repo: formatText(repo),
        url: repo.href,
      }
    })
  })


  // Store data in file
  const logger = fs.createWriteStream('data.txt', {flag: 'w'})
  logger.write(JSON.stringify(repositories, null ,' '))

  // Close browser
  await browser.close()

})().catch(error => {
  console.log(error)
  process.exit(1)
});