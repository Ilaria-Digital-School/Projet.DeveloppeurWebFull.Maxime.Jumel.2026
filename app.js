require("dotenv").config();
const { app, port, scriptRun, cookieParser } = require("./script/serverRun");
const apiRouter = require("./router/api");
const db = require("./script/rundb");


app.use(cookieParser());
app.use("/", apiRouter);


scriptRun(port);





