const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
    console.log(req.headers)
    const authHeader = req.headers.token || req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(" ")[1]
        console.log(token);
        jwt.verify(token, 'jbsakjdbiabsdibaskdbaksjdb', (err, user) => {
            if (err) res.status(403).json('Invalid Token')
            req.user = user
            next()
        })
    } else {
        return res.status(401).json("You are not authenticated")
    }
}

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not alowed to do that!");
        }
    });
};

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not alowed to do that!");
        }
    });
};

module.exports = {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
};