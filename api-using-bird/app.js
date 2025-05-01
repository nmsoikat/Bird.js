const bird = require('../bird');

const app = new bird();

app.route('get', '/', (req, res) => {
    res.status(200).json({
        name: "Bird",
        type: "framework"
    })
})

app.listen(9090, () => {
    console.log("Server is running on 9090");
})