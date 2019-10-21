import express from 'express';
import Advert from '../modules/advert'
import formidable from 'formidable'
import config from '../config'
import {basename} from 'path'

// 创建一个路由容器，将所有的路由中间件挂载给路由容器
const router = express.Router();

router.get('/advert', (req, res, next) => {
    const page = Number.parseInt(req.query.page, 10)
    const pageSize = 5
    //查数据
    Advert.find().skip((page - 1) * pageSize).limit(pageSize).exec((err, adverts) => {
        if (err) {
            return next(err)
        }
        //查总记录数
        Advert.count((err, count) => {
            if (err) {
                return next(err)
            }
            //计算页码 总页码=总记录数/每页显示大小
            const totalPage = Math.ceil(count / pageSize)
            res.render('advert_list.html', {adverts, totalPage, page})
        })
    })
});
router.get('/advert/add', (req, res, next) => {
    res.render('advert_add.html');
});

router.post('/advert/add', (req, res, next) => {

    const form = new formidable.IncomingForm()
    //配置formidable文件上传接收路径
    form.uploadDir = config.uploadDir
    //配置保持文件原始的扩展名
    form.keepExtensions = true
    // fields 就是普通的表单字段
    // files 就是文件内容数据信息,例如文件大小，上传的路径
    form.parse(req, (err, fields, files) => {
        if (err) {
            return next(err)
        }
        const body = fields
        body.image = basename(files.image.path)

        //在这里把files中的图片处理一下
        //就是在body中添加一个image值就是图片上传上来的路径
        console.log(basename(files.image.path))

        //2.操作数据库
        const advert = new Advert({
            title: body.title,
            image: body.image,
            link: body.link,
            start_time: body.start_time,
            end_time: body.end_time,
        });
        advert.save((err, result) => {
            if (err) {
                return next(err)
            }
            res.json({
                err_code: 0,
            })
        })
    })

});

router.get('/advert/list', (req, res, next) => {
    Advert.find((err, docs) => {
        if (err) {
            return next(err)
        }
        res.json({
            err_code: 0,
            result: docs
        })
    })
});

// /advert/one/:advertId 是一个模糊匹配路径
// 可以匹配 /advert/one/* 的路径形式
// 例如：/advert/one/1 /advert/one/2 /advert/one/a /advert/one/abc 等路径
// 但是 /advert/one 或者 /advert/one/a/b 是不行的
// 至于 advertId 是自己起的一个名字，可以在处理函数中通过 req.params 来进行获取
router.get('/advert/one/:advertId', (req, res, next) => {
    Advert.findById(req.params.advertId, (err, result) => {
        if (err) {
            return next(err)
        }
        res.json({
            err_code: 0,
            result: result
        });
    });
});

// /advert/edit
router.post('/advert/edit', (req, res, next) => {
    Advert.findById(req.body.id, (err, advert) => {
        if (err) {
            return next(err)
        }
        const body = req.body
        advert.title = body.title
        advert.image = body.image
        advert.link = body.link
        advert.start_time = body.start_time
        advert.end_time = body.end_time
        advert.last_modified = Date.now()
        // 这里的 save 因为内部有一个 _id 所以这里是不会新增数据的，而是更新已有的数据
        advert.save((err, result) => {
            if (err) {
                return next(err)
            }
            res.json({
                err_code: 0
            });
        });
    });
});

router.get('/advert/remove/:advertId', (req, res, next) => {
    Advert.remove({_id: req.params.advertId}, err => {
        if (err) {
            return next(err)
        }
        res.json({
            err_code: 0
        });
    });
});

// 通过 export default 暴露的接口成员不能定义的同时直接暴露
// 最好先定义，再暴露
// export default 可以直接暴露字面量 {} 123
export default router
