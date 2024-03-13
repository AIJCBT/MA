const puppeteer = require('puppeteer');
var userAgent = require('user-agents');
const env = require('dotenv').config()

const email = process.env.email;
const PW = process.env.PW;


//const proxyServer = '67.201.33.70';

async function run(url){
    const browser = await puppeteer.launch({
        headless: true,
        //args: [`--proxy-server=${proxyServer}`]
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
    
    await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 3000 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
    });
    /*await page.setRequestInterception(true);
    page.on('request', (req) => {
        if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
            req.abort();
        } else {
            req.continue();
        }
    });
    */
    await page.evaluateOnNewDocument(() => {
        // Pass webdriver check
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    });

    await page.goto(url);

    const { blue, cyan, green, magenta, red, yellow } = require('colorette')
    page
        .on('console', message => {
        const type = message.type().substr(0, 3).toUpperCase()
        const colors = {
            LOG: text => text,
            ERR: red,
            WAR: yellow,
            INF: cyan
        }
        const color = colors[type] || blue
        console.log(color(`${type} ${message.text()}`))
        })
        .on('pageerror', ({ message }) => console.log(red(message)))
        .on('response', response =>
        console.log(green(`${response.status()} ${response.url()}`)))
        .on('requestfailed', request =>
        console.log(magenta(`${request.failure().errorText} ${request.url()}`)))

    await page.waitForSelector(".signin__form__input")

    //Wait for an element with the id "username" to appear on the page.
    await page.focus("#email");

    // Type a username into the "username" input field with a 100ms delay between key presses.
    await page.keyboard.type(email, { delay: 100 });

    // Wait for an element with the id "password" to appear on the page.
    await page.focus("#password");

    // Type a password into the "password" input field with a 100ms delay between key presses.
    await page.keyboard.type(PW, { delay: 100 });
   
    // Click on a 'Login' button
    await page.click(".g__button--contained--large");
    
    await page.waitForNetworkIdle()


    var linkprofile = "https://connect.garmin.com/modern/connections/connections/a86e429b-46b9-48de-9942-b665b761e049";
        await page.goto(linkprofile)
        console.log("Go to profile")
        var z = 1;
        do{
            if(z % 9 == 0){
                await page.keyboard.press("PageDown", {delay:500})
                console.log("pagedown")
            }
            await page.waitForXpath(`(//*[@id="pageContainer"]/div/div/div[${z}]/a`);
            var [el] = await page.$x(`//*[@id="pageContainer"]/div/div/div[${z}]/a`)
            var json = await el.getProperty("href")
            var link = await json.jsonValue()

            /*var profile = link.substr(58)
            
            if(queue.has(profile)){
                console.log("profile already in queue")
                return
            }
            else{
                queue.push(profile)
                console.log(profile+"has been added to the queue")
            }*/
            console.log(z)
            z++
        }while(z != 25)
    
    getlinks("https://connect.garmin.com/modern/profile/ATPMANU77")
    console.log("finished!")


    //EXAMPLE FULL PROFILE
    /*await page.goto("https://connect.garmin.com/modern/profile/ATPMANU77")
    //await page.waitForSelector(".highcharts-series")
    //await page.screenshot({path:"screenshots/exampleprofile.jpeg", type:"jpeg", fullPage:"true"})*/


    await browser.close()
}

run("https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F")


    
