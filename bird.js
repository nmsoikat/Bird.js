const http = require('node:http')

class Bird {
    constructor() {
        this.server = http.createServer();

        // Example properties: "get/": ()=>{}
        this.routes = {}

        // This event is emitted every time an HTTP request is made to the server.
        this.server.on("request", (req, res) => {

            res.status = (code) => {
                res.statusCode = code;
                return res;
            }

            res.json = (body) => {
                res.setHeader("Content-Type", "application/json")
                res.end(JSON.stringify(body));
            }

            if (this.routes[`${req.method.toLocaleLowerCase()}${req.url}`]) {
                this.routes[`${req.method.toLocaleLowerCase()}${req.url}`](req, res)
            }
        })
    }

    route(method, url, cb) {
        this.routes[`${method}${url}`] = cb;
    }

    listen(port, cb) {
        this.server.listen(port, cb)
    }
}

module.exports = Bird;