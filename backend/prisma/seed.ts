import { PrismaClient, EmploymentType, EmployeeStatus } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const BATCH_SIZE = 500
const TOTAL_EMPLOYEES = 10_000

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Singapore', 'Netherlands', 'Sweden',
  'Brazil', 'Japan', 'Spain', 'Italy', 'Mexico',
]

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'Finance', 'HR', 'Legal', 'Operations', 'Customer Success',
]

const JOB_TITLES: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Engineering Manager', 'DevOps Engineer', 'Data Engineer'],
  Product: ['Product Manager', 'Senior Product Manager', 'Director of Product', 'Product Analyst'],
  Design: ['UX Designer', 'UI Designer', 'Senior Designer', 'Design Lead'],
  Marketing: ['Marketing Manager', 'Content Strategist', 'Growth Manager', 'Brand Designer'],
  Sales: ['Sales Representative', 'Account Executive', 'Sales Manager', 'VP of Sales'],
  Finance: ['Financial Analyst', 'Senior Financial Analyst', 'Finance Manager', 'Controller'],
  HR: ['HR Manager', 'Recruiter', 'HR Business Partner', 'People Operations Manager'],
  Legal: ['Legal Counsel', 'Compliance Manager', 'Contract Manager'],
  Operations: ['Operations Manager', 'Project Manager', 'Program Manager', 'Operations Analyst'],
  'Customer Success': ['Customer Success Manager', 'Support Specialist', 'Account Manager'],
}

const SALARY_RANGES: Record<string, [number, number]> = {
  'United States': [55000, 320000],
  'United Kingdom': [40000, 220000],
  'Canada': [45000, 240000],
  'Australia': [50000, 260000],
  'Germany': [45000, 220000],
  'France': [38000, 200000],
  'India': [8000, 80000],
  'Singapore': [50000, 280000],
  'Netherlands': [42000, 210000],
  'Sweden': [45000, 210000],
  'Brazil': [12000, 90000],
  'Japan': [40000, 200000],
  'Spain': [30000, 160000],
  'Italy': [28000, 160000],
  'Mexico': [10000, 70000],
}

const EMPLOYMENT_TYPES: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT']
const EMPLOYMENT_TYPE_WEIGHTS = [0.75, 0.1, 0.15]

function loadNames(filename: string): string[] {
  const filepath = path.join(__dirname, filename)
  return fs.readFileSync(filepath, 'utf-8')
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean)
}

function weightedRandom<T>(items: T[], weights: number[]): T {
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i]
    if (r < cumulative) return items[i]
  }
  return items[items.length - 1]
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateEmail(fullName: string, index: number): string {
  const normalized = fullName.toLowerCase().replace(/\s+/g, '.')
  return `${normalized}.${index}@company.com`
}

function generateStartDate(): Date {
  const start = new Date('2015-01-01').getTime()
  const end = new Date().getTime()
  return new Date(randInt(start, end))
}

async function main() {
  const startTime = Date.now()
  console.log('Loading name lists...')

  const firstNames = loadNames('first_names.txt')
  const lastNames = loadNames('last_names.txt')

  console.log(`Loaded ${firstNames.length} first names, ${lastNames.length} last names`)
  console.log(`Generating ${TOTAL_EMPLOYEES.toLocaleString()} employees in batches of ${BATCH_SIZE}...`)

  // Clear existing seeded data for idempotency
  await prisma.employee.deleteMany()

  let created = 0
  const batches = Math.ceil(TOTAL_EMPLOYEES / BATCH_SIZE)

  for (let b = 0; b < batches; b++) {
    const batchCount = Math.min(BATCH_SIZE, TOTAL_EMPLOYEES - created)
    const records = []

    for (let i = 0; i < batchCount; i++) {
      const idx = created + i
      const firstName = randFrom(firstNames)
      const lastName = randFrom(lastNames)
      const fullName = `${firstName} ${lastName}`
      const country = randFrom(COUNTRIES)
      const department = randFrom(DEPARTMENTS)
      const jobTitle = randFrom(JOB_TITLES[department])
      const [minSal, maxSal] = SALARY_RANGES[country]
      const salary = randInt(minSal, maxSal)
      const employmentType = weightedRandom(EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_WEIGHTS)
      const status: EmployeeStatus = Math.random() > 0.05 ? 'ACTIVE' : 'INACTIVE'

      records.push({
        fullName,
        email: generateEmail(fullName, idx),
        jobTitle,
        department,
        country,
        salary,
        currency: 'USD',
        employmentType,
        startDate: generateStartDate(),
        status,
      })
    }

    await prisma.employee.createMany({ data: records, skipDuplicates: true })
    created += batchCount

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    process.stdout.write(`\r  ${created.toLocaleString()} / ${TOTAL_EMPLOYEES.toLocaleString()} (${elapsed}s)`)
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`\nDone! Seeded ${created.toLocaleString()} employees in ${totalTime}s`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
