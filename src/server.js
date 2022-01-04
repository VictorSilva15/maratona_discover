//Requering express 
const express = require("express");
//Requering routes method from routes.js file
const routes = require("./routes");
//Initializing express as App
const App = express();
//Creating a port to run the aplication
const PORT = process.env.PORT || 3000;

//Changing the view engine:
App.set("view engine", "ejs");

//Habilitate static files
App.use(express.static("public"));

//Habilitate req.body
App.use(express.urlencoded({extended: true}));

//Use routes
App.use(routes);

//Listening port
App.listen(PORT, () => console.log("Running in http://localhost:"+PORT));