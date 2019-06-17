const Router = require('express-promise-router')
const router = new Router()
const validator = require('express-validator');
var passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');
const pool = require('../model')

module.exports = router

pool.connect( (err, client, done) => {

  passport.serializeUser(function(user, done) {
    console.log(user);
    done(null, user.idquantrivien);
  });

  passport.deserializeUser(function(id, done) {
    client.query("SELECT * FROM admin WHERE idquantrivien = $1 ",[id], (err, res) => {
      done(err, res.rows[0]);
    });
  });

  passport.use(
    'local-admin-login',
    new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true
    },
    (req, email, password, done) => {
      req.checkBody('email', 'Địa chỉ Email không hợp lệ, vui lòng kiểm tra lại.').notEmpty().isEmail();
      req.checkBody('password', 'Mật khẩu không hợp lệ, vui lòng kiểm tra lại.').notEmpty();
      let errors = req.validationErrors();
      if(errors){
        var messages = [];
        errors.forEach(function(error){
          messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
      }

      client.query("SELECT * FROM admin WHERE email=$1",[email], (err, res) => {
        if (err){
          return done(err);
        }
        if (!res.rows.length) {
          return done(null, false, req.flash('error', 'Tài khoản này không tồn tại, vui lòng kiểm tra lại.'));
        }
        if (password != res.rows[0].matkhau) {
          return done(null, false, req.flash('error', 'Rất tiếc! Mật khẩu không đúng.'));
        }
        return done(null, res.rows[0]);
      });
    })
  );

}); // end pool.connect


/* GET users listing. */
router.get('/login', function(req, res, next){
	let error = req.flash('error');
	res.render('admin/partials/login', {
		title: 'Admin đăng nhập',
		error: error
	});
});

router.post('/login', passport.authenticate('local-admin-login', {
        successRedirect : '/admin',
        failureRedirect : '/admin/login',
        failureFlash : true
	}),
    function(req, res) {
        console.log("hello");

        if (req.body.remember) {
          req.session.cookie.maxAge = 1000 * 60 * 3;
        } else {
          req.session.cookie.expires = false;
        }
    	res.redirect('/');
	}
);

router.get('/', adminIsLoggedIn, function(req, res) {
  (async() => {
        const client = await pool.connect();
        let error = req.flash('error');
        try {
            const ad = await client.query("SELECT * FROM admin ad WHERE ad.idquantrivien= '"+ req.user.idquantrivien+"'" )
            // const wr = await client.query("SELECT * FROM admin ad WHERE ad.chucvu= '"+ req.user.chucvu+"'" )
            // const ed = await client.query("SELECT * FROM admin ad WHERE ad.chucvu= '"+ req.user.chucvu+"'" )
            // const wr = await client.query("SELECT bv.* FROM baiviet bv INNER JOIN loaitin lt ON lt.idloaitin = bv.idloaitin INNER JOIN theloai tl ON tl.idtheloai = lt.idtheloai AND tl.idtheloai = 3 ORDER BY bv.ngaydang DESC LIMIT 4")
            // const ed = await client.query("SELECT bv.* FROM baiviet bv INNER JOIN loaitin lt ON lt.idloaitin = bv.idloaitin INNER JOIN theloai tl ON tl.idtheloai = lt.idtheloai AND tl.idtheloai = 5 ORDER BY bv.ngaydang DESC LIMIT 4")
            // const theloai4 = await client.query("SELECT bv.* FROM baiviet bv INNER JOIN loaitin lt ON lt.idloaitin = bv.idloaitin INNER JOIN theloai tl ON tl.idtheloai = lt.idtheloai AND tl.idtheloai = 2 ORDER BY bv.ngaydang DESC LIMIT 4")
            // const popularPost = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 9")
            // const mostPopular = await client.query("SELECT * FROM baiviet ORDER BY ngaydang DESC LIMIT 4")
            // const mostReader = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 4")
            res.render('admin/partials/index',{
                title: 'News_TTB Website',
                user : req.user,
                ad: ad.rows,

            });
        } finally {
            client.release()
        }
    })().catch(e => console.log(e.stack))
  });

router.get('/dang-xuat', function(req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router

// Is Logged
function adminIsLoggedIn(req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

// Is not logged
function adminNotLoggedIn(req, res, next) {
	if (!req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}
