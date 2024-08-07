const express = require('express');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('form-validate', { errors: null });
});

const validateFormWithImage = [
    body('name').isLength({ min: 5 }).withMessage('Name is required with min 5 chars'),
    body('email').isEmail().withMessage('Invalid Email'),
    body('image').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('Image is required');
        }
        return true;
    })
];

app.post('/submit', upload.single('image'), validateFormWithImage, (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('form-validate', { errors: errors.array() });
    }

    const { name, email } = req.body;
    const imagePath = req.file.path;

    res.render('submission-validate', { name, email, imagePath });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});