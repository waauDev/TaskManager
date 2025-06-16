const multer = require('multer');

const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'uploads/');
    },

    filename:(req, file, cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`);

    }
})

const fileFilter = (req, file, cb)=>{
    const allowedTypes= ['image/jpeg', 'image/png', 'image/jpg'];
    if(allowedTypes.includes(file.mimetype)){
        cb(null, true);
    }else{
        cb(new Error('Solo se aceptan archivos en png, jpg, o jpeg'),false);
    }
}

const upload = multer({storage, fileFilter});

module.exports = upload;