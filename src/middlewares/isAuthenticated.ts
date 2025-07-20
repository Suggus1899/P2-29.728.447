import { Request, Response, NextFunction } from "express";

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user) {
    return next(); // Usuario autenticado, continúa
  }

  // No autenticado, redirigir a login
  return res.redirect("/login");
}