const Router = require('express-promise-router')
const router = new Router()
const pool = require('../model')
require('../config/passport');
const passport = require('passport');

router.post('/login', passport.authenticate('local-dang-nhap', {
        successRedirect : '/',
        failureRedirect : '/',
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
    successRedirect : '/',
    failureRedirect : '/',
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
router.get('/', function(req, res, next) {
	(async() => {
        const client = await pool.connect();
        let error = req.flash('error');
        try {
            // const menu = await client.query("SELECT theloai.*, string_agg(DISTINCT loaitin.tenloaitin, ':') lt FROM theloai INNER JOIN loaitin ON loaitin.idtheloai = theloai.idtheloai GROUP BY theloai.idtheloai")
            // const latestNews = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 10")
            // const slide = await client.query("SELECT * FROM baiviet ORDER BY ngaydang DESC LIMIT 6")
            // const theloai1 = await client.query("SELECT bv.* FROM baiviet bv INNER JOIN loaitin lt ON lt.idloaitin = bv.idloaitin INNER JOIN theloai tl ON tl.idtheloai = lt.idtheloai AND tl.idtheloai = 1 ORDER BY bv.ngaydang DESC LIMIT 4")
            // const theloai2 = await client.query("SELECT bv.* FROM baiviet bv INNER JOIN loaitin lt ON lt.idloaitin = bv.idloaitin INNER JOIN theloai tl ON tl.idtheloai = lt.idtheloai AND tl.idtheloai = 3 ORDER BY bv.ngaydang DESC LIMIT 4")
            // const theloai3 = await client.query("SELECT bv.* FROM baiviet bv INNER JOIN loaitin lt ON lt.idloaitin = bv.idloaitin INNER JOIN theloai tl ON tl.idtheloai = lt.idtheloai AND tl.idtheloai = 5 ORDER BY bv.ngaydang DESC LIMIT 4")
            // const theloai4 = await client.query("SELECT bv.* FROM baiviet bv INNER JOIN loaitin lt ON lt.idloaitin = bv.idloaitin INNER JOIN theloai tl ON tl.idtheloai = lt.idtheloai AND tl.idtheloai = 2 ORDER BY bv.ngaydang DESC LIMIT 4")
           const newestPost = await client.query("SELECT *, current_date - ngaydang AS diftime FROM baiviet INNER JOIN chuyende ON idcdd=idcd ORDER BY diftime LIMIT 4")
           const mostPopular = await client.query("SELECT bv.* FROM baiviet bv")
           const mostReader = await client.query("SELECT * FROM baiviet WHERE luotxem IS NOT NULL ORDER BY luotxem DESC LIMIT 5")
            // const randomPost = await client.query("SELECT * FROM baiviet bv INNER JOIN chuyende cd ON cd.idcd=bv.idcdd")
            // const loaitin = await client.query("SELECT * FROM loaitin ORDER BY idloaitin DESC")
            // const menu= await client.query("SELECT * from chuyenmuc ORDER BY idcm ASC LIMIT 5")
            const menu= await client.query("SELECT chuyenmuc.*,string_agg(DISTINCT chuyende.tencd, ':') tcd FROM chuyenmuc INNER JOIN chuyende ON chuyenmuc.idcm=chuyende.idcm GROUP BY chuyenmuc.idcm" )
            // const menu1= await client.query("SELECT chuyenmuc.*,string_agg(DISTINCT chuyende.idcd, ':') tcd FROM chuyenmuc INNER JOIN chuyende ON chuyenmuc.idcm=chuyende.idcm GROUP BY chuyenmuc.idcm" )
            res.render('pages/index',{
                title: 'News_TTB Website',
                // latestNews: latestNews.rows,
                menu: menu.rows,

                // randomPost: randomPost.rows,
                // chuyende:chuyende.rows,
                // slide: slide.rows,
                // theloai1: theloai1.rows,
                // theloai2: theloai2.rows,
                // theloai3: theloai3.rows,
                // theloai4: theloai4.rows,
                NewestPost: newestPost.rows,
                mostPopular: mostPopular.rows,
                mostReader: mostReader.rows,
                // loaitin: loaitin.rows,
                // error: error
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
            const menu= await client.query("SELECT chuyenmuc.*, string_agg(DISTINCT chuyende.tencd, ':') tcd FROM chuyenmuc INNER JOIN chuyende ON chuyenmuc.idcm=chuyende.idcm GROUP BY chuyenmuc.idcm" )
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
            // const menu = await client.query("SELECT theloai.*, string_agg(DISTINCT loaitin.tenloaitin, ':') lt FROM theloai INNER JOIN loaitin ON loaitin.idtheloai = theloai.idtheloai GROUP BY theloai.idtheloai")
            // const latestNews = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 10")
            // const slide = await client.query("SELECT * FROM baiviet ORDER BY ngaydang DESC LIMIT 6")
            // const popularPost = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 9")
            // const mostPopular = await client.query("SELECT * FROM baiviet ORDER BY ngaydang DESC LIMIT 4")
            // const mostReader = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 4")
            // const loaitin = await client.query("SELECT * FROM loaitin ORDER BY idloaitin DESC")
            const menu= await client.query("SELECT chuyenmuc.*, string_agg(DISTINCT chuyende.tencd, ':') tcd FROM chuyenmuc INNER JOIN chuyende ON chuyenmuc.idcm=chuyende.idcm GROUP BY chuyenmuc.idcm" )
            // const result = await client.query("SELECT * FROM baiviet bv INNER JOIN chuyende cd ON cd.idcd = bv.idcd AND cd.tencd = '" + req.params.name + "'")
            const result = await client.query("SELECT bv.* FROM baiviet bv INNER JOIN chuyende cd ON cd.idcd = bv.idcdd AND convertTVkdau(cd.tencd)= 'BONG DA'")


            res.render('pages/archive',{
                // title: 'News_TTB Website',
                // latestNews: latestNews.rows,
                menu: menu.rows,
                // slide: slide.rows,
                // popularPost: popularPost.rows,
                // mostPopular: mostPopular.rows,
                // mostReader: mostReader.rows,
                // loaitin: loaitin.rows,
                // danhsach: result.rows,
                // error: error,
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
            const menu = await client.query("SELECT theloai.*, string_agg(DISTINCT loaitin.tenloaitin, ':') lt FROM theloai INNER JOIN loaitin ON loaitin.idtheloai = theloai.idtheloai GROUP BY theloai.idtheloai")
            const latestNews = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 10")
            const slide = await client.query("SELECT * FROM baiviet ORDER BY ngaydang DESC LIMIT 6")
            const popularPost = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 9")
            const mostPopular = await client.query("SELECT * FROM baiviet ORDER BY ngaydang DESC LIMIT 4")
            const mostReader = await client.query("SELECT * FROM baiviet ORDER BY luotxem DESC LIMIT 4")
            const loaitin = await client.query("SELECT * FROM loaitin ORDER BY idloaitin DESC")
            const result = await client.query("SELECT DISTINCT idbaiviet, tacgia, tieude, tomtat, noidung, urlanh, luotxem, ngaydang, idloaitin FROM baiviet Where (tieude  LIKE '%"+ searchterm +"%') OR (tomtat  LIKE '%"+ searchterm +"%') OR (noidung  LIKE '%"+ searchterm +"%') ORDER BY idbaiviet")
           res.render('pages/search',{
                title: 'News_TTB Website',
                latestNews: latestNews.rows,
                menu: menu.rows,
                slide: slide.rows,
                popularPost: popularPost.rows,
                mostPopular: mostPopular.rows,
                mostReader: mostReader.rows,
                loaitin: loaitin.rows,
                danhsach: result.rows,
                error: error
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

module.exports = router
