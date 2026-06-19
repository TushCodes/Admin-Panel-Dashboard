import 'dotenv/config';

import { getDummyConsignments } from '../test/dummy_consignments.js';
import { withDb } from '../db/connection.js';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    const dummyConsignments = getDummyConsignments();
    
    // Insert consignments
    const created = await withDb(async (prisma) => {
      const result = await prisma.consignment.createMany({
        data: dummyConsignments,
        skipDuplicates: true,
      });
      return result;
    });

    console.log(`✅ Seeded ${created.count} consignments`);
    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

await seed();
