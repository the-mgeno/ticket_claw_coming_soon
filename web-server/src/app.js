const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express')
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
const viewsPath = path.join(__dirname, '../views');
const publicPath = path.join(__dirname, '../public');

// Setup views directory to serve HTML files
app.use(express.static(viewsPath));

// Setup public directory to serve static assets
app.use(express.static(publicPath));

// Serve HTML files directly from the views directory
app.get('/', (req, res) => {
    res.sendFile(path.join(viewsPath, 'index.html'));
});

// Serve HTML files for other routes
app.get('/subscribe', (req, res) => {
    res.sendFile(path.join(viewsPath, 'subscribe.html'));
});

app.get('/img/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    res.sendFile(path.join(publicPath, 'img', imageName));
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

        res.sendFile(path.join(viewsPath, 'subscribe.html'));
      
    } catch (error) {
        console.error('Subscription failed:', error);
      
        res.sendFile(path.join(viewsPath, 'subscribe.html'));
        }
    }
);

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
