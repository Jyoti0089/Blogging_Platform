const express = require('express');
const router = express.Router();

// ✅ REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // अभी simple response (later DB जोड़ेंगे)
    res.json({
      success: true,
      message: "User registered successfully",
      data: { username, email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    res.json({
      success: true,
      message: "Login successful",
      data: { email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// TEST ROUTE
router.get('/', (req, res) => {
  res.json({ message: 'Auth route working' });
});

module.exports = router;