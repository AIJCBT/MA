//document to define and export functions

//mesure the time used for one node
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

//hide puppeteer and disguise as human
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
    /**@setRequestInterception code from https://scrapeops.io/puppeteer-web-scraping-playbook/nodejs-puppeteer-optimize-puppeteer/ 
     => the program needs the stylesheets in order to function correctly
    **/
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

//log in into garmin connect
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

//displays errors in red returned in the browser's console 
function consolelogs(page) {
    /**@consolelogs code from: https://stackoverflow.com/questions/47539043/how-to-get-all-console-messages-with-puppeteer-including-errors-csp-violations */
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

//accept Cookies
async function cookies(page){
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

//prototype to retrieve data from a profile
async function data(node, client, statstext, streak, db){
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
}

//find new profiles from friendslist
async function findnew(page, ownprofilelink){
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
    
    //The next 4 lines were generated with help from EcosiaAI
    //check the number of friends of a profile
    var profilecountlist = `class="ConnectionList_itemContainer`
    var regex = new RegExp(profilecountlist, "gi");
    var count = (pagecontent.match(regex) || []).length;

    //if the profiles has no friends, don't search for them
    if (pagecontent.includes("Il semblerait que vos droits d'accès ne soient pas suffisants pour voir ceci.")){  //only works if the app is used with french. If this if does not work, the else if below catches cases with no showed friends
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
        
        //The next 18 lines were generated with help from EcosiaAI 
        const elementHandles = await page.$$('a');
        const propertyJsHandles = await Promise.all(
            elementHandles.map(handle => handle.getProperty('href'))
        );
        const hrefs1 = await Promise.all(
            propertyJsHandles.map(handle => handle.jsonValue())
        )
        const hrefs = hrefs1.filter(element => element.includes("https://connect.garmin.com/modern/profile/"))
        console.log(hrefs.length + " found")
        
        hrefs.forEach(value => {
            if(visited.includes(value) || value == ownprofilelink || queue.includes(value)){
                console.log("FROM LIST: profile already found " + value)
            }
            else{
                queue.push(value)
                //console.log(value+" has been added to the queue")
            }                    
        });
        visited.push(node)
        newVisited.push(node)
        console.log("Profiles visited: " + visited.length)
        console.log("Queue length: " + queue.length)
    }
}

//what to do with every profile (=node)
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

//breadth-first search algorithm is used to find as many profiles as possible
//uses the function node. the function is redifined because of necessary continue statements that can not be used outside of a while loop
async function bfs(page, client, db){
    try{
        await page.setDefaultTimeout(25000)
        var ownprofilelink = process.env.ownprofilelink;
        var firstnode = process.env.firstnode;


        //load docs from db
        var obj1 = JSON.stringify(await client.db(db).collection("queue").find({},{projection: {link:1, _id:0}}).toArray())
        var string1 = obj1.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','')
        var array1 = string1.split(",")
        var queue = [] 
        array1.forEach(value => {queue.push(value.slice(5))}) //removing the "link:" substring at each object (value)

        var obj2 = JSON.stringify(await client.db(db).collection("queue").find({},{projection: {link:1, _id:0}}).toArray())
        var string2 = obj2.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','')
        var array2 = string2.split(",")
        var visited = [] 
        array2.forEach(value => {visited.push(value.slice(5))})

        var QueueDB = queue.slice(0, 8000) //search for friends with 8000 profiles. If the number was bigger than 8000, it would be possible that mongodb throws an error when trying to update the db
        var newQueue = []
        var newVisited = []

        //when the bfs algorithm is launched for the first time, there are no documents in the DB and the first node has to be added manually
        if(visited.length < 1){
            QueueDB.push(firstnode)
        }

        console.log({queue, visited, QueueDB})
        var timestamps = []
        var node; 
        var queuelengthstart = queue.length;
        var botdetected = false;
         
        while(QueueDB.length>0 && botdetected != true){
            var starttime = performance.now()
            try{
                var node = QueueDB.shift()                
                console.log(botdetected)
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
                            visited.push(node)
                            newVisited.push(node)
                            await client.db(db).collection("visited").insertOne({link: node})
                            continue
                    }
                }

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
                        newVisited.push(node)
                        continue
                    }
                }
                await page.click(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[4]/a)`)
                console.log("Go to profile's friendslist: " + node)

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

                //The next 4 lines were generated with help from EcosiaAI
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
                        }
                        await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div/div[${z}]/a)`);
                        z++
                    }while(z != count)
                    
                    //The next 18 lines were generated with help from EcosiaAI 
                    const elementHandles = await page.$$('a');
                    const propertyJsHandles = await Promise.all(
                        elementHandles.map(handle => handle.getProperty('href'))
                    );
                    const hrefs1 = await Promise.all(
                        propertyJsHandles.map(handle => handle.jsonValue())
                    )
                    const hrefs = hrefs1.filter(element => element.includes("https://connect.garmin.com/modern/profile/"))
                    //console.log(hrefs)
                    console.log(hrefs.length + " profiles found")
                    
                    hrefs.forEach(value => {
                        if(visited.includes(value) || value == ownprofilelink || queue.includes(value)){
                        }
                        else{
                            newQueue.push(value)
                            client.db(db).collection("queue").insertOne({link: value})
                            //console.log(value+" has been added to the queue")
                        }                    
                    });
                    visited.push(node)
                    newVisited.push(node)
                    await client.db(db).collection("visited").insertOne({link: node})
                    console.log("Profiles visited: " + visited.length)
                    console.log("Queue length: " + queue.length)
                }
            }
            catch(err){
                console.log(err)
                console.log("FATAL ERROR with Profile: " + node)
                visited.push(node)
                newVisited.push(node)
                await client.db(db).collection("visited").insertOne({link: node})
                console.log("Profiles visited: " + visited.length)
                console.log("Queue length: " + queue.length)
                botdetected = mesuretime(starttime, timestamps, botdetected)
                continue
            }
            botdetected = mesuretime(starttime, timestamps, botdetected)
        }
        //delete the 8000 visited links from the queue in the DB
        await client.db(db).collection("queue").deleteMany({link: { $in: newVisited } })

    }
    catch(err){
        console.log(err)
        await page.screenshot({path:'screenshots/screenshoterror.jpg', type: 'jpeg'})     
        console.log("finished!")
    }
    var queuelength = queue.length;
    queue = []
    visited = []
    var newQueue = []
    var newVisited = []
    return queuelength
}

//get the time to display the starttime of the waitingperiod 
function timenow(){
    const time = new Date()
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    console.log(`Started waiting at ${hours}h ${minutes}min ${seconds}s`)
}

//regroupes all the functions needed for one passage through the 8000 profiles 
async  function browser(puppeteer, userAgent, email, PW, client, db){
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        await hide(page)
        await filllogin("https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F", page)
        //await consolelogs
        await cookies(page)
        await client.connect()
        queuelength = await bfs("https://connect.garmin.com/modern/profile/a86e429b-46b9-48de-9942-b665b761e049", page, client, browser, db)
        await browser.close()
        timenow()
        return queuelength
}

//loop the bfs algorithm with an interval of 5 hours
async function browsertimeout(puppeteer, userAgent, email, PW, client, db) {
    //this function has been developed with the help of EcosiaAI
    const queueLength = await browser(puppeteer, userAgent, email, PW, client, db);
    while(queueLength > 0){
        if (queueLength > 0) {
            const queueLength = await browser(puppeteer, userAgent, email, PW, client, db);
            await new Promise(resolve => setTimeout(resolve, 5*60*60*1000))
        } else {
            await client.close();
            break
        }
        console.log("finished")
    }
}

//before calculating bmi's, convert every value into meters and kg
function convert(value) {
    //this function has been developed with the help of EcosiaAI
    value = JSON.stringify(value)
    // Use regular expressions to extract the numeric part
    const numberMatch = parseFloat(value.match(/[\d.]+/g)[0]);
    // Check if the value is a weight
    if (value.includes("lbs")) {
        // Convert from pounds to kilograms
        return (numberMatch * 0.453592).toFixed(2); // Convert lbs to kg
    } else if (value.includes("kg")) {
        // Return as is (already in kg)
        return numberMatch;
    } else if (value.includes("cm")) {
        // Convert from centimeters to meters
        return (numberMatch / 100).toFixed(2); // Convert cm to m
    } else if (value.includes("'")) {
        // Handle feet and inches
        // Regex to match feet and inches
        const feetRegex = /(\d+)'/; // Matches one or more digits followed by a single quote
        const inchesRegex = /(\d+)\\"/; // Matches one or more digits followed by a double quote at the end of the string
        // Extract feet
        const feetMatch = value.match(feetRegex);
        const inchesMatch = value.match(inchesRegex);

        // Parse feet and inches
        let feet = feetMatch ? parseInt(feetMatch[1]) : 0; // Default to 0 if not found
        let inches = inchesMatch ? parseInt(inchesMatch[1]) : 0; // Default to 0 if not found

        // Convert to meters
        const totalInches = (feet * 12) + inches; // Convert feet to inches and add inches
        const meters = totalInches * 0.0254; // Convert inches to meters
        return meters; 
    } else if (value.includes("m")) {
        // Return as is (already in meters)
        return numberMatch;
    } else {
        console.log(value)
    }
}

//calculate the bmi values
async function bmi(db, query, projectweight, projectheight){
    var weight = await db.collection('2profiles2').find(query, { projection: projectweight}).toArray()
    var height = await db.collection('2profiles2').find(query, { projection: projectheight}).toArray()
    var bmi = []   
    var unrealisticval = []

    for(let i = 0; i<weight.length; i++){
        var value1 = JSON.stringify(weight[i]);
        var value2 = height[i]

        var oneweight =  convert(weight[i]);
        var oneheight = convert(height[i]);

        var onebmi = oneweight/Math.pow(oneheight, 2)
        if(onebmi > 10 && onebmi < 50){
            bmi.push(onebmi)        }
        else{
            unrealisticval.push({
                "Unrealistic Values: ": {
                    "Height:": oneheight,
                    "Weight:": oneweight,
                    "BMI": onebmi
                }

            })
        }
    }
    console.log(unrealisticval)
    console.log(unrealisticval.length)
    return bmi
}

//get the activityclasses from the db
async function activityclass(db, query, projectactivityclass){
    var activityclasses = []
    var activityclassdb = JSON.stringify(await db.collection('2profiles2').find(query, { projection: projectactivityclass}).toArray()).split(",")
    activityclassdb.forEach(el => {
        activityclasses.push(parseInt(el.replace(/\D/g, "")))
    })
    return activityclasses
}

// Function to find all indexes of a specific number in the array
function findindexes(arr, num) {
    // Use the map method to create a new array of indexes
    return arr.map((value, index) => {
        // The 'map' method iterates over each element in the array 'arr'.
        // 'value' is the current element being processed.
        // 'index' is the current index of that element in the array.
        
        // Check if the current element 'value' is equal to the specified number 'num'.
        // If it is, return the current index; otherwise, return -1.
        return value === num ? index : -1;
    })
    // After mapping, we filter out the -1 values to get only the valid indexes
    .filter(index => index !== -1); // Keep only indexes that are not -1

    //Code provided from EcosiaAI
}

//calculate the average activityclass per bmi category
function avactclass(bmi, activityclass, bmiclasses, actclass1, actclass2, actclass3, actclass4, actclass5, actclass6, bmi1, bmi2, bmi3, bmi4, bmi5, bmi6){
    for(var i = 0; i < bmi.length; i++){        
        if (bmi[i] < bmiclasses[0]) {
            bmi1.push(bmi[i]);
            actclass1 += activityclass[i];
        } else if (bmi[i] < bmiclasses[1]) {
            bmi2.push(bmi[i]);
            actclass2 += activityclass[i];
        } else if (bmi[i] < bmiclasses[2]) {
            bmi3.push(bmi[i]);
            actclass3 += activityclass[i];
        } else if (bmi[i] < bmiclasses[3]) {
            bmi4.push(bmi[i]);
            actclass4 += activityclass[i];
        } else if (bmi[i] < bmiclasses[4]) {
            bmi5.push(bmi[i]);
            actclass5 += activityclass[i];
        } else if (bmi[i] > bmiclasses[4]) {
            bmi6.push(bmi[i]);
            actclass6 += activityclass[i];
        } else {
            console.log("error");
        }
    }
    actclass1 = actclass1 / bmi1.length || 0;
    actclass2 = actclass2 / bmi2.length || 0;
    actclass3 = actclass3 / bmi3.length || 0;
    actclass4 = actclass4 / bmi4.length || 0;
    actclass5 = actclass5 / bmi5.length || 0;
    actclass6 = actclass6 / bmi6.length || 0;
    console.log(actclass1, actclass2, actclass3, actclass4, actclass5, actclass6)

}

//associate every average activityclass with a bmi category
function makepairs(bmi, activityclasses){
    var arr1 = findindexes(activityclasses, 1)
    var arr2 = findindexes(activityclasses, 2)
    var arr3 = findindexes(activityclasses, 3)
    var arr4 = findindexes(activityclasses, 4)
    var arr5 = findindexes(activityclasses, 5)
    var arr6 = findindexes(activityclasses, 6)
    var arr7 = findindexes(activityclasses, 7)
    var arr8 = findindexes(activityclasses, 8)
    var arr9 = findindexes(activityclasses, 9)
    var arr10 = findindexes(activityclasses, 10)
    var pairs = [
        avbmiperactivityclass(arr1, bmi), 
        avbmiperactivityclass(arr2, bmi),
        avbmiperactivityclass(arr3, bmi), 
        avbmiperactivityclass(arr4, bmi),
        avbmiperactivityclass(arr5, bmi), 
        avbmiperactivityclass(arr6, bmi),
        avbmiperactivityclass(arr7, bmi), 
        avbmiperactivityclass(arr8, bmi),
        avbmiperactivityclass(arr9, bmi), 
        avbmiperactivityclass(arr10, bmi),
                
    ]
    return pairs
}

//calculate the variance and at the end the standard deviation for the activityclass values in every bmi category
async function variance(av, arr){
    var sum = 0;
    await arr.forEach(el => {
        sum += Math.pow((parseInt(el)-av), 2)
    }) 
    var variance = parseFloat(Math.pow(sum/arr.length, 0.5))
    
    return variance
}

//function belonging to the prototype profiledata.js
async function loaddata(db, req, res, query){
    var avmen = await analyse(db, "Male")
    var avwomen = await analyse(db, "Female")
}

//the three functions below: extract the whole profile information
async function datatable(page){
    //This function was developed with the help of EcosiaAI

    //create a map for every text type on the profile
    try{
        var stats = await page.$$eval(`::-p-xpath(//*[contains(@class, '_statData__')])`, el => {
            return el.map(el => el.innerText)
        });
        var headers = await page.$$eval(`::-p-xpath(//*[contains(@class, '_statLabel__')])`, el => {
            return el.map(el => el.innerText)
        });
    
        var statsheading = await page.$$eval(`::-p-xpath(//*[contains(@class, '_statsHeading__')])`, el => {
            return el.map(el => el.innerText)
        });
        var h5 = await page.$$eval(`::-p-xpath(//*[contains(@class, '_headerWrapper__')])`, el => {
            return el.map(el => el.innerText)
        });
    
        //array prototype to divide the h5 into sections 
        Array.prototype.spliceheaders = function(heading) {
            this.forEach(el=>{
                if (el.includes(heading) && heading !== this[this.length-1]) {
                    var index = this.findIndex(el => el.includes(heading))
                    this.splice(index, 1);
                }
            })
        }  
    
        h5.spliceheaders("Badges")
        h5.spliceheaders("Gear")
        h5.spliceheaders("Recent Favorites")
    
        var pagetext = await page.$eval(`::-p-xpath(//*[@id="pageContainer"]/div/div[1])`, (el)=>el.innerText)
        var lines = pagetext.split('\n') ;
        var posh5 = []
        var posstatsheading = []
        var posheaders = []
        var poslaststat= 0
        var counterh5 = 0
        var counterstatsheading = 0
        var counterheaders = 0
        var counterstats = 0
        
        //associate every text type to a line number
        for(var l =0; l< lines.length; l++){
            switch (true) {
                case h5.includes(lines[l]):
                    posh5.push(l);
                    counterh5++
                    break;
            
                case statsheading.includes(lines[l]):
                    posstatsheading.push(l);
                    counterstatsheading++
                    break;
            
                case headers.includes(lines[l]):
                    posheaders.push(l);
                    counterheaders++
                    break;
            
                case lines[l].includes(stats[stats.length-1]):
                    poslaststat = l;
                    counterstats++
                    break;
            
                default:
                    break
            }
        }

        //define sections for every text type
        var sectionsh5 = []
        for(var i = 0; i < posh5.length-1; i++){
            sectionsh5.push(posh5[i+1]-posh5[i]-1)
        }
    
        var  statsheadingpersection = []
        for(var q = 0; q < h5.length; q++){
            var start = posh5[q]
            var end = posh5[q+1]-1
            var counterstatsheading = 0
            posstatsheading.forEach(el=>{
                if(el > start && el < end){
                    counterstatsheading++
                }
                else{return}
            })
            statsheadingpersection.push(counterstatsheading)
        }
    
        var statsperstatsheading = []
        for(var k = 0; k < statsheading.length; k++){
            var start = posstatsheading[k]
            var end = posstatsheading[k+1]
            if(k+1 >= posstatsheading.length){
                end = poslaststat+1
            }
            counterstats = 0
            for(var o = 0; o < lines.length; o++){ 
                if(o > start && o < end && !posh5.includes(o)){
                    counterstats++
                }
                else{
                    continue
                }
            }
            
            statsperstatsheading.push(counterstats)
        }
        
        //create an object with the profile information
        counterstatsheading = 0
        counterstats = 0
        let profile = {};
    
        for (let t = 0; t < h5.length; t++) {
            profile[h5[t]] = {};
    
            for (let j = 0; j < statsheadingpersection[t]; j++) {
                profile[h5[t]][statsheading[counterstatsheading]] = {};
    
                for (let u = 0; u < statsperstatsheading[counterstatsheading]; u++) {
                    profile[h5[t]][statsheading[counterstatsheading]][headers[counterstats]] = stats[counterstats];
                    counterstats++;
                }
    
                counterstatsheading++;
            }
        }
    
        // Convert the JavaScript object to a JSON string
        const mongodbprofile = JSON.stringify(profile);
        return profile
    }
    catch(err){
        return err
    }
}

//extract the data from the last 12 months table 
async function last12months(page){
    //this function was developed with the help of EcosiaAI

    //create maps for the blockdata and blocklabels
    try{
        page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div[2]/div/div[2]/div[1])`)

        var allblockdata = await page.$$eval(`::-p-xpath(//*[starts-with(@class, 'DataBlock_dataField__')])`, el => {
            return el.map(el => el.innerText)
        });
        
        var allblocklabel = await page.$$eval(`::-p-xpath(//*[starts-with(@class, 'DataBlock_dataLabel__')])`, el => {
            return el.map(el => el.innerText)
        });

        var blockdata = allblockdata.splice(0, 4)
        var blocklabel = allblocklabel.splice(0, 4)

        //define an object with the retrieved data
        var last12months = {}
        last12months[blocklabel[0]]=blockdata[0]
        last12months[blocklabel[1]]=blockdata[1]
        last12months[blocklabel[2]]=blockdata[2]
        last12months[blocklabel[3]]=blockdata[3]
        last12months = JSON.stringify(last12months)
        return last12months
    }
    catch(err){
        return err
    }
}

//get the subtitle in the profile image which is often a location (this could be interesting for analysis)
async function subtitle(page){
    try{            
        page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[1]/div[1]/div[2]/span[2])`)
        var subtitle = await page.$eval(`::-p-xpath(//*[@id="pageContainer"]/div/div[1]/div/div[1]/div[1]/div[2]/span[2])`, (el)=>el.innerText);
        return subtitle
    }
    catch(err){
        return err
    }
}

//export all the defined functions
module.exports = {browser, hide, filllogin, cookies, data, mesuretime, timenow, consolelogs, browsertimeout, bmi, activityclass, loaddata, variance, datatable, last12months, subtitle, makepairs, avactclass};
