const puppeteer = require('puppeteer-extra');
var userAgent = require('user-agents');
const env = require('dotenv').config()

/**@MongoDB code to connect from https://www.mongodb.com/developer/languages/javascript/node-connect-mongodb/ */
const {MongoClient} = require('mongodb');


const email = process.env.email;
const PW = process.env.PW;
const userAgents = process.env.UserAgents;

const stealthplugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
puppeteer.use(stealthplugin())


//const proxyServer = '67.201.33.70';

//START SECTION 0 browser
async function run(url, client){
    const browser = await puppeteer.launch({
        headless: true,
        //args: [`--proxy-server=${proxyServer}`]
    });
    const page = await browser.newPage();

    //START SECTION 1 hide
    //rotating Useragents
    /**@useragents from https://www.useragents.me/ **/
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.3',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.1',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.3',
        'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.',
        'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.3',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Agency/93.8.2357.5',
        'Mozilla/5.0 (Linux; Android 11; moto e20 Build/RONS31.267-94-14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.3'
    ]
    var useragent = userAgents[Math.floor(Math.random()*11)]
    await page.setUserAgent(useragent)
    console.log(useragent)
    
    
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
        if(req.resourceType() == 'stylesheet' || req.resourceType() == 'image'){
            req.abort();
        } else {
            req.continue();
        }
    });*/
    
    await page.evaluateOnNewDocument(() => {
        // Pass webdriver check
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    });
    //END SECTION 1 hide
    
    //START SECTION 2 filllogin
    async function filllogin(url){
        await page.goto(url);
        await page.waitForNetworkIdle()
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

        await page.waitForNetworkIdle();
    }
    //END SECTION 2 filllogin

    await filllogin("https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F")

    //START SECTION 3 consolelogs
    function consolelogs() {
        const { red } = require('colorette');

        page.on('console', message => {
            const type = message.type().substr(0, 3).toUpperCase();

            if (type === 'ERR') {
                console.log(red(`${type} ${message.text()}`));
            }
        })
        .on('pageerror', ({ message }) => console.log(red(message)))
        .on('response', response => console.log(response.status() === 200 ? '' : red(`${response.status()} ${response.url()}`)))
        .on('requestfailed', request => console.log(red(`${request.failure().errorText} ${request.url()}`)));
   }
    //END SECTION 3 consolelogs
    //consolelogs();
    
   //START SECTION 4 cookies
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
    //END SECTION 4 cookies

    //START SECTION 5 bfs
    try{
        await page.setDefaultTimeout(25000)
        var start = "https://connect.garmin.com/modern/profile/a86e429b-46b9-48de-9942-b665b761e049";
        var obj1 = JSON.stringify(await client.db("MA").collection("queuevisited").findOne({_id: 1},{projection: {array:1, _id:0}}))
        var obj2 = JSON.stringify(await client.db("MA").collection("queuevisited").findOne({_id: 2},{projection: {array:1, _id:0}}))
        var string1 = obj1.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','').slice(6)
        var string2 = obj2.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','').slice(6)
        var queue = string1.split(",")
        var visited = string2.split(",")
        console.log({obj1, obj2, string1, string2, queue, visited})
        var profiles = []
        var timestamps = []
        var node; //declare node as a global variable so its accesible in the catch(err){...} block 
        var queuelengthstart = queue.length;
        var botdetected = false;
        function mesuretime (starttime){
            var endtime = performance.now()
            var time = endtime-starttime
            timestamps.push(time)
            var timestampsaverage = (timestamps[timestamps.length-1]+timestamps[timestamps.length-2]+timestamps[timestamps.length-3]+timestamps[timestamps.length-4]+timestamps[timestamps.length-5]+timestamps[timestamps.length-6]+timestamps[timestamps.length-7]+timestamps[timestamps.length-8]+timestamps[timestamps.length-9]+timestamps[timestamps.length-10])/10;
            console.log({timestampsaverage})
            if(timestampsaverage>20000 || timestampsaverage<1000){
                botdetected = true
            }
        }
        //queue.push(start)
        //var sexe, calories
        while(queue.length>0 && botdetected != true){
            var starttime = performance.now()
            try{
                var node = queue.shift()                

                //START SECTION 5.2 node
                //check if profile was not already found
                if(visited.includes(node)){
                    console.log("FROM QUEUE: Profile already found " + node)
                }

                else{
                        
                    //START SECTON 5.2.1 load
                    console.log("ready to go to profile "+node)
                    try{
                        await page.goto(node);
                        await page.waitForSelector("#pageContainer")
                    }
                    catch(err){
                        try{
                                console.log("Navigation Timeout exceeded, RETRY")
                                await page.reload()
                                await page.goto(node);
                                await page.waitForSelector("#pageContainer")
                        }
                        catch(err){
                                console.log("Navigation Timeout exceeded on page go to Node, RETRY FAILED, continue with next node"+ err)
                                mesuretime(starttime)
                                continue
                        }
                    }
                    //END SECTON 5.2.1 load

                    /**@scroll code from https://scrapeops.io/puppeteer-web-scraping-playbook/nodejs-puppeteer-scroll-page/#scrolling-with-mouse*/
                    /*await page.mouse.wheel({
                        deltaY: 2000,
                        delay: 20000
                    });*/

                    
                    //START SECTION 5.2.4 gofriendslist
                    //go to profile's friendslist to find new profiles
                    //await page.goto(`https://connect.garmin.com/modern/connections/connections/${node.slice(58)}`) //-- old method
                    //check if the profile shows contacts, if not, continue with the next node
                    try{
                        await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[4]/a)`)
                    }
                    catch(err){
                        try{
                            //in some cases, the page does not load the link to the contacts properly, so we have to reload the page.
                            //if this either does not work, there may be another problem or the profile simply does not show its contact. In this case, the algorithm proceeds with the next node.
                            console.log("Error to go to click on Contacts, RETRY")
                            await page.reload()
                            await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[4]/a)`)
                        }
                        catch(err){
                            console.log("Looks this profile has either no friends or does not show them @ " + node)
                            mesuretime(starttime)
                            continue
                        }
                    }
                    await page.click(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[4]/a)`)
                    console.log("Go to profile's friendslist: " + node)
                    //END SECTION 5.2.4 gofriendslist

                    //START SECTION 5.2.5 findnew 
                    try{
                        await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div/p/a)`)
                    }
                    catch(err){
                        var errmessage = err.message;
                        if(errmessage.includes('TimeoutError: Waiting for selector `::-p-xpath(//*[@id="pageContainer"]/div/div/p/a)`')){
                            await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[4]/a)`)
                            await page.click(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[4]/a)`)
                        }
                        else{
                            console.log(err)
                        }
                    }
                    var pagecontent = await page.content();
                    //check the number of friends of a profile
                    var profilecountlist = `class="ConnectionList_itemContainer`
                    var regex = new RegExp(profilecountlist, "gi");
                    var count = (pagecontent.match(regex) || []).length;
                    //if the profiles has no friends, don't search for them
                    if (pagecontent.includes("Il semblerait que vos droits d'accès ne soient pas suffisants pour voir ceci.")){
                        console.log("access denied "+node)
                    }
                    else if(count == 0 || count == 1){
                        console.log("The Profile " + node + " has one or no friends")
                    }
                    else{ 
                        var z = 1;
                        do{
                            if(z % 9 == 0){
                                await page.keyboard.press("PageDown", {delay:500})
                                console.log("AT LIST: PageDown")
                            }
                            await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div/div[${z}]/a)`);
                            z++
                        }while(z != count)
                            
                        const elementHandles = await page.$$('a');
                        const propertyJsHandles = await Promise.all(
                            elementHandles.map(handle => handle.getProperty('href'))
                        );
                        const hrefs1 = await Promise.all(
                            propertyJsHandles.map(handle => handle.jsonValue())
                        )
                        const hrefs = hrefs1.filter(element => element.includes("https://connect.garmin.com/modern/profile/"))
                        //console.log(hrefs)
                        console.log("With a length of " + hrefs.length + " profiles (worth as much as gold)!")
                        
                        hrefs.forEach(value => {
                            if(visited.includes(value) || value == "https://connect.garmin.com/modern/profile/baa9b953-5cf4-469f-bde9-c4a109e8a047" || queue.includes(value)){
                                console.log("FROM LIST: profile already found " + value)
                            }
                            else{
                                queue.push(value)
                                //console.log(value+" has been added to the queue")
                            }                    
                        });
                        visited.push(node)
                        console.log("Profiles visited: " + visited.length)
                        console.log("Useful Profiles found: " + profiles.length)
                        console.log("Queue length: " + queue.length)
                        console.log("Ratio profiles, useful profiles: " + profiles.length/visited.length)
                    }
                    //END SECTION 5.2.5 findnew
                }
                //END SECTION 5.2 node
            }
            catch(err){
                console.log(err)
                console.log("FATAL ERROR with Profile: " + node)
                visited.push(node)
                console.log("Profiles visited: " + visited.length)
                console.log("Useful Profiles found: " + profiles.length)
                console.log("Queue length: " + queue.length)
                console.log("Ratio profiles, useful profiles: " + profiles.length/visited.length)
                mesuretime(starttime)
                continue
            }
            mesuretime(starttime)
        }
    }
    
    catch(err){
        console.log(err)
        await page.screenshot({path:'screenshots/screenshoterror.jpg', type: 'jpeg'})  
        console.log({profiles})
        console.log({visited})
        console.log(visited.length) 
        //var pagecontent = await page.content()
        //console.log(pagecontent)    
        console.log("finished!")
    }
    //END SECTION 5 BFS
    await browser.close()
    await client.db("MA").collection("queuevisited").updateOne({_id: 1},{$set: {array: queue}})
    await client.db("MA").collection("queuevisited").updateOne({_id: 2}, {$set: {array: visited}})
}
//END SECTION 0 browser
async function connect(){
    const url = "mongodb://127.0.0.1:27017/MA"
    const uri = "mongodb+srv://nodescript:nodescriptpw@mongodb://127.0.0.1:27017/MA?retryWrites=true&w=majority";
    const client = new MongoClient(url)
    await client.connect()
    await run("https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F", client)
    await client.close()
}
connect()

//run("https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F")

//EXAMPLE FULL PROFILE
/*await page.goto("https://connect.garmin.com/modern/profile/ATPMANU77")
//await page.waitForSelector(".highcharts-series")
//await page.screenshot({path:"screenshots/exampleprofile.jpeg", type:"jpeg", fullPage:"true"})*/


//current record: 4734 Profiles visited, 47641 Profiles in Queue, 1166 useful Profiles found
/*  Issues that need to be fixed:
        -#1 If a profile has no friends at all or does not show the list, the algorithm throws an error
                -> resolved, if you try with this profile as start node: https://connect.garmin.com/modern/profile/e44cf13c-f45e-4922-b1a6-c13427bf9de0
                the algorithm throws the expected error and since there are no more profiles to be added to the queue, the process is stopped

        -#2 Distinction between useful and private profiles!
        -#3 Related to the error at 17.03.24 in the ERR Log
            -> Solved with an try{} and catch{} block and a continue statement
        -#4 When the Queue reaches a certain length (probably more than 72460 and 7836 Profiles were visted), the Algorithm throws Navigation Timeout errors all the time and is not able to go to the friendslist anymore because the link is not shown anymore

    ERR Log:
        17.03.24: Navigation Timeout(25000ms) exceeded. Maybe due to weak internet connexion from my mobile hotspot
                  ->Prevention through try{} and catch{} block


*/


////*[@id="pageContainer"]/div/div[1]/div/div[7]/ul[2]/li[3]/span[2]
////*[@id="pageContainer"]/div/div[1]/div/div[6]/ul[2]/li[3]/span[2]