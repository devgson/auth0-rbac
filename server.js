const express = require("express");
const path = require("path");
const cors = require("cors");
const guard = require("express-jwt-permissions")();
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");
const bodyParser = require("body-parser");
const app = express();

const port = process.env.PORT || 3001;

const customers = [
  { name: "Nike" },
  { name: "Adidas" },
  { name: "New Balance" },
  { name: "Sketchers" }
];

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://gson007.auth0.com/.well-known/jwks.json"
  }),
  audience: "https://api.manager.com/customer",
  issuer: "https://gson007.auth0.com/",
  algorithms: ["RS256"]
});

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use("/", express.static(path.join(__dirname, "public")));

app.post("/authorize", jwtCheck, (req, res) => {
  res.json({
    user: req.user
  });
});

app.get("/customers", jwtCheck, guard.check(["read:customers"]), function(
  req,
  res
) {
  res.status(200).json({ data: customers });
});

app.post("/customers", jwtCheck, guard.check(["create:customers"]), function(
  req,
  res
) {
  const newCustomer = req.body;
  customers.push(newCustomer);
  res.status(200).json({ data: customers });
});

app.listen(port, () => {
  console.log("Listening at port 3001");
});
