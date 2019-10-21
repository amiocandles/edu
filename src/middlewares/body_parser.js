import queryString from 'querystring'

export default (req, res, next) => {
    //req.headers可以拿到当前请求的请求头报文信息
    if (req.method.toLowerCase() === 'get') {
        // console.log('进入body-parser了')
        return next()
    }
    // 如果是普通表单POST，则咱们自己处理 application/x-www-form-urlencoded
    // 如果是有文件的表单POST，则咱们不处理
    //console.log(req.headers)
    if( req.headers['content-type'].startsWith('multipart/form-data') ){
        return next()
    }
    //如果是无文件的表单POST，则咱们处理
        let data = ''
    req.on('data', chunk => {
        data += chunk
    });
    req.on('end', () => {
        req.body = queryString.parse(data)
        next();
    });
}
