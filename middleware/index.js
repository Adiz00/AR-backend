export const requireRole = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    };
  };
  


//   app.get('/admin/dashboard', requireRole(['super_admin', 'manager']), adminDashboardHandler);
