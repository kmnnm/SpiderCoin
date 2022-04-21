export const cors = (req: any, res: any, next: any) => {
    console.log("Through cors Middleware");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    //res.header("Access-Control-Allow-Credentials", "http://localhost:3000");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
        // "XMLHttpRequest"
    );
    next();
};

export const addHeaders = (req: any, res: any, next: any) => {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

    // Request methods you wish to allow
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST, OPTIONS, PUT, PATCH, DELETE"
    );

    // Request headers you wish to allow
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-with, content-type"
    );

    // Set to true if you need the website to include cookies in the requests sent to the API
    // (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to next layer of middleware
    next();
};
