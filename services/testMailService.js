const { sendEmail } = require("./mailService");

// Define a function that triggers the email sending process without waiting for its completion
const triggerEmailSending = () => {
    try {
        // Define parameters for the email
        const to = "aravinths911@gmail.com";
        const subject = "Test Subject";
        const text = "Hello, this is a test email with attachments!";
        const html = "<b>Hello, this is a test email with attachments!</b>";

        // Call the sendEmail function with the parameters
        sendEmail(to, subject, text, html);

        // Log a message indicating that the email sending process has been initiated
        console.log("Email sending process initiated.");
    } catch (error) {
        console.error("Error initiating email sending process:", error);
    }
};

// Call the triggerEmailSending function to initiate the email sending process
triggerEmailSending();

// Main function exits immediately after initiating the email sending process
console.log("Main function exited.");
