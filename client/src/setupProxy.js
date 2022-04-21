"use strict";
exports.__esModule = true;
var http_proxy_middleware_1 = require("http-proxy-middleware");
module.exports = function (app) {
    app.use("/api", (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: "http://localhost:3001",
        changeOrigin: true
    }));
};
