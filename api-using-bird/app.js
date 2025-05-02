const bird = require('../bird');

const app = new bird();

app.route('get', '/', (req, res) => {
    res.sendFile("./public/index.html")
})

app.route('post', '/login', (req, res) => {
    // Node give us body as stream.
    let data = ""
    req.on("data", (chunk) => {
        data += chunk.toString('utf-8');
    })
    req.on("end", () => {
        req.body = JSON.parse(data)
        console.log("👍 ~ req.body:", req.body)
        res.json(req.body)
    })
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