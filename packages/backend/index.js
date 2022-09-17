var express = require("express");
var fs = require("fs");
const https = require("https");
var cors = require("cors");
var bodyParser = require("body-parser");
var app = express();

const port = Number(process.env.PORT) || 49899;

let wishList = [];

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    console.log("/");
    res.status(200).send("hello world");
});

app.get("/wishList", function (request, response) {
    return response.send({ allowedList: wishList });
});

app.post("/findAddress", function (request, response) {
    // return response.send({ allowedList: wishList });
    let { address } = request.body;
    let userData = wishList.find((data) => data.address === address);

    return response.send({ userData });
});

app.post("/addToWishList", function (request, response) {
    console.log("POOOOST!!!!", request.body); // your JSON
    let { address, msgHash, msgSignature } = request.body;

    let isAddressExists = wishList.find((data) => data.address === address);
    if (isAddressExists === undefined) {
        wishList.push({ address, msgHash, msgSignature });

        return response.send({ msg: "address added to allow list", status: true });
    } else {
        return response.send({ msg: "address already exists", status: false });
    }
});

app.post("/removeFromWishList", function (request, response) {
    console.log("POOOOST!!!!", request.body); // your JSON
    let { address } = request.body;

    wishList = [...wishList.filter((data) => data.address !== address)];

    return response.send({ msg: "address removed", status: true });
});

if (fs.existsSync("server.key") && fs.existsSync("server.cert")) {
    https
        .createServer(
            {
                key: fs.readFileSync("server.key"),
                cert: fs.readFileSync("server.cert"),
            },
            app
        )
        .listen(port, () => {
            console.log("HTTPS Listening: 49899");
        });
} else {
    var server = app.listen(port, "0.0.0.0", function () {
        console.log("HTTP Listening on port:", server.address().port);
    });
}
/*
// // to keep alive heroku call test api every 5 minutes
setInterval(function () {
    const https = require("https");

    const options = {
        hostname: "https://multisig-lol-backend.herokuapp.com",
        path: "/",
        method: "GET",
    };
    const req = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on("data", (d) => {
            process.stdout.write(d);
        });
    });
    req.on("error", (error) => {
        console.error(error);
    });

    req.end();
}, 300000); // every 5 minutes (300000)
*/
