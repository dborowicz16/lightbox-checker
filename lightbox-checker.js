const schedule = require('node-schedule');
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const prompt = require('prompt-sync')();


/* 

*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL) 

*/

let dayOfWeek;
let month;
let dayOfMonth;
let hour;
let minute;
let date;
let time;

function setTimer() {
  date = prompt('What date would you like the test to run? (Ex: 03/24/2023) - ')
  const day = new Date(date)
  dayOfWeek = day.getDay()
  month = date.substring(0, 2)
  dayOfMonth = date.substring(3, 5)

  time = prompt('What time do you want the test to run? (Ex: 4:15pm or 11:32am) - ')

  if (time.charAt(time.length - 2) === 'a') {
    if (time.substring(0, 2).includes(':')) {
      hour = time.charAt(0)
    }
    else {
      hour = time.substring(0, 2)
    }

    minute = time.slice(-4, -2)
  }
  else if (time.charAt(time.length - 2) === 'p') {
    if (time.substring(0, 2).includes(':')) {
      hour = parseInt(time.charAt(0)) + 12
    }
    else if (time.substring(0, 2) === '12') {
      hour = time.substring(0, 2)
    }
    else {
      hour = parseInt(time.substring(0, 2)) + 12
    }

    minute = time.slice(-4, -2)
  }

  const confirmation = prompt('You said that you want the test to run at ' + time + ' on ' + date + ' is this correct? Enter yes or no - ')

  if (confirmation.toLowerCase() === 'yes') {
    console.log('Okay! An email containing the results will be sent out as soon as the test is complete!')
  }
  else if (confirmation.toLowerCase() === 'no') {
    setTimer()
  }
  else {
    console.log('You must enter yes or no!')
    setTimer()
  }
}
setTimer()

const job = schedule.scheduleJob(`${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`, function () {
  (async () => {



    let lightboxImageURL;
    const url1 = ***URL HERE***;
    const url2 = ***URL HERE***;

    try {
      // Initialize Puppeteer, loads the page, and causes the lightbox to appear
      const browser = await puppeteer.launch({ headless: true });
      const context = await browser.createIncognitoBrowserContext();
      const page = await context.newPage();
      await page.goto(`${url1}`);
      await page.hover("#body")
      await page.waitForTimeout(10000);
      await page.goto(`${url2}`);
      await page.hover("#body")
      await page.waitForTimeout(10000);

      // Convert the nodelist of images returned from the dom into an array, then map each item and get the src attribute value, and store it in 'srcs' variable, which is therefore returned to be the value of 'issueSrcs' variable.
      const issueSrcs = await page.evaluate(() => {
        const srcs = Array.from(
          document.querySelectorAll("#body > div.overlay.block > div > div > div.lightbox_set_content > a > img")
        ).map((image) => image.getAttribute("src"));
        return srcs;
      });

      // Gets lightbox image src in a var for later use and closes browser
      lightboxImageURL = issueSrcs;
      await context.close();
      await browser.close();
    } catch (error) {
      console.log(error);
    }

    // Send email
    var transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: ***SENDER EMAIL***,
        pass: ***SENDER PASSWROD***
      }
    });

    var mailOptions = {
      from: ***SENDER EMAIL***,
      to: ***RECEIPIENT EMAIL***,
      // to: 'ashley@dig.solutions, davidb@dig.solutions, kristin@dig.solutions, jordan@dig.solutions',
      subject: lightboxImageURL.length === 0 ? 'ATTENTION: JFJ LIGHTBOX IS DOWN!' : 'JFJ LIGHTBOX REPORT',
      text: lightboxImageURL.length !== 0 ? `A JFJ lightbox test was ran at ${time} on ${date}. \n\nTo get to the lightbox the bot went to ${url1} and then it went to ${url2} where the lightbox appeared. \n\nThe lightbox image is currently: ${JSON.stringify(lightboxImageURL)}. \n\nEverything seems to be running smoothly but it never hurts to double check!` : `A JFJ lightbox test was ran at ${time} on ${date}. \n\nThe bot attempted to go to ${url1} and then ${url2} \n\nThe lightbox is down! Have someone fix the lightbox immediately!`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent!');
      }
    });
  })();
});
