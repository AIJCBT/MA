const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const env = require('dotenv')
const functions = require("../functions");
const path = require('path')
const fs = require('fs')
const variables = require('./public/variables')

const app1 = express();
const PORT = 3000;


// Connection URL and Database Name
var envpath = path.resolve(__dirname, '..', '.env')
env.config({path: envpath})
const uri = process.env.uri;
const dbName = process.env.db;

app1.use(express.static(path.join(__dirname, '/public')))

app1.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Connect to MongoDB
MongoClient.connect(uri)
    .then((client) => {
      const db = client.db(dbName);
      
            
    console.log('Connected to MongoDB');

    // Define your routes and middleware here
    app1.get('/profiles', async (req, res) => {
      //Load the data from MongoDB
      const avmen = await functions.analyse(db, "Man")
      const avwomen = await functions.analyse(db, "Woman")

      const chartData = await variables.getChartData(avmen, avwomen);
      const chartOptions = await variables.getChartOptions();
      
      // Generate chartScript using chartData and chartOptions
      const chartScript = await variables.getChartScript(chartData, chartOptions);
      
      //Read html file
      const htmlapp1 = await fs.readFileSync('public/app1.html', 'utf8');

      //Modify html
      const modifiedhtml = await htmlapp1.replace(` <script id="script"></script>`, chartScript)

      //send the modified html as response
      res.send(modifiedhtml)
    })
}); 
