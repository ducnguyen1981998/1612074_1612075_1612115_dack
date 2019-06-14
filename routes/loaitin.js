const Router = require('express-promise-router')
const router = new Router()
const pool = require('../model')
var bodyParser = require('body-parser')
const validator = require('express-validator');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
router.use(bodyParser.urlencoded({ extended: false }))

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
            const theloai = await client.query('SELECT * FROM theloai')
            const result = await client.query('SELECT * FROM loaitin l, theloai t WHERE l.idtheloai = t.idtheloai')
            res.render('admin/loaitin/danhsach',{
                loaitin: result.rows,
                theloai: theloai.rows,
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


router.post('/sua/:id', adminIsLoggedIn, function(req, res, next) {
    req.checkBody('suaten', 'Tên loại tin không hợp lệ, vui lòng kiểm tra lại').notEmpty();
    req.checkBody('suatheloai', 'Tên thể loại không hợp lệ, vui lòng kiểm tra lại').notEmpty();
    let errors = req.validationErrors();

    if(errors){
        let messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        // res.send(messages);
        req.flash('error', messages);
        res.redirect('back');
    }else {
        const id = req.params.id;
        const ten = req.body.suaten;
        const idtheloai = req.body.suatheloai;
        (async() => {
            const client = await pool.connect()
            try {
                await client.query("UPDATE loaitin SET tenloaitin = '"+ ten +"', idtheloai = '" + idtheloai + "' WHERE idloaitin = " + id)
                req.flash('success', 'Sửa thành công');
                res.redirect("/admin/loaitin/danhsach")
            } finally {
                client.release()
            }
        })().catch(e => console.log(e.stack))
    }
});

router.post('/them', adminIsLoggedIn, function(req, res, next) {
    req.checkBody('themten', 'Tên loại tin không hợp lệ, vui lòng kiểm tra lại').notEmpty();
    req.checkBody('theloai', 'Chưa chọn thể loại, vui lòng kiểm tra lại').notEmpty();
    let errors = req.validationErrors();

    if(errors){
        let messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        // res.send(messages);
        req.flash('error', messages);
        res.redirect('back');
    }else {
        const ten = req.body.themten;
        const idtheloai = req.body.theloai;
        (async() => {
            const client = await pool.connect()
            try{
                const result = await client.query('SELECT MAX(idloaitin) FROM loaitin')
                // console.log(result.rows[0].max)
                await client.query("INSERT INTO loaitin(idloaitin, tenloaitin, idtheloai) VALUES("+ result.rows[0].max +"+1, '" + ten + "', '"+ idtheloai +"')")
                req.flash('success', 'Thêm thành công');
                res.redirect("/admin/loaitin/danhsach")
            } finally{
                client.release()
            }
        })().catch(e => console.log(e.stack))
    }
});

router.post('/xoa/:id', adminIsLoggedIn, function(req, res, next) {
    const id = req.params.id;
    (async() => {
        const client = await pool.connect()
        try {
            await client.query("DELETE FROM loaitin WHERE idloaitin = " + id)
            req.flash('success', 'Xóa thành công')
            res.redirect("/admin/loaitin/danhsach")
        } finally {
            client.release()
        }
    })().catch(e => console.log(e.stack))
});

module.exports = router

