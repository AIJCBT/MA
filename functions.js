//document to define and import functions

function mesuretime(starttime, timestamps, botdetected){
    var endtime = performance.now()
    var time = endtime-starttime
    timestamps.push(time)
    var timestampsaverage = (timestamps[timestamps.length-1]+timestamps[timestamps.length-2]+timestamps[timestamps.length-3]+timestamps[timestamps.length-4]+timestamps[timestamps.length-5]+timestamps[timestamps.length-6]+timestamps[timestamps.length-7]+timestamps[timestamps.length-8]+timestamps[timestamps.length-9]+timestamps[timestamps.length-10])/10;
    console.log({timestampsaverage})
    if(timestampsaverage>20000 || timestampsaverage<1000){
        botdetected = true
        console.log(botdetected)
    }
    return botdetected;
}

async function hide(page){
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
    /**@setRequestInterception code from https://scrapeops.io/puppeteer-web-scraping-playbook/nodejs-puppeteer-optimize-puppeteer/ */
    /*await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() === 'stylesheet' || req.resourceType() === 'font' || req.resourceType() === 'image') {
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
}

async function filllogin(url, page){
    //use the String() method to make sure that the retrieved 
    var email = process.env.email;
    var PW = process.env.PW; 

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
    await page.keyboard.type(PW,{ delay: 100 });

    // Click on a 'Login' button
    await page.click(".g__button--contained--large");

    await page.waitForNetworkIdle();
}

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

async function cookies(page){
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
}

/*async function load(){
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
                continue
        }
    }
}

async function pagetext(){
    //START SECTION 5.2.2 pagetext
    try{
        page.setDefaultTimeout(1500)
        await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div[2]/div/i)`)
        //check if profile is private 
    }catch(err){
        console.log("Profile is public")
    }
    page.setDefaultTimeout(20000)
    var pagecontent = await page.content();
    /**@pagetext code from https://scrapingant.com/blog/puppeteer-get-all-text 
    var pagetext = await page.$eval('*', (el)=>el.innerText)
    var statstext = await page.$eval(`::-p-xpath(//*[@id="pageContainer"]/div/div[1])`, (el)=>el.innerText)
    //END SECTION 5.2.2 pagetext
}*/

async function data(node, client, statstext, streak, db){
    //START SECTION 5.2.3 data
    //check if the page's text contains the headings the data concering the gender and the calories
    if(statstext.includes("Sexe") && statstext.includes("Moyenne quotidienne des pas")){ 
        
        //await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[7]/ul[2]/li[6]/span[2])`)
        //var calories = await page.evaluate(name=> name.innerText, await page.$(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[7]/ul[2]/li[6]/span[2])`))
        var posstart = statstext.lastIndexOf("Calories") +8
        var posend = posstart + 11
        var calories = 1*`${statstext.slice(posstart, posend).replace(/\D/g, '')}`

        //define the gender
        if(statstext.includes("Homme")){
            sexe = "Man"
        }
        else if(statstext.includes("Femme")){
            sexe = "Woman"
        }
        else{
            sexe = "Other"
        }

        console.log("Gender: " + sexe)
        console.log("Calories: " + calories)
        streak = streak+1
        await client.db(db).collection("profiles").insertOne({link: node, public: true, sexe: sexe, calories: calories, time: 0, streak: streak})
    }
    else{
        streak = streak +1
        await client.db(db).collection("profiles").insertOne({link: node, public: true, time: 0, streak: streak,  error: "profile is public but does not contain all needed information", time: 0})
    }
    //END SECTION 5.2.3 data
}

/*async function gofriendslist(){
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
            continue
        }
    }
    await page.click(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[4]/a)`)
    console.log("Go to profile's friendslist: " + node)
}*/

async function findnew(page){
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
}

async function node(page){
    if(visited.includes(node)){
        console.log("FROM QUEUE: Profile already found " + node)
    }
    else{
        await load(page)
        await gofriendslist(page)
        await findnew(page)
    }
}

async function bfs(start, page, client, browser, queue, db){
//START SECTION 5 bfs
    try{
        await page.setDefaultTimeout(25000)
        var start = "https://connect.garmin.com/modern/profile/a86e429b-46b9-48de-9942-b665b761e049";
        var obj1 = JSON.stringify(await client.db(db).collection('queuevisited').findOne({_id: 1},{projection: {array:1, _id:0}}))
        var obj2 = JSON.stringify(await client.db(db).collection("queuevisited").findOne({_id: 2},{projection: {array:1, _id:0}}))
        var string1 = await obj1.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','').slice(6)
        var string2 = await obj2.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','').slice(6)
        var queue = await string1.split(",")
        var visited = await string2.split(",")
        console.log({obj1, obj2, string1, string2, queue, visited})
        var timestamps = []
        var node; //declare node as a global variable so its accesible in the catch(err){...} block 
        var queuelengthstart = queue.length;
        var botdetected = false;
        //queue.push(start)
        //var sexe, calories
        while(queue.length>0 && botdetected != true){
            var starttime = performance.now()
            try{
                var node = queue.shift()                
                console.log(botdetected)
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
                                botdetected = mesuretime(starttime, timestamps, botdetected)
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
                            botdetected = mesuretime(starttime, timestamps, botdetected)
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
                        console.log("Queue length: " + queue.length)
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
                console.log("Queue length: " + queue.length)
                botdetected = mesuretime(starttime, timestamps, botdetected)
                continue
            }
            botdetected = mesuretime(starttime, timestamps, botdetected)
        }
        await client.db(db).collection("queuevisited").updateOne({_id: 1},{$set: {array: queue}})
        await client.db(db).collection("queuevisited").updateOne({_id: 2}, {$set: {array: visited}})
    }
    
    catch(err){
        console.log(err)
        await page.screenshot({path:'screenshots/screenshoterror.jpg', type: 'jpeg'})  
        console.log({visited})
        console.log(visited.length) 
        //var pagecontent = await page.content()
        //console.log(pagecontent)    
        console.log("finished!")
    }
    //END SECTION 5 BFS

    return queue
}

function timenow(){
    const time = new Date()
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    console.log(`Started waiting at ${hours}h ${minutes}min ${seconds}s`)
}
async  function browser(puppeteer, userAgent, email, PW, client, queue, db){
        const browser = await puppeteer.launch({
            headless: false,
            //args: [`--proxy-server=${proxyServer}`]
        });
        const page = await browser.newPage();
        await hide(page)
        await filllogin("https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F", page)
        //await consolelogs
        await cookies(page)
        queue = await bfs("https://connect.garmin.com/modern/profile/a86e429b-46b9-48de-9942-b665b761e049", page, client, browser, queue, db)
        await browser.close()
        timenow()
        return queue
}



module.exports = {browser, hide, filllogin, cookies, data, mesuretime, timenow};
