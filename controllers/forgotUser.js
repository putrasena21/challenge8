const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models");

const mailer = require("../helpers/mailer");

const { JWT_SECRET_KEY } = process.env;

module.exports = {
  forgotPassword: async (req, res) => {
    try {
      const BASE_ROUTES = "http://localhost:3000";

      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user) {
        return res.status(404).json({
          status: "Not Found",
          message: "User not found",
        });
      }

      const payload = {
        id: user.id,
        email: user.email,
      };

      const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "1h" });

      const html = `
        <h1>Reset Password</h1>
        <p>Click the link below to reset your password</p>
        <a href="${BASE_ROUTES}/reset-password?token=${token}">Reset Password</a>
        `;

      mailer.sendEmail(req.body.email, html);

      return res.status(200).json({
        status: "OK",
        message: "Reset password email sent",
      });
    } catch (err) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: err.message,
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { newPassword, confirmPassword } = req.body;

      const { token } = req.query;

      // decode jwt
      const payload = jwt.verify(token, JWT_SECRET_KEY);

      const user = await User.findOne({ where: { id: payload.id } });
      if (!user) {
        return res.status(404).json({
          status: "Not Found",
          message: "User not found",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          status: "Bad Request",
          message: "Password does not match",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

      await user.update({ password: hashedPassword });

      return res.status(200).json({
        status: "OK",
        message: "Password changed",
      });
    } catch (err) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: err.message,
      });
    }
  },
};
