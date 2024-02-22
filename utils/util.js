import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const util = {
    hashPassword: async (password) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    },
    comparePassword: async (password, hashedPassword) => {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    },
    generateToken: (id) => {
        return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    },
    verifyToken: (token) => {
        return jwt.verify(token, process.env.JWT_SECRET || 'secret');
    }
}