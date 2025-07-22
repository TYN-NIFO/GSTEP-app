import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'CSE' },
      update: {},
      create: {
        name: 'Computer Science Engineering',
        code: 'CSE',
        description: 'Department of Computer Science and Engineering'
      }
    }),
    prisma.department.upsert({
      where: { code: 'ECE' },
      update: {},
      create: {
        name: 'Electronics and Communication Engineering',
        code: 'ECE',
        description: 'Department of Electronics and Communication Engineering'
      }
    }),
    prisma.department.upsert({
      where: { code: 'ME' },
      update: {},
      create: {
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Department of Mechanical Engineering'
      }
    }),
    prisma.department.upsert({
      where: { code: 'EEE' },
      update: {},
      create: {
        name: 'Electrical and Electronics Engineering',
        code: 'EEE',
        description: 'Department of Electrical and Electronics Engineering'
      }
    })
  ])

  console.log('✅ Departments created')

  // Create users (HODs and Staff)
  const hashedPassword = await bcrypt.hash('password123', 12)

  const users = await Promise.all([
    // HODs
    prisma.user.upsert({
      where: { email: 'hod.cse@example.com' },
      update: {},
      create: {
        email: 'hod.cse@example.com',
        password: hashedPassword,
        firstName: 'Dr. John',
        lastName: 'Smith',
        role: 'HOD',
        departmentId: departments[0].id
      }
    }),
    prisma.user.upsert({
      where: { email: 'hod.ece@example.com' },
      update: {},
      create: {
        email: 'hod.ece@example.com',
        password: hashedPassword,
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: 'HOD',
        departmentId: departments[1].id
      }
    }),
    // Staff members
    prisma.user.upsert({
      where: { email: 'staff.cse1@example.com' },
      update: {},
      create: {
        email: 'staff.cse1@example.com',
        password: hashedPassword,
        firstName: 'Prof. Michael',
        lastName: 'Brown',
        role: 'STAFF',
        departmentId: departments[0].id
      }
    }),
    prisma.user.upsert({
      where: { email: 'staff.cse2@example.com' },
      update: {},
      create: {
        email: 'staff.cse2@example.com',
        password: hashedPassword,
        firstName: 'Prof. Emily',
        lastName: 'Davis',
        role: 'STAFF',
        departmentId: departments[0].id
      }
    }),
    prisma.user.upsert({
      where: { email: 'staff.ece1@example.com' },
      update: {},
      create: {
        email: 'staff.ece1@example.com',
        password: hashedPassword,
        firstName: 'Prof. David',
        lastName: 'Wilson',
        role: 'STAFF',
        departmentId: departments[1].id
      }
    }),
    // Admin
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        departmentId: departments[0].id
      }
    })
  ])

  console.log('✅ Users created')

  // Create students
  const students = await Promise.all([
    prisma.student.upsert({
      where: { rollNumber: 'CSE2021001' },
      update: {},
      create: {
        rollNumber: 'CSE2021001',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@student.edu',
        phone: '+1234567890',
        year: 4,
        semester: 8,
        cgpa: 8.5,
        departmentId: departments[0].id
      }
    }),
    prisma.student.upsert({
      where: { rollNumber: 'CSE2021002' },
      update: {},
      create: {
        rollNumber: 'CSE2021002',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@student.edu',
        phone: '+1234567891',
        year: 4,
        semester: 8,
        cgpa: 7.8,
        departmentId: departments[0].id
      }
    }),
    prisma.student.upsert({
      where: { rollNumber: 'ECE2021001' },
      update: {},
      create: {
        rollNumber: 'ECE2021001',
        firstName: 'Carol',
        lastName: 'Brown',
        email: 'carol.brown@student.edu',
        phone: '+1234567892',
        year: 4,
        semester: 8,
        cgpa: 9.1,
        departmentId: departments[1].id
      }
    })
  ])

  console.log('✅ Students created')

  // Create companies
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { name: 'TechCorp Solutions' },
      update: {},
      create: {
        name: 'TechCorp Solutions',
        description: 'Leading technology solutions provider',
        website: 'https://techcorp.com',
        industry: 'Technology',
        location: 'San Francisco, CA'
      }
    }),
    prisma.company.upsert({
      where: { name: 'InnovateTech' },
      update: {},
      create: {
        name: 'InnovateTech',
        description: 'Innovation-driven technology company',
        website: 'https://innovatetech.com',
        industry: 'Software',
        location: 'Austin, TX'
      }
    }),
    prisma.company.upsert({
      where: { name: 'DataDynamics' },
      update: {},
      create: {
        name: 'DataDynamics',
        description: 'Data analytics and AI solutions',
        website: 'https://datadynamics.com',
        industry: 'Data Analytics',
        location: 'Seattle, WA'
      }
    })
  ])

  console.log('✅ Companies created')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
