require("dotenv").config();
const { app, port, scriptRun, cookieParser } = require("./script/serverRun");
const apiRouter = require("./router/api");
const db = require("./script/rundb");


app.use(cookieParser());
app.use("/", apiRouter);


scriptRun(port);

if (process.env.NODE_ENV === "development") {
    console.log("Mode développement activé");
    console.log("Port: ", port);
    console.log("Database: ", db.name);
} else if (process.env.NODE_ENV === "production") {
    console.log("Mode production activé");
    console.log("Port: ", port);
    console.log("Database: ", db.name);
}

if(!process.env.JWT_SECRET){
    console.error("Erreur : JWT_SECRET non défini");
    process.exit(1);
}
if(!process.env.MONGODB_URI){
    console.error("Erreur : MONGODB_URI non défini");
    process.exit(1);
}


