const express = require('express')
const router = express.Router()
const queries = require('../queries')
const bcrypt = require('bcryptjs')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/', asyncHandler(async (req, res) => {
  const list = await queries.getSettings()
  const safe = { ...list }
  if (safe.cms_password) {
    safe.cms_password = '••••••••'
  }
  res.json(safe)
}))

router.put('/:key', asyncHandler(async (req, res) => {
  const { value } = req.body
  const key = req.params.key

  if (key === 'cms_password' && value && !value.startsWith('$2b$')) {
    const hashed = await bcrypt.hash(value, 10)
    return res.json(await queries.setSetting(key, hashed))
  }

  res.json(await queries.setSetting(key, value))
}))

module.exports = router
