declare module "express-device" {
  import { RequestHandler } from "express";

  function device(): RequestHandler;

  namespace device {
    function capture(): RequestHandler;
    interface Device {
      type: string;
      [key: string]: any;
    }
  }

  export = device;
}
