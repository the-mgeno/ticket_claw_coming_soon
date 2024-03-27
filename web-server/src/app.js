require('dotenv').config();

const path = require('path')
const express = require('express')
const hbs = require('hbs')
const mailchimp = require('@mailchimp/mailchimp_marketing')

const app = express()
const port = process.env.PORT || 2000

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mailchimp configuration
mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    audienceId: '25bccdd97f',
    server: 'us22'
}) 

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('', ( req, res ) => {
    const imagePath = '/img/Ticketclaw Square Logo.PNG';
    res.render('index', {
        imagePath: imagePath,
        name: 'Matthew Geno',
        pageName: 'Ticket Claw',
    });
});

// Email app
app.get('', ( req, res ) => {
    res.render('subscribe', {
        errorMessage: null,
        subscribeMessage: null,
    });
});

app.post('/subscribe', async (req, res) => {
    const { firstName, lastName, email } = req.body;
      
    try {
        const response = await mailchimp.lists.addListMember('25bccdd97f', {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
            },
        });
      
        console.log('Successfully subscribed:', response);

        res.render('subscribe', {
            errorMessage: null,
            subscribeMessage: 'Successfully subscribed to the newsletter!',
        });
      
    } catch (error) {
        console.error('Subscription failed:', error);
      
        res.render('subscribe', {
            errorMessage: 'Subscription failed. Please try again later.',
            subscribeMessage: null,
        });
    }
});

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
