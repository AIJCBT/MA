const puppeteer = require('puppeteer');
var userAgent = require('user-agents');
const env = require('dotenv').config()

const email = process.env.email;
const PW = process.env.PW;


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
    await page.screenshot({path: "screenshots/screenshot.jpeg", type:"jpeg"});

    //Wait for an element with the id "username" to appear on the page.
    await page.focus("#email");

    // Type a username into the "username" input field with a 100ms delay between key presses.
    await page.keyboard.type(email, { delay: 100 });

    // Wait for an element with the id "password" to appear on the page.
    await page.focus("#password");

    // Type a password into the "password" input field with a 100ms delay between key presses.
    await page.keyboard.type(PW, { delay: 100 });
   
    await page.screenshot({path:"screenshots/loginfilledout.jpeg", type: "jpeg"})

    // Click on a 'Login' button
    await page.click(".g__button--contained--large");
    
    await page.waitForSelector(".connect-container")
    await page.screenshot({path:"screenshots/Dashboard.jpeg", type:"jpeg"})

    //await page.click("#truste-consent-button")

    /*await page.goto("https://connect.garmin.com/modern/connections/search")
    const pageSourceHTML = await page.content();
    console.log(pageSourceHTML)
    
    //div[class*=SearchInput_searchInput]
    await page.waitForSelector("div[class*=SearchInput_searchInput]")
    await page.focus("div[class*=SearchInput_searchInput]")
    await page.keyboard.type("aa", {delay:100})
    await page.keyboard.press("Enter")

    //await page.waitForNetworkIdle()
    await page.waitForTimeout(3000)
    await page.screenshot({path: "screenshots/resultcontacts.jpeg", type:"jpeg", fullPage:"true"})


    ////*[@id="pageContainer"]/div[2]/div[1]/div/div/div[2]/a
    ////*[@id='pageContainer']/div[2]/div[1]/div/div/div[2]/a
    ////*[@id='pageContainer']/div[2]/div[1]/div/div/div[3]/a
    var arrprofiles = []
    for (let a = 2; a < 31; a++){
        var [el] = await page.$x(`//*[@id='pageContainer']/div[2]/div[1]/div/div/div[${a}]/a`)
        var pty = await el.getProperty("href")
        var profile = await pty.jsonValue()
        arrprofiles.push(profile)
        await page.focus("#pageContainer")
        await page.keyboard.press("Space", {delay:500})
        console.log(a)
    }
    console.log(arrprofiles)
    /*async function gotoprofile(url){
        await browser.newPage()
        await page.goto(url)
        await page.waitForNetworkIdle()
        await page.screenshot({path:`screenshots/profiles/${i}.jpeg`, type:"jpeg"})

    }
    for(let i = 0; i<=arrprofiles.length; i++){
        gotoprofile(arrprofiles[i])
        console.log(i)
    }*/
    await page.setDefaultTimeout(60000)
    var xyz = 5;    
    await page.goto("https://connect.garmin.com/modern/connections/connections/ae8963df-c8e3-4932-84b7-761a38692185")
       do{
            if(xyz % 5 == 0){
                await page.keyboard.press("PageDown", {delay:500})
                console.log("pagedown")
            }
            await page.waitForXPath(`//*[@id="pageContainer"]/div/div/div[${xyz}]/a`)
            var [el] = await page.$x(`//*[@id="pageContainer"]/div/div/div[${xyz}]/a`)
            var json = await el.getProperty("href")
            var text = await json.jsonValue()
            console.log(text)
            console.log(xyz)
            xyz++
            if(xyz == 25){
                await page.screenshot({path:"screenshots/errorcontacts.jpeg", fullPage:"true", type:"jpeg"})        
            }
        }
        while(page.waitForXPath(`//*[@id="pageContainer"]/div/div/div[264]`))
    
    console.log("finished!")


    //EXAMPLE FULL PROFILE
    /*await page.goto("https://connect.garmin.com/modern/profile/ATPMANU77")
    //await page.waitForSelector(".highcharts-series")
    //await page.screenshot({path:"screenshots/exampleprofile.jpeg", type:"jpeg", fullPage:"true"})*/


    await browser.close()
}

run("https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F")

    /*
    const [el1] = await page.$$('iframe');
    const input1 = el1.getProperty("id")
    const id1 = await (await input1).jsonValue()
    console.log(id1)
    await page.click(`#${id1}`);
    console.log("CLICK")

    await page.waitForTimeout(10000);
    await page.screenshot({path: "screenshots/screenshot2.jpeg", type:"jpeg", fullPage: "true"});
    await page.waitForTimeout(10000);
    await page.screenshot({path: "screenshots/screenshot3.jpeg", type:"jpeg", fullPage: "true"});

    const pageSourceHTML11 = await page.content();
    console.log(pageSourceHTML11)

    const [el11] = await page.$$('iframe');
    const input11 = el11.getProperty("id")
    const id11 = await (await input11).jsonValue()
    console.log(id11)
    await page.click(`#${id11}`);
    console.log("CLICK")


    await page.waitForTimeout(10000);
    await page.screenshot({path: "screenshots/screenshot11.jpeg", type:"jpeg", fullPage: "true"});
    await page.waitForTimeout(10000);
    await page.screenshot({path: "screenshots/screenshot21.jpeg", type:"jpeg", fullPage: "true"});
    await page.waitForTimeout(10000);
    await page.screenshot({path: "screenshots/screenshot31.jpeg", type:"jpeg", fullPage: "true"});
    */

    //id input email: #email
    //id input password: #password
    //class input remember: signin__form__input--remember
    //class button submit: g__button--contained--large

       // Wait for an element with the class "col-md-4" to appear on the page.
       //await page.waitForSelector(".validation-form signin__form");
       

    //Get profiles by group
    /*await page.goto("https://connect.garmin.com/modern/groups")

    await page.waitForTimeout(5000)
    await page.screenshot({path:"screenshots/groups.jpeg", type:"jpeg"})

    await page.click(".Button_btn__v_uhJ")



    await page.focus(".SearchInput_longInput__2h0q7")
    await page.keyboard.type("aaa", {delay: 150})
    await page.focus(".SearchInput_longInput__2h0q7")
    await page.click(".")

    await page.waitForSelector(".GroupItem_labelGroupName__2yzKy")
    await page.screenshot({path:"screenshots/groupssearchresult.jpeg", type:"jpeg"})*/
    
    /*        
    var [el1] = await page.$x(`//*[@id='pageContainer']/div[2]/div[1]/div/div/div[${a}]/a`)
    var pty1 = await el1.getProperty("href")
    var profile = await pty1.jsonValue()

            await browser.newPage()
        await page.goto(profile)
    
        var prfnb = i-1;
        await pages[prfnb].waitForSelector(".content.page.profile")
        await pages[prfnb].screenshot({path:`screenshots/profiles/profile${prfnb}.jpeg`, fullPage:"true"})*/

    
