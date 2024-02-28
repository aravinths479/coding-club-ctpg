const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require("path");
const AWS = require("@aws-sdk/client-ses");

const { ACCESSKEYID, SECRETACCESSKEY, REGION } = process.env;

// Create SES service object.
const ses = new AWS.SES({
  apiVersion: "2010-12-01",
  region: REGION,
  credentials: {
    accessKeyId: ACCESSKEYID,
    secretAccessKey: SECRETACCESSKEY,
  },
});


const transporter = nodemailer.createTransport({
  SES: { ses, aws: AWS },
});

sendEmail = async (to, subject, text, html) => {
  try {
    // Email content
    const mailOptions = {
      from: {
        name: "coding club ctpg",
        address: "findmycareer01@gmail.com",
      }, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  sendEmail: sendEmail
};