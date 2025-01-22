import { createReadStream } from 'node:fs';
import formidable from 'formidable';
import path from 'node:path';
export const config = {
        api: {
          bodyParser: false,
       }
   }
      function handleIncomingFile(file, uploadPath){
          return new Promise((resolve, reject) => {
              const newPath = path.join(uploadPath, file.originalFilename);
          const readableStream = createReadStream(file.filepath);
       console.log('Handling the upload.', newPath);

       const writableStream = fs.createWriteStream(newPath);
        readableStream.pipe(writableStream);

       writableStream.on('finish', function() {
            console.log('Uploaded file saved to location ', newPath);
              resolve();
     });

          writableStream.on('error', (err) => {
             console.log("Error handling file stream");
                reject(err);
          })
         })
     }

  export default async function handler(req, res) {
   if(req.method !== 'POST') return res.status(405).json({message:'Method not allowed.'});
  const uploadPath = path.join(process.cwd(), '/tmp');
   const form = new formidable.IncomingForm({uploadDir: uploadPath, maxFiles: 1});

  try {
    return new Promise((resolve, reject) => {
           form.parse(req, async (err, _, files) => {
            if (err) {
                console.log('Parse Error', err);
        return  reject({ status: 500, message: 'Failed to parse file'})
      }

            if(!files.file || !files.file[0] ) {
           return  reject({status: 400, message: 'No file was provided'})
       }

        try{
             await handleIncomingFile(files.file[0], uploadPath);
          const uploadedFileName = files.file[0].originalFilename;
       return resolve(res.status(200).json({message: 'File Uploaded successfully.', filename: uploadedFileName}));
  }catch(err) {
    reject({ status: 500, message: 'Error saving the file'})
   }
  })
  })
  }
  catch (err) {
      console.error("Error Uploading the file ", err);
        res.status(500).json({ message: 'Failed to upload file ', error: err})
     }
 }
