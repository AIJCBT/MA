const puppeteer = require('puppeteer-extra');
var userAgent = require('user-agents');
const env = require('dotenv').config()

const email = process.env.email;
const PW = process.env.PW;

const stealthplugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(stealthplugin())


//const proxyServer = '67.201.33.70';

async function run(url){
    const browser = await puppeteer.launch({
        headless: false,
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
    
    await page.waitForSelector(".connect-container")

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

        //accept Cookies
        try{
            await page.waitForSelector("#truste-consent-buttons")
            await page.click("#truste-consent-buttons")
            console.log("Cookies accepted")
        }
        catch(err){
            console.log("Cookies were not accepted!")
            console.log({err})
        }


    var start = "https://connect.garmin.com/modern/connections/connections/a86e429b-46b9-48de-9942-b665b761e049";
    var queue = []
    var visited = []
    var profiles = []
    queue.push(start)
    while(queue.length>0){
        var node = queue.shift()
        visited.push(node)

        //check if profile is usable
        //...

        //go to profiles friendslist to find new profiles
        
        //check if profile was not already found
        if(visited.includes(node)){
            console.log("Profile already found")
            return
        }
        else{
            await page.goto(`https://connect.garmin.com/modern/connections/connections/${node.slice(58)}`)
            console.log("Go to profile's friendslist")

            var z = 1;
            do{
                if(z % 9 == 0){
                    await page.keyboard.press("PageDown", {delay:500})
                    console.log("pagedown")
                }            
                await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div/div[${z}]/a)`);
                console.log(z)
                z++
                }while(z != 25)
                
                const elementHandles = await page.$$('a');
                const propertyJsHandles = await Promise.all(
                    elementHandles.map(handle => handle.getProperty('href'))
                );
                const hrefs1 = await Promise.all(
                    propertyJsHandles.map(handle => handle.jsonValue())
                )
                const hrefs = hrefs1.filter(element => element.includes("https://connect.garmin.com/modern/profile/"))
                console.log(hrefs)
                console.log("With a length of " + hrefs.length + " profiles (worth as much as gold)!")
                
                hrefs.array.forEach(element => {
                    if(visited.has(element)){
                        console.log("profile already visited")
                        return
                    }
                    else{
                        queue.push(profile)
                        console.log(profile+"has been added to the queue")
                    }
                });   
            }
        }    
            
    console.log("finished!")
            
    //EXAMPLE FULL PROFILE
    /*await page.goto("https://connect.garmin.com/modern/profile/ATPMANU77")
    //await page.waitForSelector(".highcharts-series")
    //await page.screenshot({path:"screenshots/exampleprofile.jpeg", type:"jpeg", fullPage:"true"})*/


    await browser.close()
}

run("https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F")


    
