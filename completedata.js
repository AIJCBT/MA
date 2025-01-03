//save the complete data of the profiles in the db
const puppeteer = require('puppeteer-extra');
var userAgent = require('user-agents');
const env = require('dotenv').config()
const functions = require('./functions.js')
const stealthplugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
const {MongoClient} = require('mongodb');

puppeteer.use(stealthplugin())

const uri = process.env.uri;
const db = process.env.db;



//regroupes all the functions that are needed to extract all the data from one profile
async function completedata(node, client, db, page){
    await page.goto(node)
    var starttime = performance.now()
    try{
        await page.setDefaultTimeout(4000)
        await page.waitForNetworkIdle()

        await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div[2]/div/i)`)
        
        var endtime = performance.now()
        var time = endtime-starttime
        await client.db(db).collection("2profiles2").insertOne({link: node, public: false})
    }
    catch(e){
        await page.setDefaultTimeout(15000)
        
        const getprofile = await functions.datatable(page)
        const getlast12months = await functions.last12months(page)
        const getsubtitle = await functions.subtitle(page)
        
        var endtime = performance.now()
        var time = endtime-starttime

        await client.db(db).collection("2profiles2").insertOne({link: node, public: true, time: time, profile: getprofile, last12months: getlast12months, subtitle: getsubtitle})

        }
}

//extract the data from every public profile
async function browser (client, db, puppeteer, userAgent){
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();

    await functions.hide(page)

    //await functions.filllogin('https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F', page) //for accessing public profiles it is not necessary to be logged in 
    //await functions.cookies(page) //no cookie form displayed if puppeteer is directed directly to a profile without visiting the garmin connect dashboard (part of the login process)

    await client.connect();
    console.log("Client connected")

    //get the data from the db
    var obj2 = JSON.stringify(await client.db(db).collection("profiles").find({public: true},{projection: {link:1, _id:0}}).toArray())
    var string2 = obj2.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','')
    var array2 = string2.split(",")

    var obj1 = JSON.stringify(await client.db(db).collection("2profiles2").find({}, {projection: {link:1, _id:0}}).toArray());
    var string1 = obj1.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','')
    var array1 = string1.split(",")
    var visitedprofiles = []
    array1.forEach(value => {visitedprofiles.push(value.slice(5))}) //removing the "link:" substring at each object (value)

    console.log(array2)


    //use only 5000 profiles at a time
    var nodes = [];
    while(nodes.length<5000 && array2.length > 0){
        var profile = array2.shift().slice(5);
        if(!visitedprofiles.includes(profile)){
            nodes.push(profile)
        }
    }

    //get the data from the 5000 profiles
    while(nodes.length>0){
        var node = nodes.shift()
        console.log(node)
        try{
            await completedata(node, client, db, page)
        }
        catch(err){
            await client.db(db).collection("2profiles2").insertOne({link: node, error: err})
        }
        
    }

    var countdocsprofiles = await client.db(db).collection("profiles").countDocuments({public: true})
    var countdocs2profiles2 = await client.db(db).collection("2profiles2").countDocuments({})

    var docsresting = countdocsprofiles - countdocs2profiles2

    console.log("Browser Closing")
    await browser.close()
    await client.close()

    return docsresting
}

//return the resting documents so the browser function can be looped
async function connect(uri, db, puppeteer, userAgent){ 
    const url = "mongodb://127.0.0.1:27017/MA" //url for local test db
    const client = new MongoClient(uri)
    var docsresting = await browser(client, db, puppeteer, userAgent);
    console.log(docsresting)
    functions.timenow()
    return docsresting
}

//loop the connect/browser function until every public profile from the db is saved
async function repeat(uri, db, puppeteer, userAgent){
    var docsresting = await connect(uri, db, puppeteer, userAgent)
    while(docsresting > 0){
        if(docsresting > 0){
            docsresting = await connect(uri, db, puppeteer, userAgent)
            await new Promise(resolve => setTimeout(resolve, 5*60*60*1000))
        }
        else{
            await client.close()
            break
        }
        console.log("finished!")
    }
}

repeat(uri, db, puppeteer, userAgent)

