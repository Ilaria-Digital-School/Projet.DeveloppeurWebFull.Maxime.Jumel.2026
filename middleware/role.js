const role = (...allowedRoles) => (req, res, next) => {
    const userRoles = req.user?.roles ?? [];
    
    if (userRoles.some(r => allowedRoles.includes(r))) {
        return next();
        console.log(`Access granted for user with roles: ${userRoles.join(', ')}`);
    }

    res.status(403).json({ message: 'Access denied' });
    console.log(`Access denied for user with roles: ${userRoles.join(', ')}`);
};
module.exports = role;
