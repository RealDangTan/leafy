import jwt from 'jsonwebtoken';

function verifyToken(req, res, next) {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }
        req.userId = decoded.id;
        next();
    });
}

function verifyPasswordChangeLink(req, res, next) {
    const token = req.query.token;
    if (!token) {
        return res.redirect('/')
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.redirect('/')
        }
        req.email = decoded.email;
        next();
    });
}

function verifyTokenNotRes(req, res, next) {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    let param_id = req.query.user_id;
    if (param_id === "null") param_id = false;
    else req.userId = req.query.user_id;
    if (!token && !param_id) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!token) {
        req.is_owner = false;
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            req.is_owner = false;
            return next();
        }
        req.is_login = true;
        if (decoded.id === param_id || param_id === false) req.is_owner = true;
        else req.is_owner = false;
        if (!req.userId) req.userId = decoded.id;
        next();
    });
}

function checkToken(req, res, next) {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if (!token) return next();

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next();
        req.userId = decoded.id;
        next();
    });
}

export {
    verifyToken,
    verifyPasswordChangeLink,
    verifyTokenNotRes,
    checkToken,
};