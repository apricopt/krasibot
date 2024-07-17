const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
require("dotenv").config();

const {sleep, getRandomNumberInRange} = require("./utils")

const {configuration} = require("./config")

async function launchBrowser(url) {
    let args = ["--no-sandbox"];
  
    let browser;
  
    try {
      browser = await puppeteer.launch({
        headless: configuration.headless, // Adjust based on your preference
        ignoreHTTPSErrors: true,
        args,
        slowMo: 250,
        viewport: {
          width: 1200,
          height: 800,
        },
        executablePath: process.env.CHROMIUM_PATH,
      });
    } catch (err) {
      console.log("Launching Err", err.message);
      return;
    }
  
    try {
      const page = await browser.newPage();
  
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      );
  
      await page.setDefaultNavigationTimeout(0);
  
      await page.goto(url, {
        waitUntil: "domcontentloaded",
      });
  
      return { browser, page };
    } catch (err) {
      console.log("FinalError ", err.message);
      await browser.close();
      throw err;
    }
  }

async function grabData() {

    let {browser, page} = await launchBrowser('https://www.spareroom.co.uk/flatshare/mythreads_beta.pl');

    await page.waitForSelector('#onetrust-accept-btn-handler')
    await page.click('#onetrust-accept-btn-handler');


    await sleep(2000);

    await page.waitForSelector('#loginemail');

    await page.type("#loginemail", process.env.email);
    await page.type("#loginpass", process.env.password);

    await page.click('#sign-in-button');


    console.log("🔐 .. Logging in ...")


    await sleep(4000);

    await page.goto('https://www.spareroom.co.uk/flatshare/mylistings.pl');

    console.log("🔶 Renewing ads now...")

   let data =  await page.evaluate(async () => {
    const sleep = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
  };
  
      let liveAdsRaw = document.querySelectorAll('.myListing.live');

      let liveAds = Array.from(liveAdsRaw);
      

      let enabledAdsName = [];

      for(let i = 0; i < liveAds.length; i++) {
        let thisAd = liveAds[i];
        let isRenewable = thisAd.querySelector('[data-renew-available="true"]');
        if(isRenewable) {
          isRenewable.firstElementChild.click();
          await sleep(2000);
          let renewURL = document.querySelector('.myListing-link__confirm-renew').firstElementChild.href;
          document.querySelector('.modal__close').click();
          await sleep(1000)
          let nameOfAd = thisAd.querySelector('h2').innerText;
          enabledAdsName.push({name : nameOfAd, renewURL});
          await sleep(3000);
        }
      }
      
      return enabledAdsName
    })

    //Visiting renewedURL
    for (i = 0; i< data.length; i++) {
     await page.goto(data[i].renewURL)
     await sleep(3000);
    }

    let dataTobeLogged = data.map(el => {
      return {AdName: data.name, status : "✅"}
    })

    
  let currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
    console.log(` 🟢 The below report is generated at ${currentHour}:${currentMinutes} 🟢`)
    console.table(dataTobeLogged)

    console.log("Bye bye 👻")
    await browser.close();

  }


function ExecutionManager() {
  let currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  if(currentHour < 7 || currentHour >= 21) {
    console.log(`🕰️ Current hour is ${currentHour} so won't do anything 😺 `)
    return null
  }else {
    console.log(`😺 Feels like right time to renew ads.... as its ${currentHour}:${currentMinutes} on clock `)
  }

  let delay = getRandomNumberInRange(configuration.renewTimeRange[0] - 60, configuration.renewTimeRange[1] - 60)

  console.log(` 👻 Delaying for ${delay} minutes.. Please hold.`)

  setTimeout(() => {
    grabData();
  }, delay*1000);

}

ExecutionManager();
setInterval(() => {
  ExecutionManager();

}, 60*60*1000)