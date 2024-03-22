const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // app.use("/editor", function (req, res, next) {
  //   console.log(req);
  //   next();
  // });
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3002",
      changeOrigin: true,
      // followRedirects: true, // This will likely fix the redirect issue
    })
  );
};
