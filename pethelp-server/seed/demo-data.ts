/**
 * Demo data seeder — creates sample users, pets, requests, reviews for testing
 * Run: npx ts-node seed/demo-data.ts
 */
import { createConnection } from 'typeorm';

async function runDemo() {
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

  console.log('Seeding demo data...');

  // Demo users (INSERT IGNORE so idempotent)
  const users = [
    { openid: 'dev_DevUser', nickname: '小明', role: 'both', creditScore: 85, ratingAvg: 4.7, completedWalks: 23, completionRate: 0.96 },
    { openid: 'dev_Helper', nickname: '遛狗达人阿强', role: 'helper', creditScore: 92, ratingAvg: 4.9, completedWalks: 68, completionRate: 0.98, isHelper: 1 },
    { openid: 'dev_Owner1', nickname: '金毛妈妈', role: 'pet_owner', creditScore: 78, ratingAvg: 4.3, completedWalks: 8 },
    { openid: 'dev_Owner2', nickname: '喵星人铲屎官', role: 'pet_owner', creditScore: 80, ratingAvg: 4.5, completedWalks: 5 },
    { openid: 'dev_Helper2', nickname: '爱心宠物医生', role: 'helper', creditScore: 90, ratingAvg: 4.8, completedWalks: 45, completionRate: 1.0, isHelper: 1 },
  ];

  const userIds: number[] = [];
  for (const u of users) {
    const result = await connection.query(
      `INSERT IGNORE INTO users (openid, nickname, role, credit_score, rating_avg, completed_walks, completion_rate, is_helper)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.openid, u.nickname, u.role, u.creditScore, u.ratingAvg, u.completedWalks, u.completionRate, (u as Record<string,unknown>).isHelper || 0],
    );
    const [existing] = await connection.query('SELECT id FROM users WHERE openid = ?', [u.openid]);
    userIds.push(existing?.id);
  }
  console.log(`Seeded ${users.length} users`);

  // Pets
  const pets = [
    { userId: userIds[0], name: '旺财', species: 'dog', breed: '金毛寻回犬', gender: 'male', weightKg: 32, temperament: '温顺亲人', walkDurationMin: 60 },
    { userId: userIds[0], name: '豆豆', species: 'dog', breed: '泰迪', gender: 'female', weightKg: 5, temperament: '活泼好动', walkDurationMin: 30 },
    { userId: userIds[2], name: '毛毛', species: 'dog', breed: '金毛', gender: 'male', weightKg: 28, temperament: '聪明温顺', walkDurationMin: 45 },
    { userId: userIds[3], name: '咪咪', species: 'cat', breed: '英短蓝猫', gender: 'female', weightKg: 4.5, temperament: '安静粘人' },
    { userId: userIds[3], name: '球球', species: 'cat', breed: '布偶猫', gender: 'male', weightKg: 6, temperament: '优雅亲人', walkDurationMin: 0 },
    { userId: userIds[4], name: '小黑', species: 'dog', breed: '拉布拉多', gender: 'male', weightKg: 35, temperament: '精力旺盛', walkDurationMin: 60 },
  ];

  const petIds: number[] = [];
  for (const p of pets) {
    await connection.query(
      `INSERT IGNORE INTO pets (user_id, name, species, breed, gender, weight_kg, temperament, walk_duration_min)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.userId, p.name, p.species, p.breed, p.gender, p.weightKg, p.temperament, p.walkDurationMin],
    );
    const [existing] = await connection.query('SELECT id FROM pets WHERE name = ? AND user_id = ?', [p.name, p.userId]);
    petIds.push(existing?.id);
  }
  console.log(`Seeded ${pets.length} pets`);

  // Walking requests (some open, some matched)
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const requests = [
    { ownerId: userIds[2], petId: petIds[2], status: 'open', walkDate: tomorrow, startTime: '08:00:00', endTime: '09:00:00', durationMinutes: 60, address: '朝阳区望京SOHO', latitude: 39.9842, longitude: 116.4807, rewardType: 'free', description: '金毛需要每天遛，最好有经验', applyCount: 2 },
    { ownerId: userIds[3], petId: petIds[3], status: 'open', walkDate: tomorrow, startTime: '10:00:00', endTime: '10:30:00', durationMinutes: 30, address: '海淀区中关村软件园', latitude: 40.0508, longitude: 116.2977, rewardType: 'points', description: '猫咪在家无聊，陪玩半小时', applyCount: 1 },
    { ownerId: userIds[0], petId: petIds[0], status: 'in_progress', walkDate: today, startTime: '18:00:00', endTime: '19:00:00', durationMinutes: 60, address: '朝阳区三里屯太古里', latitude: 39.9334, longitude: 116.4552, rewardType: 'free', description: '金毛旺财，喜欢和人互动', applyCount: 3, matchedHelperId: userIds[1] },
    { ownerId: userIds[0], petId: petIds[1], status: 'completed', walkDate: '2026-06-15', startTime: '07:00:00', endTime: '07:30:00', durationMinutes: 30, address: '东城区南锣鼓巷', latitude: 39.9375, longitude: 116.4037, rewardType: 'free', description: '小泰迪，很乖不咬人', applyCount: 1, matchedHelperId: userIds[4] },
  ];

  const requestIds: number[] = [];
  for (const r of requests) {
    await connection.query(
      `INSERT IGNORE INTO walking_requests (owner_id, pet_id, status, walk_date, start_time, end_time, duration_minutes, address, latitude, longitude, reward_type, description, apply_count, matched_helper_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.ownerId, r.petId, r.status, r.walkDate, r.startTime, r.endTime, r.durationMinutes, r.address, r.latitude, r.longitude, r.rewardType, r.description, r.applyCount, (r as Record<string,unknown>).matchedHelperId || null],
    );
    const [existing] = await connection.query('SELECT id FROM walking_requests WHERE owner_id = ? AND pet_id = ? AND walk_date = ?', [r.ownerId, r.petId, r.walkDate]);
    requestIds.push(existing?.id);
  }
  console.log(`Seeded ${requests.length} walking requests`);

  // Matches
  const matches = [
    { requestId: requestIds[0], helperId: userIds[1], status: 'applied', helperMessage: '我养了5年金毛，经验丰富' },
    { requestId: requestIds[0], helperId: userIds[4], status: 'applied', helperMessage: '专业宠物医生，遛狗放心' },
    { requestId: requestIds[1], helperId: userIds[1], status: 'applied', helperMessage: '我也养猫，知道怎么逗猫' },
    { requestId: requestIds[2], helperId: userIds[1], status: 'in_progress', helperMessage: '交给我吧!', ownerMessage: '好的，辛苦啦' },
    { requestId: requestIds[3], helperId: userIds[4], status: 'completed', helperMessage: '我来!', ownerMessage: '谢谢!', trackDistanceM: 2800, trackDurationS: 1800 },
  ];

  for (const m of matches) {
    await connection.query(
      `INSERT IGNORE INTO matches (request_id, helper_id, status, helper_message, owner_message, track_distance_m, track_duration_s)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [m.requestId, m.helperId, m.status, m.helperMessage, m.ownerMessage, (m as Record<string,unknown>).trackDistanceM || null, (m as Record<string,unknown>).trackDurationS || null],
    );
  }
  console.log(`Seeded ${matches.length} matches`);

  // Reviews
  const reviews = [
    { matchId: 5, reviewerId: userIds[4], revieweeId: userIds[0], rating: 5, comment: '非常负责任的宠主，提前准备了牵引绳和零食', tags: JSON.stringify(['准时', '细心', '狗狗很开心']), fromRole: 'helper' },
    { matchId: 5, reviewerId: userIds[0], revieweeId: userIds[4], rating: 5, comment: '专业到位，懂得多，下次还找他', tags: JSON.stringify(['专业', '放心', '准时']), fromRole: 'owner' },
    { matchId: 1, reviewerId: userIds[0], revieweeId: userIds[1], rating: 5, comment: '阿强遛狗特别棒，旺财很喜欢他', tags: JSON.stringify(['有经验', '耐心']), fromRole: 'owner' },
  ];

  for (const r of reviews) {
    await connection.query(
      `INSERT IGNORE INTO review_ratings (match_id, reviewer_id, reviewee_id, rating, comment, tags, from_role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [r.matchId, r.reviewerId, r.revieweeId, r.rating, r.comment, r.tags, r.fromRole],
    );
  }
  console.log(`Seeded ${reviews.length} reviews`);

  await connection.close();
  console.log('Demo data seed complete!');
}

runDemo().catch(console.error);
