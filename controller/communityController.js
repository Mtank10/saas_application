import pkg from '@prisma/client';
import generateSnowflakeId from '../utils/generateSnowflake.js';
import generateSlug from '../utils/generateSlugKey.js';
const { PrismaClient, Community } = pkg;
const prisma = new PrismaClient();


const createCommunity = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id 

    if (!name || name.length < 2) {
      return res.status(400).json({ status: false, message: 'Name is required and must be at least 2 characters long' });
    }

    // Generate slug from name
    const slug = generateSlug(name);

    // Create community
    const community = await prisma.community.create({
      data: {
        id:generateSnowflakeId(),
        name,
        slug,
        owner: userId, 
      },
    });

    // create role 'Community Admin'
      const role = await prisma.role.create({ 
        data: {
          id:generateSnowflakeId(),
          name: 'Community Admin' } });

    // Create member for the community owner with the role 'Community Admin'
    await prisma.member.create({
      data: {
        id:generateSnowflakeId(),
        community: community.id,
        user: userId,
        role: role.id, 
      },
    });

    res.status(201).json({
      status: true,
      content: {
        data: community,
      },
    });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

const getAllCommunities = async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query;

    // Calculate offset based on page number and items per page
    const offset = (page - 1) * perPage;

    const totalCount = await prisma.community.count();
    console.log(totalCount)
    const communities = await prisma.community.findMany({
      take: parseInt(perPage),
      skip: offset,
      select: {
        id: true,
        name: true,
        slug: true,
            ownerUser: {
              select: {
                id: true,
                name: true,
              },
          },
        created_at: true,
        updated_at: true,
      },
      
    });

    const totalPages = Math.ceil(totalCount / perPage);

    res.status(200).json({
      status: true,
      content: {
        meta: {
          total: totalCount,
          pages: totalPages,
          page: parseInt(page),
        },
        data: communities,
      },
    });
  } catch (error) {
    console.error('Error getting all communities:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

const getCommunityMembers = async (req, res) =>{
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const members = await prisma.member.findMany({
      where: { community: id },
      take: limit,
      skip: offset,
      include: {
        userRef: {
          select: {
            id: true,
            name: true,
          }
        },
        communityRef: {
          select: {
            id: true,
          }
        },
        roleRef: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    const totalMembers = await prisma.member.count({ where: { community: id } });

    const totalPages = Math.ceil(totalMembers / limit);

    const response = {
      meta: {
        total: totalMembers,
        pages: totalPages,
        page: page,
      },
      data: members,
    };

    res.json({ status: true, content: response });
  } catch (error) {
    console.error('Error getting members:', error);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

// GET /v1/community/me/owner
const getMyCommunities =  async (req, res) => {
  try {
    const userId = req.userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const communities = await prisma.community.findMany({
      where: { owner: userId },
      take: limit,
      skip: offset,
    });

    const totalCommunities = await prisma.community.count({ where: { owner: userId } });

    const totalPages = Math.ceil(totalCommunities / limit);

    const response = {
      meta: {
        total: totalCommunities,
        pages: totalPages,
        page: page,
      },
      data: communities,
    };

    res.json({ status: true, content: response });
  } catch (error) {
    console.error('Error getting owned communities:', error);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
};


const getJoinedCommunities =  async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const communities = await prisma.community.findMany({
      where: {
        members: {
          some: { user: userId }
        }
      },
      include: {
        ownerUser: {
          select: { id: true, name: true }
        }
      },
      take: limit,
      skip: offset,
    });
    const totalCommunities = await prisma.community.count({
      where: {
        members: {
          some: { user: userId }
        }
      }
    });
    const totalPages = Math.ceil(totalCommunities / limit);
    const response = {
      meta: {
        total: totalCommunities,
        pages: totalPages,
        page: page,
      },
      data: communities,
    };
    res.json({ status: true, content: response });
      
    } catch (error) {
    console.error('Error getting joined communities:', error);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
}


export default { createCommunity , getAllCommunities , getCommunityMembers , getMyCommunities , getJoinedCommunities};
