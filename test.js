var mail = require("./mail")


const test=()=>{
    mail.sendEmail(
        ["aravinths911@gmail.com","aravinths.20msc@kongu.edu"],
        "Test Email with Attachments",
        "Hello, this is a test email with attachments!",
        "<b>Hello, this is a test email with attachments!</b>"
      );

      console.log("called and exited");
}



const StudentEmails = require("./models/Student");

const testLogStudents = async () => {
    try {
        const data = await StudentEmails.find({});
        console.log(data);
    } catch (error) {
        console.error("Error fetching student data:", error);
    }
};

testLogStudents();
