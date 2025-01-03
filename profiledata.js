//prototype for competedata.js
const puppeteer = require('puppeteer-extra');
var userAgent = require('user-agents');
const env = require('dotenv').config()
const functions = require('./functions.js')
//import {hide, filllogin, data} from '.functions.js'
const {MongoClient} = require('mongodb');

const uri = process.env.uri;
const db = process.env.db;

const stealthplugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
puppeteer.use(stealthplugin())

async function getdata(client, db){
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    //functions.consolelogs(page);
    await functions.hide(page)
    await functions.filllogin('https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F', page)
    await functions.cookies(page)
    await client.connect();
    var obj2 = JSON.stringify(await client.db(db).collection("queue").find({},{projection: {link:1, _id:0}}).toArray())
    var string2 = obj2.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','')
    var array2 = string2.split(",")
    var array2length = array2.length;
    
    var obj1 = JSON.stringify(await client.db(db).collection("profiles").find({}, {projection: {link:1, _id:0}}).toArray());
    var string1 = obj1.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','')
    var array1 = string1.split(",")
    var visitedprofiles = []
    array1.forEach(value => {visitedprofiles.push(value.slice(5))}) //removing the "link:" substring at each object (value)
    console.log({visitedprofiles})

    var visited = [];
    while(visited.length<10000 && array2.length > 0 ){
        var profile = array2.shift().slice(5);
        if(!visitedprofiles.includes(profile)){
            visited.push(profile)
        }
    }
    console.log("visited length: "+visited.length)
    var timestamps = [];
    var botdetected = false;
    var streak = 0;
    while(visited.length> 0 && botdetected != true){
        var node = visited.shift()
        console.log("ready to go to profile "+node)
        var starttime = performance.now()
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
                var endtime = performance.now()
                var time = endtime-starttime
                console.log(time)
                streak = 0;
                await client.db(db).collection("profiles").insertOne({link: node, public:undefined, time: time, streak: streak, error: JSON.stringify(err)})
                continue
            }
        }
        try{
            try{
                //check if profile is private 
                page.setDefaultTimeout(3000)//old timeout for vs code shell is 1500
                await page.waitForSelector(`::-p-xpath(//*[@id="pageContainer"]/div/div[2]/div/i)`)
                var endtime = performance.now()
                var time = endtime-starttime
                streak = 0  
                await client.db(db).collection("profiles").insertOne({link: node, public: false, time: time, streak: streak})        
                await page.setDefaultTimeout(10000)
            }catch(err){
                console.log("Profile is public")
                await page.setDefaultTimeout(10000)
                var pagecontent = await page.content();
                /**@pagetext code from https://scrapingant.com/blog/puppeteer-get-all-text */  
                var pagetext = await page.$eval('*', (el)=>el.innerText)
                var statstext = await page.$eval(`::-p-xpath(//*[@id="pageContainer"]/div/div[1])`, (el)=>el.innerText)
                await functions.data(node, client, statstext, streak, db)
                var endtime = performance.now()
                var time = endtime-starttime
                console.log(time)
                await client.db(db).collection("profiles").updateOne({link: node},{$set:{time: time}})
            }
        }
        catch(err){
            //what to do if profile does not show anything or is not official
            console.log(err)
            var endtime = performance.now()
            var time = endtime-starttime
            streak = 0
            await client.db(db).collection("profiles").insertOne({link: node, public: undefined, time: time, streak: 0, error: JSON.stringify(err)})

        }
        

        botdetected = functions.mesuretime(starttime, timestamps, botdetected)
    
    }
    await browser.close()
    functions.timenow()
    visited = [];
    return array2length;
}

async function getDataAndCheck(client, db) {
    const array2length = await getdata(client, db);
    
    while(array2length > 0){    
        if (array2length > 0) {
            const array2length = await getdata(client, db);
            await new Promise(resolve => setTimeout(resolve, 2*60*60*1000))
        } else {
            await client.close();
            break //exit the loop
        }
    }
    console.log("finished!")
}

async function connect(uri, db){ 
    const url = "mongodb://127.0.0.1:27017/MA" //url for local test db
    const client = new MongoClient(uri)
    await getDataAndCheck(client, db);
}
connect(uri, db)

