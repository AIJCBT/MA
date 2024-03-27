//document to define and import functions

async function hide(){
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
}

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

async function cookies(){
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

async function checkvisited(){
    //check if profile was not already found
    if(visited.includes(node)){
        console.log("FROM QUEUE: Profile already found " + node)
    }
}

async function load(){
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
    try{
        page.setDefaultTimeout(1500)
        await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div[2]/div/i)`)
        //check if profile is private 
    }catch(err){
        console.log("Profile is public")
    }
    page.setDefaultTimeout(20000)
    var pagecontent = await page.content();
    /**@pagetext code from https://scrapingant.com/blog/puppeteer-get-all-text */  
    var pagetext = await page.$eval('*', (el)=>el.innerText)
    var statstext = await page.$eval(`::-p-xpath(//*[@id="pageContainer"]/div/div[1])`, (el)=>el.innerText)
}

async function data(){
    if(statstext.includes("Sexe") && statstext.includes("Moyenne quotidienne des pas")){ 
        profiles.push(node)
        //await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[7]/ul[2]/li[6]/span[2])`)
        //var calories = await page.evaluate(name=> name.innerText, await page.$(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[7]/ul[2]/li[6]/span[2])`))
        var posstart = statstext.lastIndexOf("Calories") +8
        var posend = posstart + 9
        var calories = statstext.slice(posstart, posend)

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
        
    }
}

async function gofriendslist(){
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
}

async function findnew(){
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

async function node(){
    else{
        await load()
        await pagetext()
        await data()
        await gofriendslist()
        await findnew()

    }
}

async function bfs(start){
    try{
        await page.setDefaultTimeout(25000)
        var queue = []
        var visited = []
        var profiles = []
        var node; //declare node as a global variable so its accesible in the catch(err){...} block 
        var sexe, calories
        queue.push(start)
        while(queue.length>0){
            try{
                var node = queue.shift()
                await checkvisited()
                await node()
            }
            catch(err){
                console.log(err)
                console.log("FATAL ERROR with Profile: " + node)
                visited.push(node)
                console.log("Profiles visited: " + visited.length)
                console.log("Useful Profiles found: " + profiles.length)
                console.log("Queue length: " + queue.length)
                console.log("Ratio profiles, useful profiles: " + profiles.length/visited.length)
                continue
            }
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
}

async  function browser(){
    async function run(){
        const browser = await puppeteer.launch({
            headless: true,
            //args: [`--proxy-server=${proxyServer}`]
        });
        const page = await browser.newPage();
        await hide()
        await filllogin("https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F")
        //await consolelogs
        await cookies()
        await bfs("https://connect.garmin.com/modern/profile/a86e429b-46b9-48de-9942-b665b761e049")
        await browser.close()
    }
}