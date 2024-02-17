'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const port = 4000
const multer = require('multer');
const fs = require('fs').promises;
var app = express();
const libre = require('libreoffice-convert');
const cors = require('cors');
libre.convertAsync = require('util').promisify(libre.convert);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res, next) {
  return res.render("homepage");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './upload');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });


let filepath;
let filename;
let inputFilePath;

app.post('/upload', upload.single("wordFile"), async (req, res) => {
  console.log(req.body);
  
  console.log(req.file);

  try {
    const ext = '.pdf';
    const inputPath = path.join(__dirname, `/upload/${req.file.filename}`);
    const outputPath = path.join(__dirname, `/download/${req.file.filename}${ext}`);
    filepath = outputPath;
    filename = `${req.file.filename}${ext}`;
    inputFilePath = inputPath;

    // Read file
    const docxBuf = await fs.readFile(inputPath);

    // Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
    let pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);

    // Here in done you have pdf file which you can save or transfer in another stream
    await fs.writeFile(outputPath, pdfBuf);
    


  }

  catch (error) {
    console.log(error);

  }
  // return res.redirect('/download');
  setTimeout(() => {
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'file');
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        
      }
      else {
        fs.unlink(`${filepath}`, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('File deleted successfully');
          }
        });
        fs.unlink(`${inputFilePath}`, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('File deleted successfully');
          }
        });

      }
    }, 3000);
  });
});

// app.get('/download',(req,res)=>{


//   // set the headers for the response
//   res.setHeader('content-Disposition',`attachment; filename=${filename}`);
//   res.setHeader('Content-Type', 'file');
//   res.download(filepath, filename, (err) => {
//     if (err) {
//       console.error('Error downloading file:', err);
//       res.status(500).send('Internal Server Error');
//     }
//   });
// })


app.listen(port, () => {
  console.log(`hey from ${port}`);
})
module.exports = app;


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });