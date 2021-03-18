
let express = require("express");
let app = express();
let port = 8080;
var cors = require('cors');


app.use(express.static("./src"));
app.use(cors());

app.listen(port, function () {
  console.log(`Listening at http://localhost:${port}`);
});


