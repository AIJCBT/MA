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
        headless: true,
        //args: [`--proxy-server=${proxyServer}`]
        //executablePath: "/usr/bin/chromium-browser"

    });
    const page = await browser.newPage();
    await functions.hide(page)
    await functions.filllogin('https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern%2F', page)
    await functions.cookies(page)
    await client.connect();
    var obj2 = JSON.stringify(await client.db(db).collection("queuevisited").findOne({_id: 2},{projection: {array:1, _id:0}}))
    var string2 = obj2.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','').slice(6)
    var queuevisited = string2.split(",")
    
    var obj1 = JSON.stringify(await client.db(db).collection("profiles").find({}, {projection: {link:1, _id:0}}).toArray());
    var string1 = obj1.replaceAll('\\', '').replaceAll('"', '').replaceAll('[','').replaceAll(']', '').replaceAll('{','').replaceAll('}','').slice(5)
    var array1 = string1.split(",") //the array returned contains "link:" infront of each object
    var visitedprofiles = []
    array1.forEach(value => {visitedprofiles.push(value.slice(5))}) //removing the "link:" substring at each object (value)
    console.log({visitedprofiles})

    var visited = [];
    queuevisited.forEach(value => { //for each value of the visited array from queuevisited a check is done, if the profile is already in the profiles db
        if(visitedprofiles.includes(value)){
        }
        else{
            visited.push(value)
            //console.log(value+" has been added to the queue")
        }                    
    });

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
                page.setDefaultTimeout(2000)//old timeout for vs code shell is 1500
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
    var visitedlength = visited.length;
    visited = [];
    return visitedlength;
}

async function connect(uri, db){
    const url = "mongodb://127.0.0.1:27017/MA" //url for local test db
    const client = new MongoClient(uri)
    var visitedlength = await getdata(client, db)
    do{
        setTimeout(visitedlength = await getdata, 36000000, client, db)
    }while(visitedlength>0)
    await client.close()
}
connect(uri, db)

