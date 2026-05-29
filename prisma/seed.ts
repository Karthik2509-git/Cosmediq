import { PrismaClient, Role, AppointmentStatus, QueueStatus, InvoiceStatus, NotificationChannel } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Manually load .env variables if not already present in process.env
const loadEnvFile = () => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEqual = trimmed.indexOf('=');
          if (firstEqual !== -1) {
            const key = trimmed.slice(0, firstEqual).trim();
            let value = trimmed.slice(firstEqual + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('⚠️ Failed to manually load .env file:', err);
  }
};

loadEnvFile();

const getDirectPostgresUrl = (url: string | undefined): string => {
  const defaultUrl = 'postgresql://postgres:password@localhost:5432/cosmediq?schema=public';
  if (!url) return defaultUrl;
  if (url.startsWith('prisma+postgres://')) {
    try {
      const urlObj = new URL(url);
      const apiKey = urlObj.searchParams.get('api_key');
      if (apiKey) {
        const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString('utf-8'));
        if (decoded && decoded.databaseUrl) {
          console.log('🔌 [Seeder Connection] Decoded direct postgres URL from API key.');
          return decoded.databaseUrl;
        }
      }
    } catch (e) {
      console.error('❌ Failed to decode prisma+postgres DATABASE_URL:', e);
    }
  }
  return url;
};

// Setup PostgreSQL client connection matching src/lib/db.ts
const rawUrl = process.env.DATABASE_URL;
const connectionString = getDirectPostgresUrl(rawUrl);
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });



async function main() {
  console.log('🌱 [Cosmediq Seeder] Initiating high-fidelity clinical demo seeding...');

  // 1. Create a Default Branch
  const defaultBranch = await prisma.branch.upsert({
    where: { id: 'default-branch-hsr-layout' },
    update: {},
    create: {
      id: 'default-branch-hsr-layout',
      name: 'Cosmediq Premium Skin Clinic',
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
  const passwordHash = hashPassword('patient123'); // Safe unified password for demo logins
  const staffHash = hashPassword('staff123');
  const doctorHash = hashPassword('doctor123');
  const adminHash = hashPassword('admin123');

  // 2. Create Admin / Owner
  const adminEmail = 'admin@cosmediq.com';
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      name: 'Dr. Amit Shah (Clinic Director)',
      role: Role.ADMIN,
      phone: '+91 99000 11000',
      branchId: defaultBranch.id,
    },
  });
  console.log(`👤 Admin configured: ${adminEmail}`);

  // 3. Create Staff
  const staffEmail = 'staff@cosmediq.com';
  const staffUser = await prisma.user.upsert({
    where: { email: staffEmail },
    update: {},
    create: {
      email: staffEmail,
      passwordHash: staffHash,
      name: 'Sarah Receptionist',
      role: Role.STAFF,
      phone: '+91 99000 22000',
      branchId: defaultBranch.id,
    },
  });

  const coordEmail = 'coordinator@cosmediq.com';
  const coordUser = await prisma.user.upsert({
    where: { email: coordEmail },
    update: {},
    create: {
      email: coordEmail,
      passwordHash: staffHash,
      name: 'Priya Das (Clinic Coordinator)',
      role: Role.STAFF,
      phone: '+91 99000 22111',
      branchId: defaultBranch.id,
    },
  });
  console.log(`👤 Staff & Coordinators configured.`);

  // 4. Create 4 Skincare Specialists
  const docsData = [
    {
      email: 'doctor@cosmediq.com',
      name: 'Dr. Evelyn Carter',
      spec: 'Cosmetic Dermatology & Anti-Aging',
      license: 'KMC-84920',
      fee: 700.0,
      bio: 'Dr. Evelyn Carter is a board-certified cosmetic dermatologist with over 12 years of clinical expertise in non-surgical laser resurfacing, liquid facelifts, and cellular skin rejuvenation.',
    },
    {
      email: 'dr.jenkins@cosmediq.com',
      name: 'Dr. Sarah Jenkins',
      spec: 'Acne Care & Laser Skin Rejuvenation',
      license: 'KMC-92841',
      fee: 650.0,
      bio: 'Dr. Sarah Jenkins specializes in pediatric and adult acne-scar clinical therapies, micro-needling treatments, and hormonal skin management.',
    },
    {
      email: 'dr.sharma@cosmediq.com',
      name: 'Dr. Aravind Sharma',
      spec: 'Advanced Skincare & Chemical Peels',
      license: 'KMC-73820',
      fee: 600.0,
      bio: 'Dr. Aravind Sharma is an expert in clinical chemical peels, epidermal barrier restoration, and comprehensive diagnostic skin allergy tests.',
    },
    {
      email: 'dr.kapoor@cosmediq.com',
      name: 'Dr. Rohan Kapoor',
      spec: 'Hair Restoration & Medical Trichology',
      license: 'KMC-62940',
      fee: 750.0,
      bio: 'Dr. Rohan Kapoor is a leading specialist in PRP hair restoration therapies, scalp micro-pigmentation, and advanced alopecia diagnoses.',
    },
  ];

  const doctorsCreated = [];
  for (const doc of docsData) {
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {},
      create: {
        email: doc.email,
        passwordHash: doctorHash,
        name: doc.name,
        role: Role.DOCTOR,
        phone: '+91 99000 33000',
        branchId: defaultBranch.id,
      },
    });

    const docProf = await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        specialization: doc.spec,
        licenseNumber: doc.license,
        bio: doc.bio,
        consultFee: doc.fee,
        experience: 8 + Math.floor(Math.random() * 8),
        available: true,
      },
    });
    doctorsCreated.push({ user, profile: docProf });
  }
  console.log(`👤 4 Skin & Hair Specialists configured successfully.`);

  // 5. Create 25 Realistic Skincare Patients (Indian names and demographics)
  const patientsData = [
    { email: 'patient@cosmediq.com', name: 'David Patel', dob: '1994-06-20', gender: 'Male', blood: 'B+', phone: '+91 99111 22333' },
    { email: 'ananya@cosmediq.com', name: 'Ananya Rao', dob: '1998-09-12', gender: 'Female', blood: 'O+', phone: '+91 99222 33444' },
    { email: 'rohan@cosmediq.com', name: 'Rohan Malhotra', dob: '1990-03-05', gender: 'Male', blood: 'A+', phone: '+91 99333 44555' },
    { email: 'priya@cosmediq.com', name: 'Priya Sen', dob: '1995-11-22', gender: 'Female', blood: 'AB+', phone: '+91 99444 55666' },
    { email: 'vikram@cosmediq.com', name: 'Vikram Hegde', dob: '1987-04-18', gender: 'Male', blood: 'O-', phone: '+91 99555 66777' },
    { email: 'meera@cosmediq.com', name: 'Meera Krishnan', dob: '2001-07-30', gender: 'Female', blood: 'B-', phone: '+91 99666 77888' },
    { email: 'karan@cosmediq.com', name: 'Karan Johar', dob: '1993-12-15', gender: 'Male', blood: 'A-', phone: '+91 99777 88999' },
    { email: 'sneha@cosmediq.com', name: 'Sneha Reddy', dob: '1996-01-25', gender: 'Female', blood: 'AB-', phone: '+91 99888 99000' },
    { email: 'amit.shah@cosmediq.com', name: 'Amit Shah Jr.', dob: '1989-05-08', gender: 'Male', blood: 'B+', phone: '+91 99999 11111' },
    { email: 'kavitha@cosmediq.com', name: 'Kavitha Murthy', dob: '1992-08-14', gender: 'Female', blood: 'O+', phone: '+91 99000 44332' },
    { email: 'divya@cosmediq.com', name: 'Divya Sharma', dob: '1997-02-18', gender: 'Female', blood: 'A+', phone: '+91 98765 43210' },
    { email: 'arjun@cosmediq.com', name: 'Arjun Verma', dob: '1991-10-09', gender: 'Male', blood: 'O+', phone: '+91 98888 77777' },
    { email: 'neha@cosmediq.com', name: 'Neha Gupta', dob: '1994-07-14', gender: 'Female', blood: 'B+', phone: '+91 97777 66666' },
    { email: 'sanjay@cosmediq.com', name: 'Sanjay Dutt', dob: '1985-04-29', gender: 'Male', blood: 'AB-', phone: '+91 96666 55555' },
    { email: 'aisha@cosmediq.com', name: 'Aisha Patel', dob: '1999-12-05', gender: 'Female', blood: 'A-', phone: '+91 95555 44444' },
    { email: 'rahul.d@cosmediq.com', name: 'Rahul Dravid', dob: '1988-01-11', gender: 'Male', blood: 'O+', phone: '+91 94444 33333' },
    { email: 'shruthi@cosmediq.com', name: 'Shruthi Gowda', dob: '1996-05-23', gender: 'Female', blood: 'B+', phone: '+91 93333 22222' },
    { email: 'manoj@cosmediq.com', name: 'Manoj Kumar', dob: '1992-03-17', gender: 'Male', blood: 'AB+', phone: '+91 92222 11111' },
    { email: 'aditi@cosmediq.com', name: 'Aditi Rao', dob: '1995-08-30', gender: 'Female', blood: 'O-', phone: '+91 91111 00000' },
    { email: 'pranav@cosmediq.com', name: 'Pranav Nair', dob: '1993-11-04', gender: 'Male', blood: 'A+', phone: '+91 90000 99999' },
    { email: 'siddharth@cosmediq.com', name: 'Siddharth Sen', dob: '1990-09-15', gender: 'Male', blood: 'B-', phone: '+91 98989 89898' },
    { email: 'rachel@cosmediq.com', name: 'Rachel Green', dob: '1994-05-05', gender: 'Female', blood: 'AB+', phone: '+91 97979 79797' },
    { email: 'tony.stark@cosmediq.com', name: 'Tony Stark', dob: '1982-05-29', gender: 'Male', blood: 'A+', phone: '+91 96969 69696' },
    { email: 'jane.smith@cosmediq.com', name: 'Jane Smith', dob: '1997-04-12', gender: 'Female', blood: 'O+', phone: '+91 95959 59595' },
    { email: 'bruce.wayne@cosmediq.com', name: 'Bruce Wayne', dob: '1986-02-19', gender: 'Male', blood: 'AB-', phone: '+91 94949 49494' },
  ];

  const patientsCreated = [];
  for (const pat of patientsData) {
    const user = await prisma.user.upsert({
      where: { email: pat.email },
      update: {},
      create: {
        email: pat.email,
        passwordHash,
        name: pat.name,
        role: Role.PATIENT,
        phone: pat.phone,
        branchId: defaultBranch.id,
      },
    });

    const patProf = await prisma.patientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        dateOfBirth: new Date(pat.dob),
        gender: pat.gender,
        bloodGroup: pat.blood,
        address: `${pat.name} Residency, Sector 4, HSR Layout, Bengaluru`,
        medicalHistory: 'Enrolled in active digital dermatology clinical trials. No major known systemic drug allergies.',
        emergencyPhone: '+91 99000 99999',
      },
    });
    patientsCreated.push({ user, profile: patProf });
  }
  console.log(`👤 25 Patients registered and profiles configured in the database.`);

  const docCarter = doctorsCreated[0].profile; // Dr. Evelyn Carter
  const docJenkins = doctorsCreated[1].profile; // Dr. Sarah Jenkins
  const docSharma = doctorsCreated[2].profile; // Dr. Aravind Sharma
  const docKapoor = doctorsCreated[3].profile; // Dr. Rohan Kapoor

  const patDavid = patientsCreated[0].profile; // David Patel
  const patAnanya = patientsCreated[1].profile; // Ananya Rao
  const patRohan = patientsCreated[2].profile; // Rohan Malhotra
  const patPriya = patientsCreated[3].profile; // Priya Sen
  const patVikram = patientsCreated[4].profile; // Vikram Hegde

  // 6. Seed High-Fidelity Historical Skincare Journeys
  console.log('💊 Seeding detailed multi-visit clinical skincare journeys...');

  // ==========================================
  // JOURNEY 1: Ananya Rao (Acne Treatment Patient)
  // Journey: Initial consultation → Medication → 15-day follow-up → Progress improvement → Final review
  // ==========================================
  console.log(' - Seeding Acne Treatment Journey: Ananya Rao...');
  
  // Visit 1: Initial consultation (30 Days Ago)
  const ananyaAppt1 = await prisma.appointment.create({
    data: {
      dateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: AppointmentStatus.COMPLETED,
      reason: 'Inflammatory papulopustular acne breakout evaluation',
      tokenNumber: 'A-01',
      queueStatus: QueueStatus.DONE,
      branchId: defaultBranch.id,
      patientId: patAnanya.id,
      doctorId: docJenkins.id,
    },
  });

  await prisma.consultation.create({
    data: {
      appointmentId: ananyaAppt1.id,
      diagnosis: 'Moderate Inflammatory Acne Vulgaris (Grade II)',
      notes: 'Active papules and localized pustules present on bilateral malar region. Grade II severity. Mild sebum hyper-secretion. Epidermal moisture levels moderate (48%). Advised a non-stripping gentle foam wash and strict daytime UV shielding.',
      prescription: [
        { name: 'Adapalene 0.1% / Benzoyl Peroxide 2.5% Gel', frequency: 'Once daily', timing: 'Night application after wash', days: 15 },
        { name: 'Cetaphil Gentle Skin Cleanser', frequency: 'Twice daily', timing: 'Morning & Night wash', days: 30 },
        { name: 'SPF 50 Sebum Control Matte Gel Sunscreen', frequency: 'Three times daily', timing: 'Daytime application', days: 30 }
      ],
      followUpDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Follow-up was due 15 days ago
    },
  });

  await prisma.invoice.create({
    data: {
      patientId: patAnanya.id,
      appointmentId: ananyaAppt1.id,
      amount: 650.0,
      paidAmount: 650.0,
      status: InvoiceStatus.PAID,
      paymentMethod: 'CARD',
      paidDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Dermatologist Specialist Consultation Fee', price: 650 }
      ]
    },
  });

  // Visit 2: 15-day follow-up (15 Days Ago)
  const ananyaAppt2 = await prisma.appointment.create({
    data: {
      dateTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: AppointmentStatus.COMPLETED,
      reason: '15-day acne progression and tolerance assessment',
      tokenNumber: 'A-04',
      queueStatus: QueueStatus.DONE,
      branchId: defaultBranch.id,
      patientId: patAnanya.id,
      doctorId: docJenkins.id,
    },
  });

  await prisma.consultation.create({
    data: {
      appointmentId: ananyaAppt2.id,
      diagnosis: 'Acne Vulgaris - Phase 2 Retinoid Tolerance achieved',
      notes: 'Dramatically reduced inflammatory pustules on malar region. Transient dryness and localized retinoid-induced scaling noted on chin region. Patient has been highly compliant. Progress improvement of 40% observed. Advised addition of hyaluronic serum to mitigate epidermal flaking.',
      prescription: [
        { name: 'Adapalene 0.1% / Benzoyl Peroxide 2.5% Gel', frequency: 'Once daily', timing: 'Night application (alternate nights)', days: 15 },
        { name: 'Hyaluronic Acid Hydrating Serum (2%)', frequency: 'Twice daily', timing: 'Under sunscreen and barrier cream', days: 15 },
        { name: 'SPF 50 Sebum Control Matte Gel Sunscreen', frequency: 'Three times daily', timing: 'Daytime application', days: 30 }
      ],
      followUpDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Final review due tomorrow/today
    },
  });

  await prisma.invoice.create({
    data: {
      patientId: patAnanya.id,
      appointmentId: ananyaAppt2.id,
      amount: 650.0,
      paidAmount: 650.0,
      status: InvoiceStatus.PAID,
      paymentMethod: 'UPI',
      paidDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Acne Follow-up Progress Assessment Fee', price: 650 }
      ]
    },
  });

  // Visit 3: Final Review (Today - Active Consultation Queue!)
  await prisma.appointment.create({
    data: {
      dateTime: new Date(),
      status: AppointmentStatus.CONFIRMED,
      reason: 'Final Acne clearance and maintenance protocol review',
      tokenNumber: 'A-02',
      queueStatus: QueueStatus.CONSULTING, // Doctor is seeing her right now
      branchId: defaultBranch.id,
      patientId: patAnanya.id,
      doctorId: docJenkins.id,
    },
  });

  // ==========================================
  // JOURNEY 2: Priya Sen (Chemical Peel Patient)
  // Journey: Consultation → Procedure → Post-treatment care → Review visit
  // ==========================================
  console.log(' - Seeding Chemical Peel Journey: Priya Sen...');

  // Visit 1: Consultation (10 Days Ago)
  const priyaAppt1 = await prisma.appointment.create({
    data: {
      dateTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: AppointmentStatus.COMPLETED,
      reason: 'Epidermal hyperpigmentation and melasma evaluation',
      tokenNumber: 'P-03',
      queueStatus: QueueStatus.DONE,
      branchId: defaultBranch.id,
      patientId: patPriya.id,
      doctorId: docSharma.id,
    },
  });

  await prisma.consultation.create({
    data: {
      appointmentId: priyaAppt1.id,
      diagnosis: 'Aesthetic Melasma & Superficial Post-Inflammatory Hyperpigmentation',
      notes: 'Symmetrical hyperpigmented patches on cheek bone region and forehead. Diagnosed as superficial melasma. Approved for safe clinical glycolic peeling therapy. No active skin infections or open wounds. Instructed to stop all retinols 3 days prior.',
      prescription: [
        { name: 'Glycolic Acid Gentle Pre-Peel Foaming Cleanser', frequency: 'Twice daily', timing: 'Prep wash morning & night', days: 10 }
      ],
      followUpDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.invoice.create({
    data: {
      patientId: patPriya.id,
      appointmentId: priyaAppt1.id,
      amount: 600.0,
      paidAmount: 600.0,
      status: InvoiceStatus.PAID,
      paymentMethod: 'UPI',
      paidDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Dermatologist Specialist Consultation Fee', price: 600 }
      ]
    },
  });

  // Visit 2: Peel Procedure (8 Days Ago)
  const priyaAppt2 = await prisma.appointment.create({
    data: {
      dateTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      status: AppointmentStatus.COMPLETED,
      reason: 'First session of 35% Glycolic Acid Chemical Peel',
      tokenNumber: 'P-01',
      queueStatus: QueueStatus.DONE,
      branchId: defaultBranch.id,
      patientId: patPriya.id,
      doctorId: docSharma.id,
    },
  });

  await prisma.consultation.create({
    data: {
      appointmentId: priyaAppt2.id,
      diagnosis: 'Chemical Peeling - 35% Glycolic Acid administered',
      notes: 'Procedure tolerated exceptionally well with zero complications. Neutralization completed within 3.5 minutes. Mild transient post-peel flaking and skin tightness expected. Advised rigorous application of physical sun shielding. No manual scrubbing or peeling of skin permitted.',
      prescription: [
        { name: 'Lipid Barrier Recovery Cream with Ceramides', frequency: 'Three times daily', timing: 'Heavy application to dry skin', days: 10 },
        { name: 'SPF 50 Tinted Mineral Sunblock', frequency: 'Three times daily', timing: 'Every 4 hours during daylight', days: 30 }
      ],
      followUpDate: new Date(), // Due today!
    },
  });

  // PARTIAL INVOICE: Priya Sen paid Rs 1000 out of Rs 1800 to demonstrate partial payments
  await prisma.invoice.create({
    data: {
      patientId: patPriya.id,
      appointmentId: priyaAppt2.id,
      amount: 1800.0,
      paidAmount: 1000.0,
      status: InvoiceStatus.PARTIALLY_PAID,
      paymentMethod: 'CASH',
      paidDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Dermatology Glycolic Peeling Procedure Fee', price: 1800 }
      ]
    },
  });

  // Visit 3: Today's Review Visit (Today - Active Waiting Queue)
  await prisma.appointment.create({
    data: {
      dateTime: new Date(),
      status: AppointmentStatus.CONFIRMED,
      reason: 'Post-Peel superficial flaking & recovery review visit',
      tokenNumber: 'C-03',
      queueStatus: QueueStatus.WAITING, // Waiting in queue
      branchId: defaultBranch.id,
      patientId: patPriya.id,
      doctorId: docSharma.id,
    },
  });


  // ==========================================
  // JOURNEY 3: David Patel (Laser Treatment Patient)
  // Journey: Consultation → Session 1 → Session 2 → Progress tracking
  // ==========================================
  console.log(' - Seeding Laser Treatment Journey: David Patel...');

  // Visit 1: Consultation (20 Days Ago)
  const davidAppt1 = await prisma.appointment.create({
    data: {
      dateTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      status: AppointmentStatus.COMPLETED,
      reason: 'Laser eligibility and epidermal moisture assessment',
      tokenNumber: 'D-02',
      queueStatus: QueueStatus.DONE,
      branchId: defaultBranch.id,
      patientId: patDavid.id,
      doctorId: docCarter.id,
    },
  });

  await prisma.consultation.create({
    data: {
      appointmentId: davidAppt1.id,
      diagnosis: 'Epidermal Moisture Impairment & Dehydration',
      notes: 'Initial skin electrical hydration test registers at a dry 38% water retention. Severe barrier dryness will trigger laser-induced PIH. Cleared for laser only after a 10-day intensive cellular lipid recovery regimen.',
      prescription: [
        { name: 'Ceramide Moisture Barrier Rebuilder Cream', frequency: 'Twice daily', timing: 'Apply heavy layers morning & night', days: 10 },
        { name: 'SPF 50 Physical Gel Sunblock', frequency: 'Three times daily', timing: 'Apply every 3 hours outdoors', days: 20 }
      ],
      followUpDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.invoice.create({
    data: {
      patientId: patDavid.id,
      appointmentId: davidAppt1.id,
      amount: 700.0,
      paidAmount: 700.0,
      status: InvoiceStatus.PAID,
      paymentMethod: 'UPI',
      paidDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Dermatologist Specialist Consultation Fee', price: 700 }
      ]
    },
  });

  // Visit 2: Laser Session 1 (10 Days Ago)
  const davidAppt2 = await prisma.appointment.create({
    data: {
      dateTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: AppointmentStatus.COMPLETED,
      reason: 'Session 1: Q-Switched Nd:YAG Laser Resurfacing',
      tokenNumber: 'D-01',
      queueStatus: QueueStatus.DONE,
      branchId: defaultBranch.id,
      patientId: patDavid.id,
      doctorId: docCarter.id,
    },
  });

  await prisma.consultation.create({
    data: {
      appointmentId: davidAppt2.id,
      diagnosis: 'Completed Laser Session 1 - Epidermal suitability passed',
      notes: 'Hydration assessment checks showing 52% water retention. Session 1 of Q-Switched Nd:YAG (1064nm) laser resurfacing completed smoothly. Patient reported mild transient warmth. Post-laser erythema rating: Mild. Advised immediate cooling soothing gels and sunblock.',
      prescription: [
        { name: 'Aesthetic Aloe Vera Soothing Recovery Gel', frequency: 'Four times daily', timing: 'Keep refrigerated and apply cold', days: 5 },
        { name: 'Lipid Barrier Recovery Cream with Ceramides', frequency: 'Twice daily', timing: 'Morning and night layer', days: 15 }
      ],
      followUpDate: new Date(), // Session 2 due today
    },
  });

  await prisma.invoice.create({
    data: {
      patientId: patDavid.id,
      appointmentId: davidAppt2.id,
      amount: 3500.0,
      paidAmount: 3500.0,
      status: InvoiceStatus.PAID,
      paymentMethod: 'CARD',
      paidDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Q-Switched Nd:YAG Laser Toning Session Fee', price: 3500 }
      ]
    },
  });

  // Visit 3: Session 2 (Today - Active Consultation Queue)
  await prisma.appointment.create({
    data: {
      dateTime: new Date(),
      status: AppointmentStatus.CONFIRMED,
      reason: 'Session 2: Laser toning & pigment scar tracking review',
      tokenNumber: 'C-02',
      queueStatus: QueueStatus.CONSULTING, // In consulting room
      branchId: defaultBranch.id,
      patientId: patDavid.id,
      doctorId: docCarter.id,
    },
  });


  // ==========================================
  // JOURNEY 4: Vikram Hegde (General Skin Consultation)
  // Journey: Doctor review → Prescription → Follow-up
  // ==========================================
  console.log(' - Seeding General Consultation Journey: Vikram Hegde...');

  // Visit 1: Doctor Review & Prescribe (3 Days Ago)
  const vikramAppt1 = await prisma.appointment.create({
    data: {
      dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: AppointmentStatus.COMPLETED,
      reason: 'Acute skin redness, intense itching & scaling on neck',
      tokenNumber: 'V-05',
      queueStatus: QueueStatus.DONE,
      branchId: defaultBranch.id,
      patientId: patVikram.id,
      doctorId: docSharma.id,
    },
  });

  await prisma.consultation.create({
    data: {
      appointmentId: vikramAppt1.id,
      diagnosis: 'Acute Allergic Contact Dermatitis',
      notes: 'Erythematous pruritic eczematous patches on anterior aspect of neck. Suspect synthetic allergen from a newly introduced cologne/cosmetic spray. Prescribed safe mild topical corticosteroid and strict allergen avoidance. Heavy moisturizing advised.',
      prescription: [
        { name: 'Mometasone Furoate 0.1% Cream', frequency: 'Once daily', timing: 'Thin layer night application', days: 5 },
        { name: 'Cetaphil Hydrating Moisturizing Lotion', frequency: 'Three times daily', timing: 'Apply freely over neck region', days: 10 }
      ],
      followUpDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Due in 4 days
    },
  });

  await prisma.invoice.create({
    data: {
      patientId: patVikram.id,
      appointmentId: vikramAppt1.id,
      amount: 600.0,
      paidAmount: 600.0,
      status: InvoiceStatus.PAID,
      paymentMethod: 'CASH',
      paidDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Dermatologist Specialist Consultation Fee', price: 600 }
      ]
    },
  });

  // Future follow-up scheduled (Confirmed in 4 days)
  await prisma.appointment.create({
    data: {
      dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: AppointmentStatus.CONFIRMED,
      reason: 'Dermatitis flare-up clearance assessment and steroid exit strategy',
      branchId: defaultBranch.id,
      patientId: patVikram.id,
      doctorId: docSharma.id,
    },
  });


  // ==========================================
  // JOURNEY 5: Rohan Malhotra (Returning Patient)
  // Journey: multiple visits, consultation history, payment history
  // ==========================================
  console.log(' - Seeding Returning Patient Journey: Rohan Malhotra...');

  // Visit 1: 45 Days Ago
  const rohanAppt1 = await prisma.appointment.create({
    data: {
      dateTime: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      status: AppointmentStatus.COMPLETED,
      reason: 'Subacute eczematous dry lesions consultation',
      tokenNumber: 'R-01',
      queueStatus: QueueStatus.DONE,
      branchId: defaultBranch.id,
      patientId: patRohan.id,
      doctorId: docCarter.id,
    },
  });

  await prisma.consultation.create({
    data: {
      appointmentId: rohanAppt1.id,
      diagnosis: 'Subacute Dry Xerotic Eczema',
      notes: 'Severe epidermal dryness, pruritic dry scaly patches on bilateral extensor shins. Prescribed intensive cellular moisturization and mild class-IV topical steroid to break the itch-scratch cycle.',
      prescription: [
        { name: 'Hydrocortisone 1% Soothing Cream', frequency: 'Twice daily', timing: 'Thin layer for pruritic patches', days: 7 },
        { name: 'Venezia Hydration Urea Barrier Cream (10%)', frequency: 'Three times daily', timing: 'Freely over arms and legs', days: 30 }
      ],
      followUpDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.invoice.create({
    data: {
      patientId: patRohan.id,
      appointmentId: rohanAppt1.id,
      amount: 700.0,
      paidAmount: 700.0,
      status: InvoiceStatus.PAID,
      paymentMethod: 'CASH',
      paidDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Dermatologist Specialist Consultation Fee', price: 700 }
      ]
    },
  });

  // Visit 2: 30 Days Ago
  const rohanAppt2 = await prisma.appointment.create({
    data: {
      dateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: AppointmentStatus.COMPLETED,
      reason: 'Eczema follow-up and skin barrier hydration test',
      tokenNumber: 'R-03',
      queueStatus: QueueStatus.DONE,
      branchId: defaultBranch.id,
      patientId: patRohan.id,
      doctorId: docCarter.id,
    },
  });

  await prisma.consultation.create({
    data: {
      appointmentId: rohanAppt2.id,
      diagnosis: 'Eczema Progress - Barrier Restoration Stage',
      notes: 'Pruritic patches completely resolved. Skin barrier showing exceptional repair. Dry scaling diminished by 80%. Instructed to terminate topical steroid immediately. Maintenance routine set to moisturizing urea creams.',
      prescription: [
        { name: 'Venezia Hydration Urea Barrier Cream (10%)', frequency: 'Twice daily', timing: 'Apply morning & night wash', days: 30 }
      ],
      followUpDate: new Date(),
    },
  });

  await prisma.invoice.create({
    data: {
      patientId: patRohan.id,
      appointmentId: rohanAppt2.id,
      amount: 700.0,
      paidAmount: 700.0,
      status: InvoiceStatus.PAID,
      paymentMethod: 'UPI',
      paidDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      items: [
        { name: 'Dermatologist Specialist Consultation Fee', price: 700 }
      ]
    },
  });

  // Visit 3: Today (Active Queue - Waiting with Token C-01)
  await prisma.appointment.create({
    data: {
      dateTime: new Date(),
      status: AppointmentStatus.CONFIRMED,
      reason: 'Returning eczema assessment: xerosis maintenance feedback',
      tokenNumber: 'C-01',
      queueStatus: QueueStatus.WAITING, // Waiting in queue
      branchId: defaultBranch.id,
      patientId: patRohan.id,
      doctorId: docCarter.id,
    },
  });

  // ==========================================
  // OTHER APPOINTMENTS & QUEUES
  // ==========================================
  console.log('⏰ Seeding daily appointment queues and future bookings...');

  // Active walk-in patient in waiting room (Meera Krishnan)
  const patMeera = patientsCreated[5].profile;
  await prisma.appointment.create({
    data: {
      dateTime: new Date(),
      status: AppointmentStatus.CONFIRMED,
      reason: 'PRP scalp therapy pre-op diagnostic assessment',
      tokenNumber: 'C-04',
      queueStatus: QueueStatus.WAITING,
      branchId: defaultBranch.id,
      patientId: patMeera.id,
      doctorId: docKapoor.id,
    },
  });

  // Patient requested Callback tomorrow from Portal:
  // Ananya Rao portal request (Patient cannot self-book, receptionist calls back)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await prisma.appointment.create({
    data: {
      dateTime: tomorrow,
      status: AppointmentStatus.REQUESTED,
      reason: '[Portal Callback Requested]: Rapid chin flaking flare-up, needs Jenkins consultation advice.',
      branchId: defaultBranch.id,
      patientId: patAnanya.id,
      doctorId: docJenkins.id,
    },
  });

  // Manoj Kumar portal callback request
  const patManoj = patientsCreated[17].profile;
  await prisma.appointment.create({
    data: {
      dateTime: tomorrow,
      status: AppointmentStatus.REQUESTED,
      reason: '[Portal Callback Requested]: Severe scalp irritation and hair thinning consult request.',
      branchId: defaultBranch.id,
      patientId: patManoj.id,
      doctorId: docKapoor.id,
    },
  });

  // Future Confirmed Bookings (2 Days Later)
  const twoDaysLater = new Date();
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);
  // Divya Sharma scheduled
  const patDivya = patientsCreated[10].profile;
  await prisma.appointment.create({
    data: {
      dateTime: twoDaysLater,
      status: AppointmentStatus.CONFIRMED,
      reason: 'PRP hair restoration treatment session 1',
      branchId: defaultBranch.id,
      patientId: patDivya.id,
      doctorId: docKapoor.id,
    },
  });

  // ==========================================
  // 7. Seed Medical Files (PDFs and Scans)
  // ==========================================
  console.log('📂 Seeding high-fidelity clinical diagnostic attachments...');

  // David Patel Skin Recovery PDF
  await prisma.medicalRecord.create({
    data: {
      patientId: patDavid.id,
      doctorId: docCarter.id,
      fileName: 'David_Skin_Moisture_Recovery_Chart.pdf',
      fileUrl: '/mock/scans/skin_barrier_test.pdf',
      fileType: 'PDF',
      fileSize: 2048576, // 2MB
      description: 'Moisture assessment logs mapping initial 38% dry dehydration recovery up to 52% prior to Session 1 Laser toning suitability check.',
    },
  });

  // Ananya Rao Microscopic Acne Scan Image
  await prisma.medicalRecord.create({
    data: {
      patientId: patAnanya.id,
      doctorId: docJenkins.id,
      fileName: 'Ananya_Cheek_Pustule_MicroScan.jpg',
      fileUrl: '/mock/scans/acne_lesions_micro.jpg',
      fileType: 'SCAN',
      fileSize: 1048576, // 1MB
      description: 'Micro-zoom photograph documenting grade II inflammatory pustules on bilateral malar region before starting the topical retinoid routine.',
    },
  });

  // Rohan Malhotra Skin Histology PDF
  await prisma.medicalRecord.create({
    data: {
      patientId: patRohan.id,
      doctorId: docCarter.id,
      fileName: 'Rohan_Epidermal_Histology_Assessment.pdf',
      fileUrl: '/mock/scans/histology_barrier.pdf',
      fileType: 'PDF',
      fileSize: 4194304, // 4MB
      description: 'Subacute dry xerotic eczema histology scan detailing parakeratosis and spongiosis changes in extensor shins.',
    },
  });

  // ==========================================
  // 8. Seed Itemized Invoices (Paid / Pending / Unpaid)
  // ==========================================
  console.log('🧾 Seeding realistic billing ledger entries...');

  // Fully Paid Complex Invoice - Vikram Hegde (3 Days ago)
  // Confirmed CASH payment
  // Already seeded under vikramAppt1

  // Unpaid Invoice - Karan Johar
  const patKaran = patientsCreated[6].profile;
  await prisma.invoice.create({
    data: {
      patientId: patKaran.id,
      amount: 1500.0,
      paidAmount: 0.0,
      status: InvoiceStatus.UNPAID,
      items: [
        { name: 'Advanced Scalp Sebum Purifying Treatment', price: 1500 }
      ],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 Days old
    },
  });

  // Partially Paid - Priya Sen
  // Already seeded under priyaAppt2 (Glycolic peel procedure)

  // ==========================================
  // 9. Seed Compliance Audit Logs
  // ==========================================
  console.log('🛡️ Seeding clinic system security compliance audit trails...');
  const auditLogs = [
    { action: 'PATIENT_REGISTER', type: 'PatientProfile', id: patDavid.id, details: { name: 'David Patel', action: 'Walk-in registration by staff Sarah' } },
    { action: 'PATIENT_REGISTER', type: 'PatientProfile', id: patAnanya.id, details: { name: 'Ananya Rao', action: 'Online signup from public portal' } },
    { action: 'APPOINTMENT_CREATE', type: 'Appointment', id: ananyaAppt1.id, details: { patient: 'Ananya Rao', doc: 'Dr. Sarah Jenkins', action: 'Appointment booked successfully' } },
    { action: 'CONSULTATION_FINALIZE', type: 'Consultation', id: ananyaAppt1.id, details: { diagnosis: 'Moderate Inflammatory Acne Vulgaris', doctor: 'Dr. Sarah Jenkins', action: 'Consultation finalized & prescription signed' } },
    { action: 'BILLING_INVOICE_CREATE', type: 'Invoice', id: priyaAppt2.id, details: { amount: 1800, patient: 'Priya Sen', action: 'Chemical peel procedure invoice generated' } },
    { action: 'BILLING_PAYMENT_RECORD', type: 'Invoice', id: priyaAppt2.id, details: { paid: 1000, balance: 800, method: 'CASH', action: 'Partial payment logged' } },
    { action: 'PATIENT_RECORD_DOWNLOAD', type: 'MedicalRecord', id: patDavid.id, details: { recordName: 'David_Skin_Moisture_Recovery_Chart.pdf', ip: '192.168.1.45', action: 'PDF diagnostic report accessed by patient portal' } },
  ];

  for (const aud of auditLogs) {
    await prisma.auditLog.create({
      data: {
        userId: staffUser.id, // Sarah Receptionist logged actions
        action: aud.action,
        entityType: aud.type,
        entityId: aud.id,
        newValue: aud.details,
        ipAddress: '192.168.1.100',
      },
    });
  }

  // ==========================================
  // 10. Seed Smart In-App Alert Notifications
  // ==========================================
  console.log('🔔 Seeding smart patient dashboard in-app alert notifications...');

  // Tomorrow appointment notification
  await prisma.notification.create({
    data: {
      userId: patAnanya.userId,
      title: 'Appointment Scheduled Tomorrow',
      message: 'Reminder: Your follow-up appointment with Dr. Sarah Jenkins is scheduled for tomorrow at 10:30 AM. Please arrive 10 minutes early.',
      category: 'appointment',
      channel: NotificationChannel.IN_APP,
      entityId: ananyaAppt2.id,
      dateKey: '2026-05-30'
    },
  });

  // Overdue follow-up alert for Ananya
  await prisma.notification.create({
    data: {
      userId: patAnanya.userId,
      title: 'Dermatology Follow-up Overdue',
      message: 'Critical: Retinoid tolerance follow-up is recommended to review localized skin flaking. Please verify queue availability.',
      category: 'follow-up',
      channel: NotificationChannel.IN_APP,
      entityId: ananyaAppt1.id,
      dateKey: 'overdue'
    },
  });

  // Outstanding Invoice balance alert for Priya Sen
  await prisma.notification.create({
    data: {
      userId: patPriya.userId,
      title: 'Outstanding Invoice Balance Alert',
      message: 'Attention: An outstanding balance of ₹800 remains pending for your Glycolic Peeling procedure. Balance is payable at checkout.',
      category: 'payment',
      channel: NotificationChannel.IN_APP,
      entityId: priyaAppt2.id,
      dateKey: 'pending-bal'
    },
  });

  // Hydration announcement for David Patel
  await prisma.notification.create({
    data: {
      userId: patDavid.userId,
      title: 'Clinic Skin Hydration Guidelines',
      message: 'Welcome to your Laser Journey! Keep your epidermal barrier nourished: apply ceramide cream twice daily, avoid manual scrubbing, and drink 3L of water daily.',
      category: 'announcement',
      channel: NotificationChannel.IN_APP,
      entityId: 'announcement-01',
      dateKey: 'guidelines'
    },
  });

  // Doctor unavailable notification for hair patient Manoj Kumar
  await prisma.notification.create({
    data: {
      userId: patManoj.userId,
      title: 'Clinician Schedule Update Alert',
      message: 'Important: Dr. Rohan Kapoor will be unavailable on Monday (June 1st). High priority slot reschedules will be expedited by our coordinator.',
      category: 'doctor-leave',
      channel: NotificationChannel.IN_APP,
      entityId: 'leave-01',
      dateKey: 'kapoor-leave'
    },
  });


  console.log('✨ [Cosmediq Seeder] High-fidelity clinical database seeding completed with 100% success!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end(); // close pg pool to cleanly exit
  });
