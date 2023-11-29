const router = require("express").Router();
const AddNewUser = require("../models/AddNewUser");
const { verifyToken } = require("./verifyToken");

router.get("/allUsers", verifyToken, async (req, res) => {
  try {
    const users = await AddNewUser.find();
    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user._doc;
      return userWithoutPassword;
    });

    res.status(200).json({
      total: usersWithoutPassword.length,
      users: usersWithoutPassword,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/addUser", verifyToken, async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        "qewretrytufyiguoyt"
      ).toString();
    }

    const newUser = new AddNewUser(req.body);

    const savedUser = await newUser.save();

    const { password, ...userWithoutPassword } = savedUser._doc;

    res.status(201).json({
      message: "User added successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      res.status(400).json({ message: "Name is already taken" });
    } else if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.phoneNumber
    ) {
      res.status(400).json({ message: "Phone number is already taken" });
    } else {
      res.status(500).json(error);
    }
  }
});

router.put("/edit/:id", verifyToken, async (req, res) => {
  try {
    const existingUser = await AddNewUser.findOne({
      $or: [
        { name: req.body.name, _id: { $ne: req.params.id } },
        { phoneNumber: req.body.phoneNumber, _id: { $ne: req.params.id } },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.name === req.body.name
          ? "Name is already taken"
          : "Phone number is already taken",
      });
    }

    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        "qewretrytufyiguoyt"
      ).toString();
    }

    const updatedUser = await AddNewUser.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          phoneNumber: req.body.phoneNumber,
          address: req.body.address,
          state: req.body.state,
          city: req.body.city,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json("User not found");
    }

    const { password, ...userWithoutPassword } = updatedUser._doc;

    res.status(200).json({
      message: "User updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});


router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const deletedUser = await AddNewUser.findByIdAndRemove(req.params.id);

    if (!deletedUser) {
      return res.status(404).json("User not found");
    }

    const { password, ...userWithoutPassword } = deletedUser._doc;

    res.status(200).json({
      message: "User deleted successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
