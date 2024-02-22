import pkg from '@prisma/client';
const { PrismaClient,User } = pkg;
const prisma = new PrismaClient();
import generateSnowflakeId from '../utils/generateSnowflake.js';

const addRole = async (req, res) => {
    const { name } = req.body;
    try {
        if (name.length<2) {
            return res.status(400).json({ status: false, message: 'Name should be at least 2 characters' });
        }
        const role = await prisma.role.create({
            data: {
                id: generateSnowflakeId(),
                name,
            },
        });
        res.status(200).json({ status: true,content:{data: role} });
    } catch (error) {
        res.status(400).json({ status: false, error });
    }
};

const getRoles = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    try {
        const totalCount = await prisma.role.count();
        const totalPages = Math.ceil(totalCount / pageSize);
        const roles = await prisma.role.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
        })

        res.status(200).json({
            status: true,
            content: {
                meta:{
                    total: totalCount,
                    pages: totalPages,
                    page: page,
                },
                data: roles
            },
        })
    }catch(error) {
        res.status(400).json({ status: false, error });
    }
}

export default { addRole, getRoles };