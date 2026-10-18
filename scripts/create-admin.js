const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Error: MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/create-admin.js');
  process.exit(1);
}

const args = process.argv.slice(2);
const email = (args[0] || 'admin@academicpro.com').toLowerCase().trim();
const password = args[1] || 'admin123456';
const firstName = args[2] || 'Platform';
const lastName = args[3] || 'Admin';

async function main() {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri);

    const usersCollection = mongoose.connection.collection('users');
    const existing = await usersCollection.findOne({ email });

    if (existing) {
      console.log(`User ${email} already exists.`);
      if (existing.role === 'admin') {
        console.log(`User ${email} is already an admin.`);
      } else {
        await usersCollection.updateOne({ _id: existing._id }, { $set: { role: 'admin' } });
        console.log(`Successfully PROMOTED ${email} to admin!`);
      }
    } else {
      console.log(`Creating new admin account: ${email}...`);
      const hashedPassword = await bcrypt.hash(password, 12);
      await usersCollection.insertOne({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Successfully CREATED admin account!`);
      console.log(`Email:    ${email}`);
      console.log(`Password: ${password}`);
    }

    await mongoose.disconnect();
    console.log(`Done! You can now sign in at /auth with these admin credentials.`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(1);
  }
}

main();

