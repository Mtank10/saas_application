import generateSnowflakeId from "../utils/generateSnowflake.js";
import validator from 'validator';

import { util } from '../utils/util.js';

import pkg from '@prisma/client';
const { PrismaClient,User } = pkg;
const prisma = new PrismaClient();

const signup = async (req , res ) => {
    try {
        const { name, email, password } = req.body;

        if (name.length < 2 && password.length > 6) {
            return res.status(400).json({
                "status": false,
                "errors": [
                    {
                        "param": "name",
                        "message": "Name should be at least 2 characters.",
                        "code": "INVALID_INPUT"
                    }
                ]
            })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json(
                {
                    "status": false,
                    "errors": [
                        {
                            "param": "email",
                            "message": "Email must be in proper format.",
                            "code": "INVALID_EMAIL"
                        }
                    ]
                }
            );
        }
        if (name.length < 2 && password.length < 6) {
            return res.status(400).json(
                {
                    "status": false,
                    "errors": [
                        {
                            "param": "name",
                            "message": "Name should be at least 2 characters.",
                            "code": "INVALID_INPUT"
                        },
                        {
                            "param": "password",
                            "message": "Password should be at least 2 characters.",
                            "code": "INVALID_INPUT"
                        }
                    ]
                }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (existingUser) {
            return res.status(400).json(
                {
                    "status": false,
                    "errors": [
                        {
                            "param": "email",
                            "message": "User with this email address already exists.",
                            "code": "RESOURCE_EXISTS"
                        }
                    ]
                }
            );
        }

        const hashedPassword = await util.hashPassword(password);

        //create user
        const newUser = await prisma.user.create({
            data: {
                id: generateSnowflakeId(),
                name,
                email,
                password: hashedPassword,
            }
        })

        const token = util.generateToken(newUser.id);
        res.cookie('token', token, { httpOnly: true });

        res.status(201).json({
            status: true,
            content: {
                data: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    created_at: newUser.created_at,
                },
                meta: {
                    access_token: token,
                },
            },
        });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

const signin = async (req , res ) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({
                "status": false,
                "errors": [
                    {
                        "param": "email",
                        "message": "Please provide a valid email address.",
                        "code": "INVALID_INPUT"
                    }
                ]
            })
        }
        const passwordMatch = await util.comparePassword(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json(
                {
                    "status": false,
                    "errors": [
                        {
                            "param": "password",
                            "message": "The credentials you provided are invalid.",
                            "code": "INVALID_CREDENTIALS"
                        }
                    ]
                }
            )
        }
        return res.status(200).json({
            status: true,
            content: {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at,
                },
                meta: {
                    access_token: req.cookies.token
                },
            },
        });
    } catch (error) {
        console.error('Error signing in:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
}

const profile = async (req , res ) => {
    try {
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json(
            {
                "status": false,
                "errors": [
                    {
                        "message": "You need to sign in to proceed.",
                        "code": "NOT_SIGNEDIN"
                    }
                ]
            }
            );
        }
        const token = authHeader.split(' ')[1];
        if(!token){
            return res.status(401).json(
                {
                    "status": false,
                    "errors": [
                        {
                            "message": "You need to sign in to proceed.",
                            "code": "NOT_SIGNEDIN"
                        }
                    ]
                }
                );
        }
        const decoded= util.verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, name: true, email: true, created_at: true },
        });
        if (!user) {
          return res.status(401).json(
            {
                "status": false,
                "errors": [
                    {
                        "message": "You need to sign in to proceed.",
                        "code": "NOT_SIGNEDIN"
                    }
                ]
            });
        }
    
        res.status(200).json(
            {
                "status": true,
                "content": {
                  "data": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "created_at": user.created_at
                  }
                }
              }

        );
      } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
      }
}



export default { signup, signin, profile }