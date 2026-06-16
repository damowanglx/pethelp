import { createConnection } from 'typeorm';

async function runSeed() {
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'pethelp',
    password: process.env.DB_PASSWORD || 'pethelp_dev',
    database: process.env.DB_NAME || 'pethelp',
    entities: [__dirname + '/../src/modules/**/entities/*.entity.ts'],
    synchronize: false,
  });

  console.log('Seeding badge definitions...');
  const badges = require('./badge-definitions.json');
  for (const badge of badges) {
    await connection.query(
      `INSERT IGNORE INTO badge_definitions (badge_key, name, icon, description, rule, category, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [badge.badgeKey, badge.name, badge.icon, badge.description, JSON.stringify(badge.rule), badge.category, badge.sortOrder],
    );
  }
  console.log(`Seeded ${badges.length} badge definitions`);

  console.log('Seeding knowledge base...');
  const { knowledgeCategories, knowledgeArticles } = require('./knowledge-seed');
  for (const cat of knowledgeCategories) {
    await connection.query(
      `INSERT IGNORE INTO knowledge_categories (id, name, icon, parent_id, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [cat.id, cat.name, cat.icon, cat.parentId, cat.sortOrder],
    );
  }
  console.log(`Seeded ${knowledgeCategories.length} knowledge categories`);

  for (const article of knowledgeArticles) {
    await connection.query(
      `INSERT IGNORE INTO knowledge_articles (category_id, title, summary, tags, content, source_type, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, 'curated', 1, NOW())`,
      [article.categoryId, article.title, article.summary, article.tags, article.content],
    );
  }
  console.log(`Seeded ${knowledgeArticles.length} knowledge articles`);

  await connection.close();
  console.log('Seed complete!');
}

runSeed().catch(console.error);
