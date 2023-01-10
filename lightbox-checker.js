const schedule = require('node-schedule');
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const prompt = require('prompt-sync')();

let dayOfWeek;
let month;
let dayOfMonth;
let hour;
let minute;
let date;
let time;

// Asks user for the date/time to run the test at
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

    try {
      // Initialize Puppeteer, loads the page, and causes the lightbox to appear
      const browser = await puppeteer.launch({ headless: true });
      const context = await browser.createIncognitoBrowserContext();
      const page = await context.newPage();
      await page.goto(*** ENTER URL HERE ***);
      await page.hover("#body")

      // Gives page & lightbox some time to load
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
        user: *** ENTER EMAIL HERE ***,
        pass: *** ENTER EMAIL PASSWORD HERE ***
      }
    });

    var mailOptions = {
      from: *** ENTER EMAIL HERE ***,
      to: *** ENTER EMAIL HERE ***,
      subject: *** ENTER EMAIL SUBJECT LINE HERE ***,
      text:  *** ENTER EMAIL BODY TEXT HERE ***
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  })();
});
