const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: "do6ufbry5",
    api_key:"158927975294678",
    api_secret: "mPRh60C9__jnrFa8BvxtJQ2trqQ"
  });

module.exports = cloudinary;
