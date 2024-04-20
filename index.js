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
    const uri = "mongodb+srv://nodescript:nodescriptpw@mongodb://127.0.0.1:27017/MA?retryWrites=true&w=majority";
    const client = await new MongoClient(url)
    await client.connect()
    await functions.browser(puppeteer, userAgent, email, PW, userAgents, client)
    await client.close()
}
connect(puppeteer, userAgent, email, PW, userAgents)