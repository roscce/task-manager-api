const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'rosic.luka1@gmail.com',
        subject: 'Welcome to the Task Manager',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    });
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'rosic.luka1@gmail.com',
        subject: `Goodbye ${name}`,
        text: 'We are sorry to see you go. Is there anything we could have done to help you stay.'
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};
