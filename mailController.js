//This module provides utilities for working with file and directory paths.
const path = require('path');

const fs = require('fs').promises;

//This library provides a way to authenticate with Google Cloud Platform services using a local browser flow. 
const {authenticate} = require('@google-cloud/local-auth');
//This library provides client libraries for interacting with various Google Cloud Platform services.
const {google} = require('googleapis');
                                 
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',  
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://mail.google.com/'
];


const emailServices = async(req, res) =>{
    //Load client secrets from a current directory.
    await fs.readFile('credentials.json');
 
    //Authorize a client with credentials, then call the Gmail API.
    const auth = await authenticate({
         keyfilePath: path.join(__dirname, 'credentials.json'),
         scopes: SCOPES
    });
 
    //This code creates a client object for the Gmail API
    const gmail = google.gmail({version:'v1', auth});
 
    //method to retrieve a list of labels for the authenticated user's Gmail account.
    const response = await gmail.users.labels.list({
        userId: 'me',
    });
    
    const LABEL_NAME =  'vacation';
 
    //Get messages that have по prior replies
    async function getUnrepliedMessages(auth) {
        const gmail = google.gmail({version: 'v1', auth});

        //retrieve a list of messages from the authenticated user's Gmail account that match the specified search criteria.
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: '-in:chats -from:me -has:userlabels',   // finds all messages that are not in the user's chat folder, not sent by the user, and that don't have any user-defined labels applied to them.
        });
        return res.data.messages || [];
    } 
 
    //Send reply to a message
    async function sendReply(auth, message) {
        const gmail = google.gmail({version: 'v1', auth});
    
        //This method retrieves a single message specified by its ID.
        const res =  await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From'],
        }); 
  
        const subject = res.data.payload.headers.find(
        (header) => header.name ==='Subject').value;

        const from = res.data.payload.headers.find(
            (header) => header.name ==='From').value;

        const replyTo = from.match(/<(.*)>/)[1];

        //If the subject string does start with 'Re:', the expression evaluates to true. Otherwise, it evaluates to false.
        const replySubject = subject.startsWith('Re:')? subject : `Rs: ${subject}`;
        const replyBody = `Hey, \n\nI am currently on vacation and i will get back to you soon.\n\n`;

        const rawMessage = [
            `From: me`,
            `To: ${replyTo}`,
            `subject: ${replySubject}`,
            `In-Reply-To: ${message.id}`,
            `References: ${message.id}`,
            '',
            replyBody,
        ].join('\n');

        //encodes a raw email message into base64 format. 
        const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g,'-').replace(/-+$/,'');
 
        await gmail.users.messages.send({
         userId: 'me',
         requestBody: {
           raw: encodedMessage,
         },
     });

     }
 
     async function createLabel (auth) {
        const gmail =google.gmail({version:'v1', auth});
         
        try{
            const res = await gmail.users.labels.create({
              userId:'me',
              requestBody: {
                name: LABEL_NAME,
                labellistvisibility: 'labelshow',
                messagelistvisibility: "show",  
              },
             });
             return res.data.id;
        }
        catch(err) {
            //when two or more clients attempt to update the same resource at the same time, causing a conflict between the different updates.
            if(err.code === 409) {
                //Label already exists
                const res = await gmail.users.labels.list({
                    userId: 'me',
                });
                const label = res.data.labels.find((label) => label.name === LABEL_NAME);
                return label.id;
            }
            else 
                throw err; 
         }
     }
  
     //Add label to a message and move it to the label folder
    async function addLabel(auth, message, labelId) {
        const gmail = google.gmail({version: 'v1', auth});
        await gmail.users.messages.modify({
        userId: 'me',
        id: message.id,
        requestBody: {
            addLabelIds: [labelId],
            removeLabelIds: ['INBOX'],
        },
        });
    }
 
    //Main function
    async function main() {
        //Create a label for the app
        const labelId = await createLabel(auth);
        console.log(`created or found label with id ${labelId}`);
        
        //Repeat the steps 1-3 in random intervals
        setInterval (async ()=> {
                //Get messages that have no prior replies
                const messages = await getUnrepliedMessages(auth);

                console.log(`Found ${messages.length} unreplied messages`);

                //For each message
                for(const message of messages){
                    //Send reply to the message
                    await sendReply(auth, message);
                    console.log(`sent reply to message with id ${message.id}`);

                    //Add label to the message and move it to the label folder
                    await addLabel(auth, message, labelId);
                    
                    console.log(`Added label to message with id ${message.id}`);
                }
            }, Math.floor(Math.random(120 - 45 + 1) + 45) * 1000); // Random interval between 45 and 120 seconds
    
        }

        main().catch(console.error);

        res.status(200).send('Automated Email service Working');
 }

module.exports = emailServices;