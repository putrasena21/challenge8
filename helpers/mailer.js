const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REFRESH_TOKEN,
  OAUTH_REDIRECT,
} = process.env;

const oauth2Client = new google.auth.OAuth2(
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT
);

oauth2Client.setCredentials({ refresh_token: OAUTH_REFRESH_TOKEN });

module.exports = {
  sendEmail: async (to, html) => {
    try {
      const accessToken = await oauth2Client.getAccessToken();

      const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "putrasena21@gmail.com",
          clientId: OAUTH_CLIENT_ID,
          clientSecret: OAUTH_CLIENT_SECRET,
          refreshToken: OAUTH_REFRESH_TOKEN,
          accessToken,
        },
      });

      const mailOptions = {
        to,
        subject: "Reset Password",
        html,
      };

      const response = await smtpTransport.sendMail(mailOptions);
      return response;
    } catch (err) {
      return err;
    }
  },
};
