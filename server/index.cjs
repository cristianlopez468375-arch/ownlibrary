const express = require('express')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')

const app = express()
const port = 3001
const dataPath = path.join(__dirname, 'data.json')
app.use(cors())
app.use(express.json())

async function readData() { return JSON.parse(await fs.readFile(dataPath, 'utf8')) }
async function writeData(data) { await fs.writeFile(dataPath, JSON.stringify(data, null, 2)) }

app.get('/api/health', function (_req, res) { res.json({ status: 'ok' }) })
app.get('/api/:resource', async function (req, res) {
  const data = await readData()
  if (!data[req.params.resource]) return res.status(404).json({ error: 'Recurso no encontrado' })
  res.json(data[req.params.resource])
})
app.post('/api/:resource', async function (req, res) {
  const data = await readData(); const collection = data[req.params.resource]
  if (!collection) return res.status(404).json({ error: 'Recurso no encontrado' })
  const item = { ...req.body, id: Math.max(0, ...collection.map(function (entry) { return entry.id })) + 1 }
  collection.push(item); await writeData(data); res.status(201).json(item)
})
app.put('/api/:resource/:id', async function (req, res) {
  const data = await readData(); const collection = data[req.params.resource]
  const index = collection ? collection.findIndex(function (entry) { return entry.id === Number(req.params.id) }) : -1
  if (index < 0) return res.status(404).json({ error: 'Registro no encontrado' })
  collection[index] = { ...collection[index], ...req.body, id: collection[index].id }
  await writeData(data); res.json(collection[index])
})
app.delete('/api/:resource/:id', async function (req, res) {
  const data = await readData(); const collection = data[req.params.resource]
  const next = collection ? collection.filter(function (entry) { return entry.id !== Number(req.params.id) }) : []
  if (!collection || next.length === collection.length) return res.status(404).json({ error: 'Registro no encontrado' })
  data[req.params.resource] = next; await writeData(data); res.status(204).end()
})
app.listen(port, function () { console.log('API de OwnLibrary activa en http://localhost:' + port) })