import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
import generateSnowflakeId from '../utils/generateSnowflake.js';

const addMember = async (req, res) => {
  const { community, user, role } = req.body;

  try {
    const communityValue = await prisma.community.findUnique({
      where: { id: community },
    });
    if (!communityValue) {
      return res.status(404).json({ status: false, message: 'Community not found' });
    }
    
    // Check if user is authorized to add members to the community
    const owner = await prisma.user.findUnique({
      where: { id: communityValue.owner },
    });
    console.log(communityValue.owner)
    if (communityValue.owner !== owner.id) {
      return res.status(403).json({ status: false, message: 'You are not authorized to add members to this community' });
    }

    const userValue = await prisma.user.findUnique({
      where: { id: user },
    });
    if (!userValue) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const roleValue = await prisma.role.findUnique({
      where: { id: role },
    });
    if (!roleValue) {
      return res.status(404).json({ status: false, message: 'Role not found' });
    }

    // const existingMember = await prisma.member.findFirst({
    //   where: {
    //     communityId: community,
    //     userId: user,
    //     roleId: role,
    //   },
    // });
    // if (existingMember) {
    //   return res.status(409).json({ status: false, message: 'Member already exists' });
    // }

    const member = await prisma.member.create({
      data: {
        id: generateSnowflakeId(),
        community: community,
        user: user,
        role: role,
      },
    });

    return res.status(200).json({
      status: true,
      content: {
        data: member,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};




const removeMember = async (req, res) => {
    const memberId = req.params.id;
    try {
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include:{
                roleRef: true,
                communityRef: true
            }
        })
        if (!member) {
            res.status(404).json({ status: false, message: 'Member not found' });
        }
        if(member.roleRef.name !== 'Community Admin'){
            res.status(403).json({ status: false, message: 'You are not authorized to remove members from this community' });
        }
        await prisma.member.delete({
            where: { id: memberId },
        })
        res.status(200).json({ status: true});
    }catch(error){
        res.status(500).json({ status: false, message: error.message });
    }
}
  export default { addMember, removeMember }