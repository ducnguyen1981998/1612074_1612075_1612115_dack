const Router = require('express-promise-router')
var moment = require('moment');//get time now
const router = new Router()
const pool = require('../model')
const bodyParser = require('body-parser')
const validator = require('express-validator');

const urlencodedParser = bodyParser.urlencoded({ extended: true })
router.use(bodyParser.urlencoded({ extended: true }))

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/img/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('img');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: File không phải là hình ảnh!');
  }
}

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

/* GET users listing. */
router.get('/danhsach', adminIsLoggedIn, function(req, res, next) {
    (async() => {
        const client = await pool.connect()
        let error = req.flash('error');
        let success = req.flash('success')
        try {
            const ad = await client.query("SELECT * FROM admin ad WHERE ad.idquantrivien= '"+ req.user.idquantrivien+"'" )
            const loaitin = await client.query('SELECT * FROM chuyende')
            const result = await client.query('SELECT * FROM baiviet bv, chuyende cd WHERE bv.idcdd = cd.idcd ORDER BY bv.idbv DESC')

            res.render('admin/baiviet/danhsach',{
                ad:ad.rows,
                baiviet: result.rows,
                loaitin: loaitin.rows,
                title: 'News_TTB Website',
                user : req.user,
                error: error,
                success: success
            });
        } finally {
            client.release()
        }
    })().catch(e => console.log(e.stack))
});

router.get('/them', adminIsLoggedIn, function(req, res, next){
    (async() => {
        const client = await pool.connect()
        let error = req.flash('error');
        let success = req.flash('success')

        try {
            const ad = await client.query("SELECT * FROM admin ad WHERE ad.idquantrivien= '"+ req.user.idquantrivien+"'" )
            const theloai = await client.query('SELECT * FROM chuyenmuc')
            const loaitin = await client.query('SELECT * FROM chuyende')
            res.render('admin/baiviet/them',{
                ad:ad.rows,
                theloai: theloai.rows,
                loaitin: loaitin.rows,
                title: 'News_TTB Website',
                user : req.user,
                error: error,
                //err: err,
                success: success
            });
        } finally {
            client.release()
        }
    })().catch(e => console.log(e.stack))
});

router.post('/thembv', adminIsLoggedIn, function(req, res, next) {
    upload(req, res, function(err){
        req.checkBody('tieude', 'Tiêu đề bài viết không hợp lệ, vui lòng kiểm tra lại!').notEmpty();
        // req.checkBody('tacgia', 'Bài viết của ai?').notEmpty();
        req.checkBody('loaitin', 'Chưa chọn loại tin!').notEmpty();
        req.checkBody('tomtat', 'Tóm tắt bài viết không hợp lệ, vui lòng kiểm tra lai!').notEmpty();
        req.checkBody('ckeditor', 'Nội dung bài viết không hợp lệ, vui lòng kiểm tra lai!').notEmpty();
        let errors = req.validationErrors();

        if(errors){
            let messages = [];
            errors.forEach(function(error){
                messages.push(error.msg);
            });
            req.flash('error', messages);
            res.redirect('back');
        } else if(err){
            req.flash('error', err);
            res.redirect('back');
        }else {
            if(req.file == undefined){
                req.flash("error", "Bạn chưa chọn file ảnh!")
                res.redirect('/admin/baiviet/them');
            } else{
                const tieude = req.body.tieude;
                // const tacgia = req.body.tacgia;
                const idloaitin = req.body.loaitin;
                const tomtat = req.body.tomtat;
                //Nộidung
                const noidung = req.body.ckeditor;
                const img = req.body.img;
                (async() => {
                    const client = await pool.connect()
                    try{
                        const result = await client.query('SELECT MAX(idbv) FROM baiviet')
                        await client.query("INSERT INTO baiviet(idbv, tieude, noidung, hinhanh, luotxem, tomtat, idcdd, idtacgia) VALUES("+ result.rows[0].max +"+1, '" + tieude + "', '" + noidung + "', '"+ req.file.filename +"', '0', '"+ tomtat +"', '" + idloaitin + "','" +req.user.idquantrivien + "')")
                        req.flash('success', 'Thêm thành công');
                        res.redirect("/admin/baiviet/danhsach");
                    } finally{
                        client.release()
                    }
                })().catch(e =>{
                    console.log(e.stack)
                    req.flash("error", "Thêm bài viết thất bại / Lỗi: " + e.message)
                    res.redirect("/admin/baiviet/them")
                } )
            }
        }
    });
});

router.get('/sua/:id', adminIsLoggedIn, function(req, res, next){
    (async() => {
        const client = await pool.connect()
        let error = req.flash('error');
        let success = req.flash('success')

        try {
            const ad = await client.query("SELECT * FROM admin ad WHERE ad.idquantrivien= '"+ req.user.idquantrivien+"'" )
            const theloai = await client.query('SELECT * FROM chuyenmuc')
            const loaitin = await client.query('SELECT * FROM chuyende')
            const result = await client.query('SELECT * FROM  baiviet bv, chuyende lt WHERE bv.idcdd = lt.idcd AND bv.idbv = ' + req.params.id)
            res.render('admin/baiviet/sua',{
                ad:ad.rows,
                theloai: theloai.rows,
                loaitin: loaitin.rows,
                baiviet: result.rows[0],
                title: 'UPDATE',
                user : req.user,
                error: error,
                success: success
            });
        } finally {
            client.release()
        }
    })().catch(e => console.log(e.stack))
});

router.post('/sua/:id', adminIsLoggedIn, function(req, res, next) {
    upload(req, res, function(err){
        req.checkBody('tieude', 'Tiêu đề bài viết không hợp lệ, vui lòng kiểm tra lại!').notEmpty();
        req.checkBody('loaitin', 'Chưa chọn loại tin!').notEmpty();
        req.checkBody('tomtat', 'Tóm tắt bài viết không hợp lệ, vui lòng kiểm tra lai!').notEmpty();
        req.checkBody('noidung', 'Nội dung bài viết không hợp lệ, vui lòng kiểm tra lai!').notEmpty();
        let errors = req.validationErrors();

        if(errors){
            let messages = [];
            errors.forEach(function(error){
                messages.push(error.msg);
            });
            req.flash('error', messages);
            res.redirect('back');
        } else if(err){
            req.flash('error', err);
            res.redirect('back');
        }else {
            if(req.file == undefined){
                // req.flash("error", "Bạn chưa chọn file ảnh!")
                // res.redirect('back');
                const id = req.params.id;
                const tieude = req.body.tieude;
                const idloaitin = req.body.loaitin;
                const tomtat = req.body.tomtat;
                const noidung = req.body.noidung;
                (async() => {
                    const client = await pool.connect()
                    try{
                       // const img = await client.query("SELECT urlanh FROM baiviet WHERE idbaiviet = " + id)
                       //  urlanh = img.rows[0].urlanh
                        await client.query("UPDATE baiviet SET  tieude = '" + tieude + "', noidung = '" + noidung + "', idcdd = '" + idloaitin + "' WHERE idbv = " + id)
                        req.flash('success', 'Sửa thành công');
                        res.redirect("/admin/baiviet/danhsach");
                    } finally{
                        client.release()
                    }
                })().catch(e =>{
                    console.log(e.stack)
                    req.flash("error", "Sửa bài viết thất bại / Lỗi: " + e.message)
                    res.redirect('back');
                } )
            } else{
                const id = req.params.id;
                const tieude = req.body.tieude;
                const tacgia = req.body.tacgia;
                const idloaitin = req.body.loaitin;
                const tomtat = req.body.tomtat;
                const noidung = req.body.noidung;
                //const img = req.body.img;
                (async() => {
                    const client = await pool.connect()
                    try{
                       const img = await client.query("SELECT hinhanh FROM baiviet WHERE idbv = " + id)
                        urlanh = img.rows[0].urlanh
                        console.log(urlanh);
                        if(urlanh != null){
                            fs.unlink('./public/Uploads/Images/' + urlanh, (err) => {
                                if(err) return console.log(err);
                                console.log('successfully deleted');
                            });
                        }
                        await client.query("UPDATE baiviet SET  tieude = '" + tieude + "',  noidung = '" + noidung + "', hinhanh = '" + req.file.filename + "', idcdd = '" + idcdd + "' WHERE idbv = " + id)
                        req.flash('success', 'Sửa thành công');
                        res.redirect("/admin/baiviet/danhsach");
                    } finally{
                        client.release()
                    }
                })().catch(e =>{
                    console.log(e.stack)
                    req.flash("error", "Sửa bài viết thất bại / Lỗi: " + e.message)
                    res.redirect('back');
                } )
            }
        }
    });
});

router.post('/xoa/:id', adminIsLoggedIn, function(req, res, next) {
    const id = req.params.id;
    (async() => {
        const client = await pool.connect()
        try {
            const img = await client.query("SELECT hinhanh FROM baiviet WHERE idbv = " + id)
            urlanh = img.rows[0].urlanh
            console.log(urlanh);
            if(urlanh != null){
                fs.unlink('./public/Uploads/Images/' + urlanh, (err) => {
                    if(err) return console.log(err);
                    console.log('successfully deleted');
                });
            }
            await client.query("DELETE FROM baiviet WHERE idbv = " + id)
            req.flash('success', 'Xóa thành công')
            res.redirect("/admin/baiviet/danhsach")
        } finally {
            client.release()
        }
    })().catch(e => console.log(e.stack))
});

module.exports = router
