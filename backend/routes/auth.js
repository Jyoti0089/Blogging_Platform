const express = require('express');
const router = express.Router();

// ✅ REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = {
      _id: Date.now().toString(), // 🔥 important
      username,
      email
    };

    res.json({
      success: true,
      message: "User registered successfully",
      data: user
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = {
      _id: Date.now().toString(), // 🔥 important
      email
    };

    res.json({
      success: true,
      message: "Login successful",
      data: user
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// TEST
router.get('/', (req, res) => {
  res.json({ message: 'Auth route working' });
});

module.exports = router;








