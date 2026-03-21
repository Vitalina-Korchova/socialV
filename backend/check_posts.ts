import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const count = await prisma.post.count();
    console.log(`Total posts in DB: ${count}`);
    const posts = await prisma.post.findMany({ take: 5, select: { id: true, text_content: true, user_id: true } });
    console.log('Sample posts:', JSON.stringify(posts, null, 2));
    await prisma.$disconnect();
}

main();
