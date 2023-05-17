"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const next_1 = __importDefault(require("next"));
const vhost_1 = __importDefault(require("vhost"));
const express_device_1 = __importDefault(require("express-device"));
const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const mainServer = (0, express_1.default)();
    const mobileServer = (0, express_1.default)();
    const pcServer = (0, express_1.default)();
    mainServer.use(express_device_1.default.capture());
    mainServer.use((req, res, next) => {
        const isMobile = req.device.type === "phone" || req.device.type === "tablet";
        if (isMobile) {
            if (req.hostname === "www.bop2.com") {
                console.log("Mobile device detected! Redirecting...");
                return res.redirect(301, "http://m.bop2.com:3000" + req.url);
            }
            return mobileServer(req, res);
        }
        return next();
    });
    mainServer.get("/", (req, res) => {
        console.log("Main Server Active!", req.path);
        const isMobile = req.device.type === "phone" || req.device.type === "tablet";
        if (isMobile) {
            console.log("Mobile device detected!");
            return mobileServer(req, res);
        }
        else {
            console.log("PC device detected!");
            return pcServer(req, res);
        }
    });
    mobileServer.get("/", (req, res) => {
        console.log("mobile / hello!", req.path);
        return app.render(req, res, "/mobile", req.query);
    });
    mobileServer.get("/*", (req, res) => {
        console.log("mobile * hello!", req.path);
        return app.render(req, res, `/mobile${req.path}`, req.query);
    });
    mobileServer.all("*", (req, res) => {
        console.log("mobile All hello!");
        return handle(req, res);
    });
    pcServer.get("/*", (req, res) => {
        console.log("PC * Hello!, req, res", req.path);
        return app.render(req, res, req.path === "/" ? "/" : `${req.path}`, req.query);
    });
    pcServer.get("/", (req, res) => {
        console.log("PC / Hello!, req, res", req.path);
        return app.render(req, res, "/", req.query);
    });
    pcServer.all("*", (req, res) => {
        console.log("PCServer All Hello!");
        return handle(req, res);
    });
    mainServer.use((0, vhost_1.default)("localhost", pcServer));
    mainServer.use((0, vhost_1.default)("m.localhost", mobileServer));
    mainServer.listen(port, (err) => {
        if (err)
            throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
