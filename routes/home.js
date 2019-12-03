const Router = require('express-promise-router')
const router = new Router()
const pool = require('../model')
require('../config/passport');
const passport = require('passport');
// var session = require('express-session');
// var cookieParser = require('cookie-parser');
// var flash = require('connect-flash');
// router.use(cookieParser('secret'));
// router.use(session({cookie: { maxAge: 60000 }}));
// router.use(flash());

router.post('/dang-nhap', passport.authenticate('local-dang-nhap', {
        successRedirect : '/',
        failureRedirect : '/login',
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

router.post('/dang-ky', passport.authenticate('local-dang-ky', {
    successRedirect : '/login',
    failureRedirect : '/signup',
    failureFlash : true,
    // session: false
}));

router.get('/dang-xuat', function(req, res) {
    req.logout();
    res.redirect('/');
});



// Is Logged
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

// Is not logged
function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

/* GET Trang chủ. */
router.get('/login', function(req, res, next) {
	(async() => {
        const client = await pool.connect();
        // let error = req.flash('error');
        try {
            res.render('pages/login',{
              expressFlash: req.flash('error')
            });
        } finally {
            client.release()
        }
    })().catch(e => console.log(e.stack))
});

router.get('/signup', function(req, res, next) {
	(async() => {
        const client = await pool.connect();
        // let error = req.flash('error');
        try {
            res.render('pages/signup',{
              expressFlash: req.flash('error')
            });
        } finally {
            client.release()
        }
    })().catch(e => console.log(e.stack))
});


/* GET Trang chủ. */
router.get('/', function(req, res, next) {
	(async() => {
        const client = await pool.connect();
        let error = req.flash('error');
        try {
            //Bài viết mới nhất
           const newestPost = await client.query("SELECT *, current_date - ngaydang AS diftime FROM baiviet INNER JOIN chuyende ON idcdd=idcd ORDER BY diftime LIMIT 4")
           //Xem nhiều nhất
           const mostPopularOfTuan = await client.query("SELECT * FROM baiviet INNER JOIN chuyende ON idcdd=idcd WHERE current_date - interval '5' day <= ngaydang  ORDER BY luotxem LIMIT 3")
           //Xem nhiều
           const mostReader = await client.query("SELECT * FROM baiviet INNER JOIN chuyende ON idcdd=idcd  WHERE luotxem IS NOT NULL ORDER BY luotxem DESC LIMIT 5")
           // Top 10 chuyên mục mới nhất
           //const newestPost = await client.query("SELECT *, current_date - ngaydang AS diftime FROM baiviet INNER JOIN chuyende ON idcdd=idcd ORDER BY diftime LIMIT 10")

            //MenuBar
           const menu= await client.query("SELECT chuyenmuc.*,string_agg( distinct concat(chuyende.idcd ,'~',chuyende.tencd ),':') tcd  FROM chuyenmuc INNER JOIN chuyende ON chuyenmuc.idcm=chuyende.idcm GROUP BY chuyenmuc.idcm" )
            res.render('pages/index',{
                title: '1612069_1612074_1612115',
                menu: menu.rows,
                NewestPost: newestPost.rows,
                mostPopular: mostPopularOfTuan.rows,
                mostReader: mostReader.rows,
                error: error
            });
        } finally {
            client.release()
        }
    })().catch(e => console.log(e.stack))
});

/* GET Chi tiet. */
router.get('/chi-tiet/:idcdd/:idbv', function(req, res, next) {
    (async() => {
        const client = await pool.connect();
        let error = req.flash('error');
        try {
          //MenuBar
         const menu= await client.query("SELECT chuyenmuc.*,string_agg( distinct concat(chuyende.idcd ,'~',chuyende.tencd ),':') tcd  FROM chuyenmuc INNER JOIN chuyende ON chuyenmuc.idcm=chuyende.idcm GROUP BY chuyenmuc.idcm" )
            const latestNews = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 10")
            const slide = await client.query("SELECT * FROM baiviet ORDER BY ngaydang DESC LIMIT 6")
            const popularPost = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 9")
            const mostPopular = await client.query("SELECT * FROM baiviet ORDER BY ngaydang DESC LIMIT 4")
            const mostReader = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 4")
            // const loaitin = await client.query("SELECT * FROM loaitin ORDER BY idloaitin DESC")
            const result = await client.query('SELECT * FROM baiviet bv INNER JOIN chuyende cd ON cd.idcd = bv.idcdd INNER JOIN chuyenmuc cm ON cm.idcm = cd.idcm AND bv.idbv = ' + req.params.idbv)
            const lienquan = await client.query('SELECT * FROM baiviet WHERE idcdd = ' + req.params.idcdd + ' AND idbv != ' + req.params.idbv +'ORDER BY random() LIMIT 3')
            res.render('pages/single-post',{
                title: 'News_TTB Website',
                latestNews: latestNews.rows,
                menu: menu.rows,
                slide: slide.rows,
                popularPost: popularPost.rows,
                mostPopular: mostPopular.rows,
                mostReader: mostReader.rows,
                // loaitin: loaitin.rows,
                baiviet: result.rows[0],
                lienquan: lienquan.rows,
                error: error
            });
        } finally {
            client.release()
        }
    })().catch(e => console.log(e.stack))
});

/* GET Danh sach. */
router.get('/danh-sach-cd/:name', function(req, res, next) {
    (async() => {
        const client = await pool.connect();
        let error = req.flash('error');
        try {

          //MenuBar
         const menu= await client.query("SELECT chuyenmuc.*,string_agg( distinct concat(chuyende.idcd ,'~',chuyende.tencd ),':') tcd  FROM chuyenmuc INNER JOIN chuyende ON chuyenmuc.idcm=chuyende.idcm GROUP BY chuyenmuc.idcm" )
            // const result = await client.query("SELECT * FROM baiviet bv INNER JOIN chuyende cd ON cd.idcd = bv.idcd AND cd.tencd = '" + req.params.name + "'")
            const result = await client.query("SELECT * FROM baiviet bv INNER JOIN chuyende cd ON cd.idcd = bv.idcdd AND bv.idcdd="+req.params.name)


            res.render('pages/archive',{

                menu: menu.rows,

                 result: result.rows,
                 dem:"1",
            });
        } finally {
            client.release()
        }
    })().catch(e => console.log(e.stack))
});

router.post('/tim-kiem', (req, res, next) => {
    const searchterm = req.body.searchterm;
    (async() => {
        const client = await pool.connect();
        let error = req.flash('error');
        try {
          //MenuBar
         const menu= await client.query("SELECT chuyenmuc.*,string_agg( distinct concat(chuyende.idcd ,'~',chuyende.tencd ),':') tcd  FROM chuyenmuc INNER JOIN chuyende ON chuyenmuc.idcm=chuyende.idcm GROUP BY chuyenmuc.idcm" )
         const latestNews = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 10")
         const slide = await client.query("SELECT * FROM baiviet ORDER BY ngaydang DESC LIMIT 6")
         const popularPost = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 9")
         const mostPopular = await client.query("SELECT * FROM baiviet ORDER BY ngaydang DESC LIMIT 4")
         const mostReader = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 4")
         const result = await client.query("SELECT DISTINCT idbv, tieude, noidung, hinhanh, luotxem, ngaydang, idcdd FROM baiviet Where (tieude  LIKE '%"+ searchterm +"%')  OR (noidung  LIKE '%"+ searchterm +"%') ORDER BY idbv")
           res.render('pages/search',{
                // title: 'News_TTB Website',
                // latestNews: latestNews.rows,
                 menu: menu.rows,
                // slide: slide.rows,
                 popularPost: popularPost.rows,
                 mostPopular: mostPopular.rows,
                 mostReader: mostReader.rows,
                // loaitin: loaitin.rows,
                 danhsach: result.rows,
                // error: error
            });
        } finally {
            client.release()
            console.log("Tìm kiếm thành công")
        }
    })(req,res).catch((e) => {
        console.log(e.stack)
        // req.flash("error", "Tìm kiếm thất bại / Lỗi: " + e.message)
    })
})

router.get('/file-manager.html', function(req, res, next) {
  res.render('layouts/index', { title: 'Roxy Fileman for Node.js' });
});

router.get('/submit', function(req, res, next) {
  (async() => {
      const client = await pool.connect();
      let error = req.flash('error');
      try {

        //MenuBar
       const menu= await client.query("SELECT chuyenmuc.*,string_agg( distinct concat(chuyende.idcd ,'~',chuyende.tencd ),':') tcd  FROM chuyenmuc INNER JOIN chuyende ON chuyenmuc.idcm=chuyende.idcm GROUP BY chuyenmuc.idcm" )
          // const result = await client.query("SELECT * FROM baiviet bv INNER JOIN chuyende cd ON cd.idcd = bv.idcd AND cd.tencd = '" + req.params.name + "'")
       const result = await client.query("SELECT * FROM baiviet bv INNER JOIN chuyende cd ON cd.idcd = bv.idcdd")


          res.render('pages/test',{

              menu: menu.rows,
               result: result.rows,
               dem:"1",
          });
      } finally {
          client.release()
      }
  })().catch(e => console.log(e.stack))
});

module.exports = router
