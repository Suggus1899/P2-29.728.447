"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = isAuthenticated;
function isAuthenticated(req, res, next) {
    var _a;
    if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.user) {
        return next(); // Usuario autenticado, continúa
    }
    // No autenticado, redirigir a login
    return res.redirect("/login");
}
