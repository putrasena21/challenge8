const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { JWT_SECRET_KEY } = process.env;

login = async (req, res) => {
  try {
    let { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    const checkPassword = bcrypt.compareSync(password, user.password);

    if (!user) {
      return res.status(404).json({
        status: "Error",
        message: "User not exist",
        data: null,
      });
    }

    if (!checkPassword) {
      return res.status(401).json({
        status: "Error",
        message: "Invalid password",
        data: null,
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY);

    return res.status(200).json({
      status: "Success",
      message: "User logged in successfully",
      data: {
        ...payload,
        accessToken: token,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "Error",
      message: err.message,
    });
  }
};

createUser = async (req, res) => {
  try {
    let { email, username, password } = req.body;

    const userExist = await User.findOne({
      where: {
        email,
      },
    });

    if (userExist) {
      return res.status(400).json({
        status: "Error",
        message: "Username already exist",
      });
    }

    if (!email || !username || !password) {
      return res.status(400).json({
        status: "Error",
        message: "Please fill all the fields",
        data: null,
      });
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      let newUser = await User.create({
        email,
        username,
        password: hash,
      });

      return res.status(201).json({
        status: "Success",
        message: "User created successfully",
        data: newUser,
      });
    });
  } catch (err) {
    return res.status(500).json({
      status: "Error",
      message: err.message,
    });
  }
};

getAllUser = async (req, res) => {
  try {
    let users = await User.findAll({ include: "bio" });

    return res.status(200).json({
      status: "Success",
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      status: "Error",
      message: err.message,
    });
  }
};

getUser = async (req, res) => {
  try {
    let { id } = req.params;

    let user = await User.findOne({
      include: ["bio", "has_video"],
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "Error",
        message: "User not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "User data retrieved successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      status: "Error",
      message: err.message,
    });
  }
};

updateUser = async (req, res) => {
  try {
    let { id } = req.params;
    let { username, password } = req.body;

    let user = await User.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "Error",
        message: "User not found",
        data: null,
      });
    }

    if (username) user.username = username;
    if (password) user.password = password;

    let updated = await user.update({
      username,
      password,
    });

    return res.status(200).json({
      status: "Success",
      message: "User updated successfully",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      status: "Error",
      message: err.message,
    });
  }
};

deleteUser = async (req, res) => {
  try {
    let { id } = req.params;

    let user = await User.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "Error",
        message: "User not found",
        data: null,
      });
    }

    await user.destroy();

    return res.status(200).json({
      status: "Success",
      message: "User deleted successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      status: "Error",
      message: err.message,
    });
  }
};

module.exports = {
  login,
  createUser,
  getAllUser,
  getUser,
  updateUser,
  deleteUser,
};
