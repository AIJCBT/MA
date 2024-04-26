const puppeteer = require('puppeteer-extra');
var userAgent = require('user-agents');
const env = require('dotenv').config()
const functions = require('./functions')
const {MongoClient} = require('mongodb');

const email = process.env.email;
const PW = process.env.PW;
const userAgents = process.env.UserAgents;

const stealthplugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
puppeteer.use(stealthplugin())

async function connect(){
    const url = "mongodb://127.0.0.1:27017/MA"
    const uri = String(process.env.uri);
    const client = await new MongoClient(url)
    await client.connect()
    var queue = []
    await functions.browser(puppeteer, userAgent, email, PW, userAgents, client, queue)
    do{
        setTimeout(await functions.browser, 18000000, puppeteer, userAgent, email, PW, userAgents, client, queue)
    }while(queue.length>0)
    await client.close()
}
connect(puppeteer, userAgent, email, PW, userAgents)