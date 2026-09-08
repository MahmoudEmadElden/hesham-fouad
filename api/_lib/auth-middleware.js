const jwt = require('jsonwebtoken');

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('يجب تسجيل الدخول أولاً');
    err.statusCode = 401;
    throw err;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    const err = new Error('يجب تسجيل الدخول أولاً');
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hesham_fouad_super_secure_jwt_secret_2026_king');
    return decoded;
  } catch (jwtError) {
    const err = new Error('انتهت صلاحية الجلسة. سجل دخول مرة تانية.');
    err.statusCode = 401;
    throw err;
  }
}

function requireRole(user, requiredRole) {
  if (user.role !== requiredRole && user.role !== 'admin') {
    const err = new Error('غير مصرح لك بالوصول');
    err.statusCode = 403;
    throw err;
  }
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function handleCors(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

module.exports = { verifyToken, requireRole, setCorsHeaders, handleCors };
