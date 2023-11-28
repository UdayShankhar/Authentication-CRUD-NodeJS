const router = require("express").Router()
const User = require("../models/User")
const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken")

// router.post("/register", async (req, res) => {
//     const newUser = new User({
//         username: req.body.username,
//         email: req.body.email,
//         password: CryptoJS.AES.encrypt(req.body.password, 'qewretrytufyiguoyt').toString()
//     })
//     try {
//         const savedUser = await newUser.save();
//         res.status(200).json(savedUser)
//     } catch (err) {
//         res.status(400).json(err)
//     }
// })

router.post("/register", async (req, res) => {
    try {
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: CryptoJS.AES.encrypt(req.body.password, 'qewretrytufyiguoyt').toString()
        });

        const savedUser = await newUser.save();
        const accessToken = jwt.sign({
            id: savedUser._id,
            isAdmin: savedUser.isAdmin
        }, 'jbsakjdbiabsdibaskdbaksjdb', {
            expiresIn: '2d'
        });

        const { password, ...userDetails } = savedUser._doc;
        res.status(200).json({ ...userDetails, accessToken });
    } catch (err) {
        res.status(400).json(err);
    }
});

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.body.username,
        })

        !user && res.status(401).json('Wrong credentials')

        const hashedPassword = CryptoJS.AES.decrypt(user.password, 'qewretrytufyiguoyt')
        const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8)

        Originalpassword != req.body.password && res.status(401).json('Wrong credentials')

        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin
        }, 'jbsakjdbiabsdibaskdbaksjdb', {
            expiresIn: '2d'
        })

        const { password, ...others } = user._doc

        res.status(200).json({ ...others, accessToken })

    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }

})

module.exports = router