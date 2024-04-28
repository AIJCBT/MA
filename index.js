const puppeteer = require('puppeteer-extra');
var userAgent = require('user-agents');
const env = require('dotenv').config()
const functions = require('./functions')
const {MongoClient} = require('mongodb');

const email = process.env.email;
const PW = process.env.PW;
const uri = process.env.uri;
const db = process.env.db;

const stealthplugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
puppeteer.use(stealthplugin())
console.log(uri, typeof uri)

async function connect(puppeteer, userAgent, email, PW, uri, db){
    const url = "mongodb://127.0.0.1:27017/MA"
    const client = await new MongoClient(uri)
    await client.connect()
    var queue = []
    await functions.browser(puppeteer, userAgent, email, PW, client, queue, db)
    do{
        setTimeout(await functions.browser, 18000000, puppeteer, userAgent, email, PW, client, queue, db)
    }while(queue.length>0)
    await client.close()
}
connect(puppeteer, userAgent, email, PW, uri, db)