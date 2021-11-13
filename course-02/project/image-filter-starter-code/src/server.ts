import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import * as path from "path";
import fs from "fs";
import ErrnoException = NodeJS.ErrnoException;
import {error} from "util";

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
  QUERY PARAMATERS
     image_url: URL of a publicly accessible image
  RETURNS
    the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  ! END @TODO1
  */

  const promiseOrTimeout = (promise: Promise<string>, time: number, exception: Error): Promise<any> => {
    let timer: NodeJS.Timeout;
    const timeout = new Promise((_, rej) => timer = setTimeout(rej, time, exception))
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
  }

  const processImage = async (req: any, res: any, next: any) => {
    const image_url = req.query.image_url as string
    if ( !image_url ) {
      return res.status(400).send({"error": "Missing image_url query parameter."})
    }
    const filterImageTimeout = new Error('Timeout while filtering image.')
    await promiseOrTimeout(filterImageFromURL(image_url), 2000, filterImageTimeout)
      .then((file: any) => res.status(200).sendFile(file))
      .catch((error: any) => res.status(500).send({"error": error}))
  }

  const deleteTmpFiles = async (req: any, res: any, next: any) => {
    const tempDirectory = path.join(__dirname, 'util', 'tmp')
    const files = fs.readdirSync(tempDirectory).map(file => path.join(tempDirectory, file))
    await deleteLocalFiles(files)
  }

  app.get("/filteredimage", processImage, deleteTmpFiles)

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
