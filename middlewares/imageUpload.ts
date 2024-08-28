import multer from "multer";
import path from "path";

const imageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
  
        cb(null, path.join(__dirname, '../uploads/'))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

export const imageLocalUpload = multer({
    storage: imageStorage,
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(png|jpeg|webp)$/)) {
            return cb(new Error("Por favor, envie apenas png, webp ou jpeg!"))
        }

        cb(null, true)
    }
})

