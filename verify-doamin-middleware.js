
exports.verify = function (req, res, next) {

    if(!req.headers.origin) return res.status(204).jsonp();
    // console.log(req.headers.origin == process.env.DOMAIN);
    if(req.headers.origin == process.env.DOMAIN) next();
    return res.status(204).jsonp();

}



