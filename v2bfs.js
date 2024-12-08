//Gathers the functionality of index.js and completedata.js to do everything in one script
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
const queue = process.env.queue

async function v2browser(uri, puppeteer, queue){
    var repeat = false;
    const browser = await puppeteer.launch({
        headless: false,
    });
    
    const client = new MongoClient(uri)
    await client.connect();
    console.log("Client connected")

    const page = await browser.newPage();

    await functions.hide(page)

    await functions.filllogin('https://sso.garmin.com/portal/sso/de-DE/sign-in?clientId=GarminConnect&service=https%3A%2F%2Fconnect.garmin.com%2Fmodern', page) //for accessing public profiles it is not necessary to be logged in 
    await functions.cookies(page) //no cookie form displayed if puppeteer is directed directly to a profile without visiting the garmin connect dashboard (part of the login process)
    
    await functions.v2bfs(page, client, db)

    var docsresting = await client.db(db).collection(queue).countDocuments();
    if(docsresting>0){
        repeat = true
    }

    await client.close()
    await browser.close()

    return repeat
}

async function repeat(uri, db, puppeteer){
    var again = await v2browser(uri, puppeteer, queue)
    functions.timenow()
    await new Promise(resolve => setTimeout(resolve, 5*60*60*1000))            

    while(again){
        again = await v2browser(uri, db, puppeteer, userAgent)
        functions.timenow()
        await new Promise(resolve => setTimeout(resolve, 5*60*60*1000))            
    }
    console.log("finished!")
}

repeat(uri, db, puppeteer)