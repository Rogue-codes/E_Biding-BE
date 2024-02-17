import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

var upload = multer({
  storage: storage,
  fileFilter(req, file, callback) {
    // Check if the MIME type includes "application/pdf"
    if (file.mimetype.includes("application/pdf")) {
      callback(null, true);
    } else {
      // Reject the file if it's not a PDF
      callback(new Error("Only PDF files are supported"));
    }
  },
});

export default upload;
