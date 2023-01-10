# lightbox-checker
A tool to check to see if a lightbox is operational or not and sends an email to whomever is designated. This was created as an automation solution for a client at my job

## How To Use
This repo will not work if your device is asleep. If on macOS, download the app <a href="https://apps.apple.com/us/app/amphetamine/id937984704?mt=12">Amphetamine<a/> from the app store! Once this is resolved you can move forward with how to run the application.

1) Fill in your personal credentials where indicated in the code

2) Navigate to the directory that contains this file and run the following command `node lightbox-checker.js`

3) You will be asked to input the date and time that you want the lightbox check to run. 
    - Please enter the date and time in the following format: 06/24/2023 4:37pm
    
You will get a confirmation that the test will be ran and an email containing the results will be sent to whomever was the provided date and time

