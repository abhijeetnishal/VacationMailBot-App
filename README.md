## VacationMailBot App

- This Node.js application uses the Gmail API to automatically respond to new emails in a given Gmail mailbox. It's particularly useful for when you're out on vacation and want to let people know you won't be able to respond to their emails right away.

### Features

- Check for new emails in a given Gmail mailbox
- Send replies to emails that have no prior emails sent by you
- Add a label to the email and move it to that label
- Repeat this sequence of steps 1-3 in random intervals of 45 to 120 seconds
- Ensure that no double replies are sent to any email at any point

### Setup

1. Star this repo and Fork the repo to create your own copy to work from.
2. Clone this repository to your local machine using command:

```bash
git clone https://github.com/abhijeetnishal/company-assessment.git
```

3. Install the dependencies by running: npm install
4. Create a new project in the Google Developers Console: https://console.cloud.google.com/apis/dashboard
5. Enable the Gmail API for your project
6. Create credentials for a service account
7. Download the JSON file containing your credentials
8. Rename the JSON file to credentials.json and move it to the root of the project directory
9. Grant the service account access to the Gmail mailbox you want to monitor and respond to
10. Update the config.js file with the appropriate values
11. Run the application with the command npm start
