const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadBaseResume,
  analyzeJD,
  generateTailoredResume
} = require('../controllers/resumeController');

const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, upload.single('resume'), uploadBaseResume);
router.post('/analyze-jd', protect, analyzeJD);
router.post('/tailor/:applicationId', protect, generateTailoredResume);

module.exports = router;
