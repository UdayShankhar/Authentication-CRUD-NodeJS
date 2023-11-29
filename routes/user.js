const router = require("express").Router();
const AddNewUser = require("../models/AddNewUser");
const User = require("../models/User");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

// If the JWT token is valid, anyone can edit,create,view or delete user
// To avoid this, in verifyToken.js, I have wriiten seperate conditions

// CONDITIONS
// 1) If token is verified anyone can edit,create,view or delete user
// 2) Token and Authorization both should be valid can edit,create,view or delete user
// 3) Token and isAdmin should be true can edit,create,view or delete user

// With these conditions,we can able to customize the app according to our need

router.put("/:id", verifyToken, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      "qewretrytufyiguoyt"
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/find/:id", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/find/:id", verifyToken, async (req, res) => {
  console.log(req.headers);
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Pagination has been done and I have set the limit to 1
// If we want to fetch 10 users at a time, In PostMan, under params section

// 1) Give key as page and value to 1
// 2) Give key as limit and value as 10 // This will give 10 users in a single page

router.get("/", verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find()
      .limit(limit * 1)
      .skip((page - 1) * limit);
    console.log(users);
    res.status(200).json({ total: users.length, users });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// router.get("/allUsers", verifyToken, async (req, res) => {
//   try {
//     const users = await AddNewUser.find();
//     const usersWithoutPassword = users.map((user) => {
//       const { password, ...userWithoutPassword } = user._doc;
//       return userWithoutPassword;
//     });

//     res.status(200).json({
//       total: usersWithoutPassword.length,
//       users: usersWithoutPassword,
//     });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

// router.post("/addUser", verifyToken, async (req, res) => {
//   try {
//     if (req.body.password) {
//       req.body.password = CryptoJS.AES.encrypt(
//         req.body.password,
//         "qewretrytufyiguoyt"
//       ).toString();
//     }

//     const newUser = new AddNewUser(req.body);

//     const savedUser = await newUser.save();

//     const { password, ...userWithoutPassword } = savedUser._doc;

//     res.status(201).json(userWithoutPassword);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

// router.put("/edit/:id", verifyToken, async (req, res) => {
//   try {
//     if (req.body.password) {
//       req.body.password = CryptoJS.AES.encrypt(
//         req.body.password,
//         "qewretrytufyiguoyt"
//       ).toString();
//     }

//     const updatedUser = await AddNewUser.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: {
//           name: req.body.name,
//           phoneNumber: req.body.phoneNumber,
//           address: req.body.address,
//           state: req.body.state,
//           city: req.body.city,
//         },
//       },
//       { new: true }
//     );

//     const { password, ...userWithoutPassword } = updatedUser._doc;

//     res.status(200).json(userWithoutPassword);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

// router.delete("/delete/:id", verifyToken, async (req, res) => {
//   try {
//     const deletedUser = await AddNewUser.findByIdAndRemove(req.params.id);

//     if (!deletedUser) {
//       return res.status(404).json("User not found");
//     }

//     const { password, ...userWithoutPassword } = deletedUser._doc;

//     res.status(200).json(userWithoutPassword);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

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

// Add a new user
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

// Edit a user by _id
router.put("/edit/:id", verifyToken, async (req, res) => {
  try {
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

// Delete a user by _id
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
