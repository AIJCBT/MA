//do first calculations with the db data from the public profiles
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


//The structure of the request handling has been developed with the help of EcosiaAI
// Connect to MongoDB
MongoClient.connect(uri)
    .then((client) => {
        const db = client.db(dbName);
      
            
        console.log('Connected to MongoDB');

        // Define your routes and middleware here
        app1.get('/profiles', async (req, res) => {
            //Load the data from MongoDB
            const query = {"profile.Profile.Fitness.Activity Class": {$exists: true}, "profile.Profile.Fitness.Weight": {$exists: true}, "profile.Profile.Fitness.Height":{$exists: true}};
            const projectheight = {"profile.Profile.Fitness.Height": 1, _id: 0}
            const projectweight = {"profile.Profile.Fitness.Weight": 1, _id: 0}
            const projectactivityclass= {"profile.Profile.Fitness.Activity Class": 1, _id: 0}

            const bmi = await functions.bmi(db, query, projectweight, projectheight)
            const activityclass = await functions.activityclass(db, query, projectactivityclass)
            const totaldocs = await db.collection('2profiles2').countDocuments(query)

            activityclass.forEach(async(el) => {
                if(el > 10){
                    function findactclass(element){
                        return element > 10
                    }
                    var pos = activityclass.findIndex(findactclass)
                    if(pos !== -1){
                        activityclass.splice(pos, 1)
                        bmi.splice(pos, 1)
                    }
                    var log = JSON.stringify(await db.collection("2profiles2").findOne({"profile.Profile.Fitness.Activity Class": `${el}`}, {projection: {link: 1, _id:0}}))
                    console.log("Profile that has an activityclass higher than 10: " + log)
                }
            })

            var actclass1 = 0
            var actclass2 = 0
            var actclass3 = 0
            var actclass4 = 0
            var actclass5 = 0
            var actclass6 = 0

            var variactcl1 = []
            var variactcl2 = []
            var variactcl3 = []
            var variactcl4 = []
            var variactcl5 = []
            var variactcl6 = []
            
            var bmi1 = []
            var bmi2 = []
            var bmi3 = []
            var bmi4 = []
            var bmi5 = []
            var bmi6 = []
            
            const bmiclasses = [18.5, 25, 30, 35, 40]

            for(var i = 0; i < bmi.length; i++){        
                if (bmi[i] < bmiclasses[0]) {
                    bmi1.push(bmi[i]);
                    actclass1 += activityclass[i];
                    variactcl1.push(activityclass[i])
                } else if (bmi[i] < bmiclasses[1]) {
                    bmi2.push(bmi[i]);
                    actclass2 += activityclass[i];
                    variactcl2.push(activityclass[i])
                } else if (bmi[i] < bmiclasses[2]) {
                    bmi3.push(bmi[i]);
                    variactcl3.push(activityclass[i])
                    actclass3 += activityclass[i];
                } else if (bmi[i] < bmiclasses[3]) {
                    bmi4.push(bmi[i]);
                    actclass4 += activityclass[i];
                    variactcl4.push(activityclass[i])
                } else if (bmi[i] < bmiclasses[4]) {
                    bmi5.push(bmi[i]);
                    actclass5 += activityclass[i];
                    variactcl5.push(activityclass[i])
                } else if (bmi[i] > bmiclasses[4]) {
                    bmi6.push(bmi[i]);
                    actclass6 += activityclass[i];
                    variactcl6.push(activityclass[i])
                } else {
                    console.log("error");
                }
            }
            actclass1 = (actclass1 / bmi1.length).toFixed(2) || 0;
            actclass2 = (actclass2 / bmi2.length).toFixed(2) || 0;
            actclass3 = (actclass3 / bmi3.length).toFixed(2) || 0;
            actclass4 = (actclass4 / bmi4.length).toFixed(2) || 0;
            actclass5 = (actclass5 / bmi5.length).toFixed(2) || 0;
            actclass6 = (actclass6 / bmi6.length).toFixed(2) || 0;

            var variactcl1 = await functions.variance(actclass1, variactcl1)
            var variactcl2 = await functions.variance(actclass2, variactcl2)
            var variactcl3 = await functions.variance(actclass3, variactcl3)
            var variactcl4 = await functions.variance(actclass4, variactcl4)
            var variactcl5 = await functions.variance(actclass5, variactcl5)
            var variactcl6 = await functions.variance(actclass6, variactcl6)

            var connecttotalpercent = ((bmi1.length + bmi3.length + bmi4.length + bmi5.length + bmi6.length) *100/totaldocs).toFixed(1)

            const result = {
                "BMI <18.5": {
                    "Average Activityclass": actclass1,
                    "Nb of Docs": bmi1.length,
                    "Variance": variactcl1
                },
                "BMI 18.5-24.9": {
                    "Average Activityclass": actclass2,
                    "Nb of Docs": bmi2.length,
                    "Variance": variactcl2
                },
                "BMI 25-29.9": {
                    "Average Activityclass": actclass3,
                    "Nb of Docs": bmi3.length,
                    "Variance": variactcl3
                },
                "BMI 30-34.9": {
                    "Average Activityclass": actclass4,
                    "Nb of Docs": bmi4.length,
                    "Variance": variactcl4
                },
                "BMI 35-39.9": {
                    "Average Activityclass": actclass5,
                    "Nb of Docs": bmi5.length,
                    "Variance": variactcl5
                },
                "BMI >40": {
                    "Average Activityclass": actclass6,
                    "Nb of Docs": bmi6.length,
                    "Variance": variactcl6
                }
            }
            console.log(result)

            const chartbmi = {
                labels : ["<18.5", "18.5-24.9", "25-29.9", "30-34.9", "35-39.9", ">40"],   
                datasets : [
                    {
                        fillColor : "#029171",
                        strokeColor : "#002C22",
                        pointColor : "#00634D",
                        pointStrokeColor : "#fff",
                        data : [bmi1.length, bmi2.length, bmi3.length, bmi4.length, bmi5.length, bmi6.length],
                    }
                ]
            }
            
            const chartactclass = {
                labels : ["<18.5", "18.5-24.9", "25-29.9", "30-34.9", "35-39.9", ">40"],   
                yBegin : 0,
                yEnd: 10,
                datasets : [
                    {
                        fillColor : "#029171",
                        strokeColor : "#002C22",
                        pointColor : "#00634D",
                        pointStrokeColor : "#fff",
                        drawMathDeviation: "stddev",
                        sttddv: [variactcl1, variactcl2, variactcl3, variactcl3, variactcl4, variactcl5, variactcl6],
                        deviationStrokeColor: "#000",
                        deviationWidth: 5,
                        data : [actclass1, actclass2, actclass3, actclass4, actclass5, actclass6],
                    }
                ]
            }
            
            const chartnbdocsbmiclass = {
                labels : ["Garmin Connect", "Studie The Lancet"],   
                yBegin : 0,
                yEnd: 10,
                datasets : [
                    {
                        fillColor : "#029171",
                        strokeColor : "#002C22",
                        pointColor : "#00634D",
                        pointStrokeColor : "#fff",
                        deviationStrokeColor: "#000",
                        deviationWidth: 5,
                        data : [connecttotalpercent, 67.1]
                    }
                ]
            }
            
            //Read html file
            const htmlapp1 = await fs.readFileSync('public\\app1.html', 'utf8');

            //Modify html
            const modifiedhtml = await htmlapp1
                        .replace(`"bmichart replace this"`, JSON.stringify(chartbmi))
                        .replace(`"actclasschart replace this"`, JSON.stringify(chartactclass))
                        .replace(`"replace nbdocsbmiclass"`, JSON.stringify(chartnbdocsbmiclass))
                        .replace(`"replace bminbdocs"`, [bmi1.length, bmi2.length, bmi3.length, bmi4.length, bmi5.length, bmi6.length])
                        .replace(`"replace avactclass"`, [actclass1, actclass2, actclass3, actclass4, actclass5, actclass6])
                        .replace(`"replace stddevactclass"`, [variactcl1, variactcl2, variactcl3, variactcl3, variactcl4, variactcl5, variactcl6])
                        .replace(`"replace connecttotal"`, connecttotalpercent)


            //send the modified html as response
            res.send(modifiedhtml)
        })
        app1.get('/bmipercentage', async (req, res) => {
            const db = client.db(dbName)

            const query = {"profile.Profile.Fitness.Weight": {$exists: true}, "profile.Profile.Fitness.Height":{$exists: true}};
            const projectheight = {"profile.Profile.Fitness.Height": 1, _id: 0}
            const projectweight = {"profile.Profile.Fitness.Weight": 1, _id: 0}
    
            const bmi = await functions.bmi(db, query, projectweight, projectheight)
            
            var bmi1 = []
            var bmi2 = []
            var bmi3 = []
            var bmi4 = []
            
            const bmiclasses = [18.5, 25, 30]
    
            for(var i = 0; i < bmi.length; i++){        
                if (bmi[i] < bmiclasses[0]) {
                    bmi1.push(bmi[i]);
                } else if (bmi[i] < bmiclasses[1]) {
                    bmi2.push(bmi[i]);
                } else if (bmi[i] < bmiclasses[2]) {
                    bmi3.push(bmi[i]);
                } else if (bmi[i] > bmiclasses[2]) {
                    bmi4.push(bmi[i]);
                } else {
                    console.log("error");
                }
            }
            const result = {
                "BMI <18.5": {
                    "Nb of Docs": bmi1.length
                },
                "BMI 18.5-24.9": {
                    "Nb of Docs": bmi2.length,
                },
                "BMI 25-29.9": {
                    "Nb of Docs": bmi3.length,
                },
                "BMI >30": {
                    "Nb of Docs": bmi4.length,
                }
            }
            console.log(result)    
        } 
    )}) 

