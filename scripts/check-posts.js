const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const posts = await mongoose.connection.collection('posts').find({}).toArray();
  console.log(JSON.stringify(posts.map(p => ({ title: p.title, slug: p.slug, coverImage: p.coverImage })), null, 2));
  process.exit(0);
}

run();
