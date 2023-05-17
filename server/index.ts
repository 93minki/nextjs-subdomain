import express, { NextFunction, Request, Response } from "express";
import next from "next";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import vhost from "vhost";
import device from "express-device";

interface DeviceRequest extends Request {
  device: {
    type: string;
  };
}

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const mainServer = express();
  const mobileServer = express();
  const pcServer = express();

  mainServer.use(device.capture());

  mainServer.use((req: DeviceRequest, res: Response, next: NextFunction) => {
    const isMobile =
      req.device.type === "phone" || req.device.type === "tablet";

    if (isMobile) {
      if (req.hostname === "nextjs-subdomain-chi.vercel.app") {
        console.debug("Mobile device detected! Redirecting...");
        return res.redirect(
          301,
          "https://m.nextjs-subdomain-chi.vercel.app" + req.url
        );
      }
      return mobileServer(req, res);
    }

    return next();
  });

  mainServer.get("/", (req: DeviceRequest, res: Response) => {
    console.debug("Main Server Active!", req.path);
    const isMobile =
      req.device.type === "phone" || req.device.type === "tablet";

    if (isMobile) {
      console.debug("Mobile device detected!");
      return mobileServer(req, res);
    } else {
      console.debug("PC device detected!");
      return pcServer(req, res);
    }
  });

  mobileServer.get("/", (req: DeviceRequest, res: Response) => {
    console.debug("mobile / hello!", req.path);
    return app.render(req, res, "/mobile", req.query as NextParsedUrlQuery);
  });

  mobileServer.get("/*", (req: DeviceRequest, res: Response) => {
    console.debug("mobile * hello!", req.path);
    return app.render(
      req,
      res,
      `/mobile${req.path}`,
      req.query as NextParsedUrlQuery
    );
  });

  mobileServer.all("*", (req: DeviceRequest, res: Response) => {
    console.debug("mobile All hello!");
    return handle(req, res);
  });

  pcServer.get("/*", (req: DeviceRequest, res: Response) => {
    console.debug("PC * Hello!, req, res", req.path);
    return app.render(
      req,
      res,
      req.path === "/" ? "/" : `${req.path}`,
      req.query as NextParsedUrlQuery
    );
  });

  pcServer.get("/", (req: DeviceRequest, res: Response) => {
    console.debug("PC / Hello!, req, res", req.path);
    return app.render(req, res, "/", req.query as NextParsedUrlQuery);
  });

  pcServer.all("*", (req: DeviceRequest, res: Response) => {
    console.debug("PCServer All Hello!");
    return handle(req, res);
  });

  mainServer.use(vhost("nextjs-subdomain-chi.vercel.app", pcServer));
  mainServer.use(vhost("m.nextjs-subdomain-chi.vercel.app", mobileServer));

  mainServer.listen(port, (err?: Error) => {
    if (err) throw err;
    console.debug(`> Ready on http://localhost:${port}`);
  });
});
