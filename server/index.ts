import express, { Request, Response } from "express";
import next from "next";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import vhost from "vhost";

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const mainServer = express();
  const mobileServer = express();
  const pcServer = express();

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

  mainServer.use(vhost("m.bop.com", mobileServer));
  mainServer.use(vhost("www.bop.com", pcServer));
  mainServer.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
