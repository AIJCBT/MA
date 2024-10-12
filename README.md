# MA
# Scraping Data From Garmin Connect 
This application scrapes userdata from the social network Garmin Connect. It is written in JavaScript and it uses under other librarys Puppeteer and MongoDB to scrape and save several hundredthousand profiles. It was realised as a part of my Matura thesis.

## Example Garmin Profile
An example of a Garmin Profile may help to imagine what kind of data can be collected with this project. (The image is a screenshot of my own profile)

![Garmin Profile](/screenshots/image.png)


## Deployment
### Download the project and dependencies
Download the project from Git Hub.
Run the following commands to install the dependencies (for yarn use "yarn install")
```bash
  npm i user-agents puppeteer puppeteer-extra puppeteer-extra-plugin-stealth mongodb express dotenv colorette chart.js -g
```
It is recommended to use the versions mentioned in the package.json file.

### Set up a MongoDB 
Then set up a MongoDB with four collections. For the correct function of the programs it is important to name the collections exactly as mentioned: 
- profiles 
- 2profiles2 
- queue
- visited

Keep the MongoDB URI to your DB, the name of your DB and the collection names from above close because you are going to need them later when editing the .env file

### Create a Garmin Connect profile
Then, navigate to [garmin connect](https://sso.garmin.com/portal/sso/en-CH/create-account?clientId=GarminConnect&service=https://connect.garmin.com/modern) if you do not already have an account. 
Keep the link to your account close because you are going to need it later when editing the .env file

### Modify .env file
Here you put in all your environment variables. Modify the file name from "example.env" to ".env". Now you can define your environment variables:

```bash
PW=                 #your Garmin Connect password
email=              #your email for your Garmin profile
uri=                #your MongoDB connection URI
db=                 #the name of your database
ownprofilelink =    #the link to your own Garmin Connect profile
firstnode =         #the first profile you want to use for searching for more profiles 
```

### Run the scripts 
Now you are ready to run the scripts. 
To find profiles run:
```Bash
node index.js
```

For saving the data from each found profile run at first: 
```Bash
node profiledata.js
```
Then wait for at least four hours to run the next script:
```Bash
node completedata.js
```


In my Matura thesis, I analyzed BMI values. That is why the App1 calculates BMI values and average activityclasses and standard deviation, etc. on the following requests:
- localhost:3000/profiles 
- localhost:3000/bmipercentage
Note that the express app is still in development. At the moment, it is not possible to create charts with app1.js or display the results on the express website.
The results are returned in the console where the script is run.
To running this script, use:
```Bash
node App1/app1.js
```

## Important Note
This code was developed for scientific purposes. Do not use the code for other reasons. 
