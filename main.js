var express= require("express");
var ejs = require("ejs");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var fileUpload = require("express-fileupload");

var app = express();

app.use(fileUpload({
    createParentPath : true
}));

app.set("views", __dirname+"/view");
app.set("view engine", "ejs");
app.engine("ejs",ejs.renderFile);

app.use(cookieParser());
app.use(express.static(__dirname+'/public'));
app.use(express.json());
app.use(session({
    secret : 'abcde',
    resave : false,
    saveUninitialized :true
}));

var router1 = require("./router/router2")(app);
var router2 = require("./router/router_main")(app);


app.listen(2000,function(){
    console.log("using 2000");
})
console.log(__dirname)