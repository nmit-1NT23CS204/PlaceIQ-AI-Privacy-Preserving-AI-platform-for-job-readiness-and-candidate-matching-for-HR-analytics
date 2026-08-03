const admin = require('firebase-admin');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Set user on request. We'll fetch role from Firestore if needed, 
    // or assume it's in the decodedToken if we set custom claims.
    // For now, we'll fetch from Firestore to match the frontend logic.
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({ success: false, error: 'User profile not found' });
    }

    req.user = { id: decodedToken.uid, ...userDoc.data() };
    next();
  } catch (err) {
    console.error('Auth Error:', err);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
