const multer=require("multer")



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  }
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg files are allowed'));
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = {
  upload: upload
};

