const sgMail = require('@sendgrid/mail')

function welcomeMail(name) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Signup Successful</title>
</head>
<body style="margin:0; padding:20px; background:#f6f8fb; font-family:Arial, Helvetica, sans-serif;">

  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:6px; padding:24px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">

    <p style="font-size:16px; color:#333333; margin-bottom:12px;">
      Dear <strong>${name}</strong>,
    </p>

    <p style="font-size:14px; color:#555555; line-height:1.6; margin-bottom:12px;">
      You have successfully signed up with <strong>ASSAM INSTITUTE OF MANAGEMENT</strong>.
    </p>

    <p style="font-size:14px; color:#555555; line-height:1.6; margin-bottom:12px;">
      You can log in anytime using your credentials through the link below:
    </p>

    <p style="margin-bottom:16px;">
      <a href="https://aimguwahati.edu.in/login_user" style="color:#1a73e8; text-decoration:none; font-weight:bold;">
        https://aimguwahati.edu.in/login_user
      </a>
    </p>

    <p style="font-size:14px; color:#555555; line-height:1.6; margin-bottom:12px;">
      To continue with the <strong>admission process</strong>, please complete and submit the remaining sections of your application form.
    </p>

    <p style="font-size:14px; color:#555555; line-height:1.6; margin-bottom:20px;">
      If you need any assistance, feel free to contact our admissions team.
    </p>

    <p style="font-size:12px; color:#333333; font-weight:bold; margin:0;">
      Best regards,<br>
      ASSAM INSTITUTE OF MANAGEMENT<br>
      8474884123
    </p>

  </div>

</body>
</html>
`
} 


function otpMail(otp) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0; padding:20px; background:#f6f8fb; font-family:Arial, Helvetica, sans-serif;">

  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-top: 4px solid #cc0000; border-radius:6px; padding:32px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="color: #333333; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Password Reset</h2>
    </div>

    <p style="font-size:14px; color:#555555; line-height:1.6; margin-bottom:20px;">
      We received a request to reset your password for your <strong>ASSAM INSTITUTE OF MANAGEMENT</strong> admission account. Use the code below to proceed:
    </p>

    <div style="background: #fff5f5; border: 1px dashed #cc0000; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 25px; font-weight: 800; color: #cc0000; letter-spacing: 8px;">
        ${otp}
      </span>
      <p style="font-size: 11px; color: #999999; margin-top: 10px; text-transform: uppercase; font-weight: bold;">
        This code is valid for 10 minutes
      </p>
    </div>

    <p style="font-size:14px; color:#555555; line-height:1.6; margin-bottom:12px;">
      If you did not request this change, please ignore this email or contact our support team immediately.
    </p>

    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 24px 0;" />

    <p style="font-size:12px; color:#333333; font-weight:bold; margin:0;">
      Best regards,<br>
      Admissions Cell<br>
      ASSAM INSTITUTE OF MANAGEMENT<br>
      <span style="color: #cc0000;">8474884123</span>
    </p>

  </div>

  <div style="text-align: center; margin-top: 20px;">
    <p style="font-size: 11px; color: #aaaaaa;">
      &copy; Assam Institute of Management. All rights reserved.
    </p>
  </div>

</body>
</html>
`;
}

async function sendMailToUser(toEmail, type, name) {
    try {
        const msg = {
            to: toEmail,
            from: "no-reply@aimguwahati.edu.in",
            subject: "Welcome to ASSAM INSTITUTE OF MANAGEMENT Portal — Your Signup is Successful",
            text: "Registration Successfull Email",
            html: welcomeMail(name),
        };
        await sgMail.send(msg);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error.response?.body || error.message);
    }
}


async function sendMailToUserForOtp(toEmail, otp) {
    try {
        const msg = {
            to: toEmail,
            from: "no-reply@aimguwahati.edu.in",
            subject: "ASSAM INSTITUTE OF MANAGEMENT — OTP for Password Reset",
            text: "OTP for Password Reset",
            html: otpMail(otp),
        };
        await sgMail.send(msg);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error.response?.body || error.message);
    }
}



module.exports = { sendMailToUser, sendMailToUserForOtp }