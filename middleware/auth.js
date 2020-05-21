const isLogin = (req, res, next) => {
  if (!req.session.user) {
    req.flash('alertMessage', 'Session timed out');
    req.flash('alertStatus', 'danger');
    res.redirect('/admin/signin');
  } else {
    next();
  }
};

module.exports = isLogin;
