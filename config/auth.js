module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Please log in to view that resource");
    res.redirect("/users/login");
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    if (req.user.isStudent == true) {
      res.redirect("/studentDashboard");
    } else {
      res.redirect("/facultyDashboard");
    }
  },
  isFaculty: function (req, res, next) {
    if (req.user.isFaculty == true) {
      return next();
    }
    res.render("404");
  },
  isStudent: function (req, res, next) {
    if (req.user.isStudent == true) {
      return next();
    }
    res.render("404");
  },
};
