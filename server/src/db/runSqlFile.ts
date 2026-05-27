import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pool } from './pool.js'

const sqlFile = process.argv[2]

if (!sqlFile) {
  throw new Error('SQL file path is required')
}

const sqlPath = resolve(process.cwd(), sqlFile)
const sql = await readFile(sqlPath, 'utf8')

try {
  await pool.query(sql)
  console.log(`Executed SQL file: ${sqlFile}`)
} finally {
  await pool.end()
}
