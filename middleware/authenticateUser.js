import {util} from '../utils/util.js'
import pkg from '@prisma/client';
const { PrismaClient,User } = pkg;
const prisma = new PrismaClient();

const authenticateUser = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = util.verifyToken(token);

    // Find user by ID
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    // Attach user information to request object
    req.user = user;

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

export default authenticateUser;
