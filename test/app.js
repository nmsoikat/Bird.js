const bird = require('../package');

const app = new bird();

// Body parser middleware. Get data from stream and set into req.body
app.useMiddleware((req, res, next) => {
    // Node give us body as stream.
    if (req.headers["content-type"] === "application/json") {
        // This is only good for bodies that their size is less than the highWaterMark value
        let data = "";
        req.on("data", (chunk) => {
            data += chunk.toString("utf-8");
        })

        req.on("end", () => {
            req.body = JSON.parse(data);
            next()
        })
    } else {
        next();
    }
})

app.route('get', '/', (req, res) => {
    res.sendFile("./public/index.html")
})

app.route('post', '/login', (req, res, next) => {
    console.log("Hello: ");
    next("abcd")
}, (req, res, next) => {
    res.json(req.body)
})

app.route("get", "/style.css", (req, res) => {
    res.sendFile("./public/style.css");
});

app.route("get", "/script.js", (req, res) => {
    res.sendFile("./public/script.js");
});

app.route('get', '/hello', (req, res) => {
    res.status(200).json({
        name: "Bird",
        type: "framework"
    })
})

app.listen(9090, () => {
    console.log("Server is running on 9090");
})
