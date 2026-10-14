import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { PolicySettingsModel } from '../models/PolicySettings';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const usersToSeed = [
  {
    name: "Vikram Sengupta",
    email: "admin.super@adamma.in",
    role: "ADMIN",
    status: "CONFIRMED",
    mobile: "+919999988888",
    clBalance: 12,
    elBalance: 15,
    slBalance: 8,
    compOffBalance: 2,
    permissions: ['PAYROLL_VIEW','PAYROLL_ADMIN','DIRECTORY_VIEW','DOCS_VIEW','DOCS_ADMIN','TICKET_VIEW','TICKET_ADMIN','RESIGNATION_VIEW','RESIGNATION_ADMIN','RECRUITMENT_VIEW','RECRUITMENT_ADMIN','TRAINING_VIEW','TRAINING_ADMIN','REPORTS_VIEW','ATTENDANCE_MARK']
  },
  {
    name: "Meera Nair",
    email: "manager.meera@adamma.in",
    role: "MANAGER",
    status: "CONFIRMED",
    mobile: "+919876543001",
    clBalance: 10,
    elBalance: 12,
    slBalance: 6,
    compOffBalance: 1,
    permissions: ['PAYROLL_VIEW','DIRECTORY_VIEW','DOCS_VIEW','TICKET_VIEW','TICKET_ADMIN','RESIGNATION_VIEW','RESIGNATION_ADMIN','RECRUITMENT_VIEW','RECRUITMENT_ADMIN','TRAINING_VIEW','TRAINING_ADMIN','REPORTS_VIEW','ATTENDANCE_MARK']

  },
  {
    name: "Rohan Deshmukh",
    email: "tl.rohan@adamma.in",
    role: "TL",
    status: "CONFIRMED",
    mobile: "+919876543002",
    clBalance: 11,
    elBalance: 8,
    slBalance: 5,
    compOffBalance: 3,
    permissions: ['PAYROLL_VIEW','DIRECTORY_VIEW','DOCS_VIEW','TICKET_VIEW','RESIGNATION_VIEW','RESIGNATION_ADMIN','RECRUITMENT_VIEW','TRAINING_VIEW','ATTENDANCE_MARK']
  },
  {
    name: "Arjun Sharma",
    email: "employee.arjun@adamma.in",
    role: "EMPLOYEE",
    status: "PROBATION",
    mobile: "+919876543210",
    clBalance: 6,
    elBalance: 0,
    slBalance: 3,
    compOffBalance: 0,
    permissions: ['PAYROLL_VIEW','DIRECTORY_VIEW','DOCS_VIEW','TICKET_VIEW','RESIGNATION_VIEW','TRAINING_VIEW','ATTENDANCE_MARK']
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/adamma-hrms';
    console.log(`Connecting to database for seeding at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // 1. Seed Active Policy Settings
    await PolicySettingsModel.deleteMany({});
    const policy = new PolicySettingsModel({
      version: 1,
      shiftStartTime: "09:30",
      shiftEndTime: "18:30",
      lateAllowanceDays: 3,
      lateMinutesCap: 50,
      workingSaturdays: [1, 3, 5],
      ncnsThresholdConsecutiveDays: 2,
      gracePeriodMinutes: 15,
      breakWindows: [
        { startTime: "13:00", endTime: "14:00" },
        { startTime: "16:00", endTime: "16:30" }
      ]
    });
    await policy.save();
    console.log("✔ Seeding complete: Policy Settings.");

    // 2. Seed Users
    await UserModel.deleteMany({});
    
    // We will establish direct reporting line references dynamically
    let managerRecord: any = null;
    let tlRecord: any = null;

    // Seed Admin, Manager, and TL first
    for (const u of usersToSeed) {
      const defaultDoc = {
        ...u,
        dateOfJoining: new Date('2026-01-05T00:00:00.000Z'),
        probationEnd: new Date('2026-07-05T00:00:00.000Z'),
        bankDetails: {
          accountNumber: "912010043829103",
          ifscCode: "UTIB0000004",
          bankName: "Axis Bank Ltd"
        },
        salary: {
          baseSalary: u.role === 'ADMIN' ? 120000 : u.role === 'MANAGER' ? 85000 : u.role === 'TL' ? 65000 : 45000,
          allowances: 15000,
          retentionAmount: u.role === 'EMPLOYEE' ? 5000 : 0
        },
        emergencyContact: {
          name: "Family Member",
          relation: "Relative",
          phone: "+919876543211"
        },
        isConfirmed: u.role !== 'EMPLOYEE',
        is2FAEnabled: false
      };

      const record = new UserModel(defaultDoc);
      await record.save();
      console.log(`✔ Seeding complete: Profile ${u.name} (${u.role}).`);

      if (u.role === 'MANAGER') managerRecord = record;
      if (u.role === 'TL') tlRecord = record;
    }

    // Connect Employee Arjun with TL Rohan and Manager Meera
    if (tlRecord && managerRecord) {
      await UserModel.updateOne(
        { email: "employee.arjun@adamma.in" },
        { 
          $set: { 
            tlId: tlRecord._id, 
            managerId: managerRecord._id 
          } 
        }
      );
      // Connect TL Rohan with Manager Meera
      await UserModel.updateOne(
        { email: "tl.rohan@adamma.in" },
        { 
          $set: { 
            managerId: managerRecord._id 
          } 
        }
      );
      console.log("✔ Seeding complete: Hierarchical reporting lines connected.");
    }

    console.log("Database seeded successfully. All connections closing.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Database seeding encountered a fatal exception:", error);
    process.exit(1);
  }
}

seedDatabase();
