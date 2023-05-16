import express, { NextFunction, Request, Response } from "express";
import next from "next";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import vhost from "vhost";
import device from "express-device";

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const mainServer = express();
  const mobileServer = express();
  const pcServer = express();

  mainServer.use(device.capture());

  mainServer.use((req: Request, res: Response, next: NextFunction) => {
    const isMobile =
      (req as any).device.type === "phone" ||
      (req as any).device.type === "tablet";
    console.log("is mobile??");

    if (isMobile) {
      if ((req as any).hostname === "www.bop2.com") {
        console.log("Mobile device detected! Redirecting...");
        return res.redirect(301, "http://m.bop2.com:3000" + req.url);
      }
      return mobileServer(req, res);
    }

    return next();
  });

  mainServer.get("/", (req: Request, res: Response) => {
    console.log("Main Server Active!", req.path);
    const isMobile =
      (req as any).device.type === "phone" ||
      (req as any).device.type === "tablet";

    if (isMobile) {
      console.log("Mobile device detected!");
      return mobileServer(req, res);
    } else {
      console.log("PC device detected!");
      return pcServer(req, res);
    }
  });

  mobileServer.get("/", (req: Request, res: Response) => {
    console.log("mobile / hello!", req.path);
    return app.render(req, res, "/mobile", req.query as NextParsedUrlQuery);
  });

  mobileServer.get("/*", (req: Request, res: Response) => {
    console.log("mobile * hello!", req.path);
    return app.render(
      req,
      res,
      `/mobile${req.path}`,
      req.query as NextParsedUrlQuery
    );
  });

  mobileServer.all("*", (req: Request, res: Response) => {
    console.log("mobile All hello!");
    return handle(req, res);
  });

  pcServer.get("/", (req: Request, res: Response) => {
    console.log("PC / Hello!, req, res", req.path);
    return app.render(req, res, "/", req.query as NextParsedUrlQuery);
  });

  pcServer.get("/*", (req: Request, res: Response) => {
    console.log("PC * Hello!, req, res", req.path);
    return app.render(req, res, `${req.path}`, req.query as NextParsedUrlQuery);
  });

  pcServer.all("*", (req: Request, res: Response) => {
    console.log("PCServer All Hello!");
    return handle(req, res);
  });

  mainServer.use(vhost("www.bop2.com", pcServer));
  mainServer.use(vhost("m.bop2.com", mobileServer));

  mainServer.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
