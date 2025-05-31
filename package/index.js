const http = require('node:http')
const fs = require('node:fs/promises');
const path = require('node:path');
class Bird {
    constructor() {
        this.server = http.createServer();

        // Example properties: "get/": ()=>{}
        this.routes = {}
        this.middlewares = []

        // This event is emitted every time an HTTP request is made to the server.
        this.server.on("request", (req, res) => {
            res.status = (code) => {
                res.statusCode = code;
                return res;
            }

            res.json = (body) => {
                // This is only good for bodies that their size is less than the highWaterMark value
                res.setHeader("Content-Type", "application/json")
                res.end(JSON.stringify(body));
            }

            res.sendFile = async (filePath) => {
                const extension = path.extname(filePath)
                this.setContentType(res, extension)

                const fileHandler = await fs.open(filePath, 'r');
                const readableStream = fileHandler.createReadStream()
                readableStream.pipe(res)
                // How does pipe() know it can write?
                /**
                 * .pipe() just checks that:
                 * The destination (res in your case) has a .write() method.
                 * It behaves like a WritableStream (emits 'drain', 'error', etc.).
                 */
            }

            // if (!this.routes[`${req.method.toLocaleLowerCase()}${req.url}`]) {
            //     return res.status(404).json({ "error": `Page not found ${req.method} ${req.url}` })
            // }


            // middleware functions.
            const runMiddleware = (req, res, middlewares, index) => {
                // exist point
                if (index === middlewares.length) {
                    if (!this.routes[`${req.method.toLocaleLowerCase()}${req.url}`]) {
                        return res.status(404).json({ "error": `Page not found ${req.method} ${req.url}` })
                    }

                    // Start executing route->controller with multiple middleware
                    const routeMiddlewares = this.routes[`${req.method.toLocaleLowerCase()}${req.url}`];

                    const runControllerMiddleware = (req, res, routeMiddlewares, i) => {
                        if (routeMiddlewares.length === i) return;

                        routeMiddlewares[i](req, res, (nextErr) => {
                            if (nextErr) {
                                return res.json({
                                    error: nextErr.message || nextErr
                                })
                            } else {
                                runControllerMiddleware(req, res, routeMiddlewares, i + 1)
                            }
                        })
                    }

                    runControllerMiddleware(req, res, routeMiddlewares, 0)

                    // Old: Single controller
                    // this.routes[`${req.method.toLocaleLowerCase()}${req.url}`](req, res, (nextErr) => {
                    //     if (nextErr) {
                    //         return res.json({
                    //             error: nextErr.message
                    //         })
                    //     }
                    // })
                } else {
                    middlewares[index](req, res, (nextErr) => {
                        if (nextErr) {
                            res.json({
                                error: nextErr.message || nextErr
                            })
                        } else {
                            // else execute next middleware
                            runMiddleware(req, res, middlewares, index + 1)
                        }
                    })
                }
            }
            runMiddleware(req, res, this.middlewares, 0)

            // controller functions
            // this.routes[`${req.method.toLocaleLowerCase()}${req.url}`](req, res)
        })

        this.server.on("error", (err) => {
            console.log("👍 ~@@ err:", err);
        })
    }

    // route(method, url, cb) {
    //     this.routes[`${method}${url}`] = cb;
    // }

    route(method, url, ...cb) {
        this.routes[`${method}${url}`] = cb;
    }

    listen(port, cb) {
        this.server.listen(port, cb)
    }

    setContentType(res, extension) {
        if (extension === ".html") {
            res.setHeader("Content-Type", "text/html")
        } else if (extension === ".css") {
            res.setHeader("Content-Type", "text/css")
        } else if (extension === ".js") {
            res.setHeader("Content-Type", "text/javascript")
        }
    }

    useMiddleware(cb) {
        this.middlewares.push(cb)
    }
}

module.exports = Bird;

/**
 * TODO
 * response as stream
 * static public
 * route middleware
 * error handler
 * cors
 */