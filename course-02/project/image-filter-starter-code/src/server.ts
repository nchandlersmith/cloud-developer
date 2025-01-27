import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import * as path from "path";
import fs from "fs";

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  /*
    @TODO1 IMPLEMENT A RESTFUL ENDPOINT
    GET /filteredimage?image_url={{URL}}
    endpoint to filter an image from a public url.
    IT SHOULD
       1
       1. validate the image_url query
       2. call filterImageFromURL(image_url) to filter the image
       3. send the resulting file in the response
       4. deletes any files on the server on finish of the response
    QUERY PARAMETERS
       image_url: URL of a publicly accessible image
    RETURNS
      the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
    ! END @TODO1
    */

  const callerNotAuthorized = (req: any) => {
    return req.get("x-api-key") !== process.env.IMAGE_FILTER_X_API_KEY;
  }

  const imageUrlInvalid = (image_url: string) => {
    return !image_url;
  }

  const promiseOrTimeout = (promise: Promise<string>, time: number, exception: Symbol): Promise<string | symbol> => {
    let timer: NodeJS.Timeout;
    const timeout = new Promise<symbol>((_, rej) => timer = setTimeout(rej, time, exception))
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
  }

  const advanceToNext = (next: any, timeout: number) => {
    setTimeout(next, timeout)
  }

  const sendError = (error: Error|Symbol, timeoutError: symbol, res: any) => {
    if (error === timeoutError) {
      res.status(422).send({"error": "Timed out while processing image."})
    } else {
      error = error as Error // symbol exited above
      res.status(422).send({"error": error.message})
    }
  }

  const processImage = async (req: any, res: any, next: any) => {
    if (callerNotAuthorized(req)) {
      return res.status(403).send({"error": "Not authorized. Sad day. :("})
    }
    const image_url = req.query.image_url as string
    if (imageUrlInvalid(image_url)) {
      return res.status(400).send({"error": "Missing image_url query parameter."})
    }
    const filterImageTimeoutError = Symbol()
    const processingTimeout: number = Number(process.env.IMAGE_FILTER_PROCESSING_TIMEOUT) || 2000
    const sendTimeout: number = Number(process.env.IMAGE_FILTER_SEND_IMAGE_TIMEOUT) || 1000
    await promiseOrTimeout(filterImageFromURL(image_url), processingTimeout, filterImageTimeoutError)
      .then((file: string | symbol) => {
        res.status(200).sendFile(file)
        advanceToNext(next, sendTimeout);
      })
      .catch((error: any) => {
        sendError(error, filterImageTimeoutError, res);
      })
  }

  const deleteTmpFiles = async (req: any, res: any) => {
    const tempDirectory = path.join(__dirname, 'util', 'tmp')
    const files = fs.readdirSync(tempDirectory).map(file => path.join(tempDirectory, file))
    await deleteLocalFiles(files)
  }

  app.get("/filteredimage", processImage, deleteTmpFiles)

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
