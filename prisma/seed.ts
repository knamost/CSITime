import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("password", 10)
  
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@csitime.com",
      password: hashedPassword,
      role: Role.ADMIN,
      name: "Admin",
    },
  })

  console.log(`Created admin user: ${admin.username}`)

  // Clear existing semesters and subjects to ensure clean slate
  await prisma.subject.deleteMany({})
  await prisma.semester.deleteMany({})

  const semesters = [
    {
      number: 1,
      title: "First Semester",
      subjects: [
        { name: "Introduction to Information Technology", code: "CSC114" },
        { name: "C Programming", code: "CSC115" },
        { name: "Digital Logic", code: "CSC116" },
        { name: "Mathematics I", code: "MTH117" },
        { name: "Physics", code: "PHY118" },
      ],
    },
    {
      number: 2,
      title: "Second Semester",
      subjects: [
        { name: "Discrete Structure", code: "CSC165" },
        { name: "Object Oriented Programming", code: "CSC166" },
        { name: "Microprocessor", code: "CSC167" },
        { name: "Mathematics II", code: "MTH168" },
        { name: "Statistics I", code: "STA169" },
      ],
    },
    {
      number: 3,
      title: "Third Semester",
      subjects: [
        { name: "Data Structure and Algorithms", code: "CSC211" },
        { name: "Numerical Method", code: "CSC212" },
        { name: "Computer Architecture", code: "CSC213" },
        { name: "Computer Graphics", code: "CSC214" },
        { name: "Statistics II", code: "STA215" },
      ],
    },
    {
      number: 4,
      title: "Fourth Semester",
      subjects: [
        { name: "Theory of Computation", code: "CSC262" },
        { name: "Computer Networks", code: "CSC263" },
        { name: "Operating Systems", code: "CSC264" },
        { name: "Database Management System", code: "CSC265" },
        { name: "Artificial Intelligence", code: "CSC266" },
      ],
    },
    {
      number: 5,
      title: "Fifth Semester",
      subjects: [
        { name: "Design and Analysis of Algorithms", code: "CSC325" },
        { name: "System Analysis and Design", code: "CSC326" },
        { name: "Cryptography", code: "CSC327" },
        { name: "Simulation and Modeling", code: "CSC328" },
        { name: "Web Technology", code: "CSC329" },
      ],
    },
    {
      number: 6,
      title: "Sixth Semester",
      subjects: [
        { name: "Software Engineering", code: "CSC375" },
        { name: "Compiler Design and Construction", code: "CSC376" },
        { name: "E-Governance", code: "CSC377" },
        { name: "NET Centric Computing", code: "CSC378" },
        { name: "Technical Writing", code: "CSC379" },
      ],
    },
    {
      number: 7,
      title: "Seventh Semester",
      subjects: [
        { name: "Advanced Java Programming", code: "CSC419" },
        { name: "Data Warehousing and Data Mining", code: "CSC420" },
        { name: "Principles of Management", code: "MGT421" },
        { name: "Project Work", code: "CSC422" },
      ],
    },
    {
      number: 8,
      title: "Eighth Semester",
      subjects: [
        { name: "Advanced Database", code: "CSC475" },
        { name: "Internship", code: "CSC476" },
      ],
    },
  ]

  for (const sem of semesters) {
    const semester = await prisma.semester.create({
      data: { number: sem.number, title: sem.title },
    })

    for (const subject of sem.subjects) {
      await prisma.subject.create({
        data: {
          name: subject.name,
          code: subject.code,
          semesterId: semester.id,
        },
      })
    }
    console.log(`Created semester ${sem.number} with ${sem.subjects.length} subjects`)
  }

  // Add electives for Semester 5
  const sem5 = await prisma.semester.findUnique({ where: { number: 5 } })
  const electives5 = [
    { name: "Multimedia Computing", code: "CSC330" },
    { name: "Wireless Networking", code: "CSC331" },
    { name: "Image Processing", code: "CSC332" },
    { name: "Knowledge Management", code: "CSC333" },
    { name: "Society and Ethics in Information Technology", code: "CSC334" },
    { name: "Microprocessor Based Design", code: "CSC335" },
  ]
  for (const elective of electives5) {
    await prisma.subject.create({
      data: { name: elective.name, code: elective.code, semesterId: sem5!.id },
    })
  }

  // Add electives for Semester 6
  const sem6 = await prisma.semester.findUnique({ where: { number: 6 } })
  const electives6 = [
    { name: "Applied Logic", code: "CSC380" },
    { name: "E-commerce", code: "CSC381" },
    { name: "Automation and Robotics", code: "CSC382" },
    { name: "Neural Networks", code: "CSC383" },
    { name: "Computer Hardware Design", code: "CSC384" },
    { name: "Cognitive Science", code: "CSC385" },
  ]
  for (const elective of electives6) {
    await prisma.subject.create({
      data: { name: elective.name, code: elective.code, semesterId: sem6!.id },
    })
  }

  // Add electives for Semester 7
  const sem7 = await prisma.semester.findUnique({ where: { number: 7 } })
  const electives7 = [
    { name: "Information Retrieval", code: "CSC423" },
    { name: "Database Administration", code: "CSC424" },
    { name: "Software Project Management", code: "CSC425" },
    { name: "Network Security", code: "CSC426" },
    { name: "Digital System Design", code: "CSC427" },
    { name: "International Marketing", code: "MGT428" },
  ]
  for (const elective of electives7) {
    await prisma.subject.create({
      data: { name: elective.name, code: elective.code, semesterId: sem7!.id },
    })
  }

  // Add electives for Semester 8
  const sem8 = await prisma.semester.findUnique({ where: { number: 8 } })
  const electives8 = [
    { name: "Advanced Networking with IPV6", code: "CSC477" },
    { name: "Distributed Networking", code: "CSC478" },
    { name: "Game Technology", code: "CSC479" },
    { name: "Distributed and Object-Oriented Database", code: "CSC480" },
    { name: "Introduction to Cloud Computing", code: "CSC481" },
    { name: "Geographical Information System", code: "CSC482" },
    { name: "Decision Support System and Expert System", code: "CSC483" },
    { name: "Mobile Application Development", code: "CSC484" },
    { name: "Real Time Systems", code: "CSC485" },
    { name: "Network and System Administration", code: "CSC486" },
    { name: "Embedded Systems Programming", code: "CSC487" },
    { name: "International Business Management", code: "MGT488" },
  ]
  for (const elective of electives8) {
    await prisma.subject.create({
      data: { name: elective.name, code: elective.code, semesterId: sem8!.id },
    })
  }

  console.log("Database seeded successfully")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
