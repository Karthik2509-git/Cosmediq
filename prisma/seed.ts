import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create a Default Branch
  const defaultBranch = await prisma.branch.upsert({
    where: { id: 'default-branch-hsr-layout' },
    update: {},
    create: {
      id: 'default-branch-hsr-layout',
      name: 'Cosmediq HSR Layout',
      address: 'No 456, 17th Cross, Sector 3, HSR Layout, Bengaluru, Karnataka 560102',
      phone: '+91 80 4930 2930',
      email: 'hsr@cosmediq.com',
      isActive: true,
    },
  });
  console.log(`🏥 Branch configured: "${defaultBranch.name}"`);

  // Simple password helper
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = (password: string) => bcrypt.hashSync(password, salt);

  // 2. Create Admin
  const adminEmail = 'admin@cosmediq.com';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashPassword('admin123'),
      name: 'Cosmediq Admin',
      role: Role.ADMIN,
      phone: '+91 99000 11000',
      branchId: defaultBranch.id,
    },
  });
  console.log(`👤 Admin configured: ${adminEmail}`);

  // 3. Create Staff
  const staffEmail = 'staff@cosmediq.com';
  await prisma.user.upsert({
    where: { email: staffEmail },
    update: {},
    create: {
      email: staffEmail,
      passwordHash: hashPassword('staff123'),
      name: 'Sarah receptionist',
      role: Role.STAFF,
      phone: '+91 99000 22000',
      branchId: defaultBranch.id,
    },
  });
  console.log(`👤 Staff configured: ${staffEmail}`);

  // 4. Create Doctor
  const doctorEmail = 'doctor@cosmediq.com';
  const doctorUser = await prisma.user.upsert({
    where: { email: doctorEmail },
    update: {},
    create: {
      email: doctorEmail,
      passwordHash: hashPassword('doctor123'),
      name: 'Dr. Evelyn Carter',
      role: Role.DOCTOR,
      phone: '+91 99000 33000',
      branchId: defaultBranch.id,
    },
  });

  await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      specialization: 'Cosmetic Dermatology & Anti-Aging',
      licenseNumber: 'KMC-84920',
      bio: 'Evelyn Carter is a leading clinical dermatologist specializing in skin rejuvenation, laser treatments, and advanced acne-scar therapies with over 12 years of surgical expertise.',
      consultFee: 700.0,
      experience: 12,
      available: true,
    },
  });
  console.log(`👤 Doctor configured: ${doctorEmail}`);

  // 5. Create Patient
  const patientEmail = 'patient@cosmediq.com';
  const patientUser = await prisma.user.upsert({
    where: { email: patientEmail },
    update: {},
    create: {
      email: patientEmail,
      passwordHash: hashPassword('patient123'),
      name: 'David Patel',
      role: Role.PATIENT,
      phone: '+91 99000 44000',
      branchId: defaultBranch.id,
    },
  });

  await prisma.patientProfile.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      dateOfBirth: new Date('1994-06-20'),
      gender: 'Male',
      bloodGroup: 'B+',
      address: 'Apartment 4B, Emerald Heights, HSR Layout, Bengaluru',
      medicalHistory: 'No major clinical drug allergies. Undergoing routine aesthetic skin analysis.',
      emergencyPhone: '+91 99000 99000',
    },
  });
  console.log(`👤 Patient configured: ${patientEmail}`);

  console.log('✅ Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
