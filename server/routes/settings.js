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

router.patch('/', asyncHandler(async (req, res) => {
  const settings = req.body?.settings || req.body || {}
  const toSave = { ...settings }

  if (toSave.cms_password) {
    if (toSave.cms_password === '••••••••' || !toSave.cms_password.trim()) {
      delete toSave.cms_password
    } else if (!toSave.cms_password.startsWith('$2b$') && !toSave.cms_password.startsWith('$2a$')) {
      toSave.cms_password = await bcrypt.hash(toSave.cms_password, 10)
    }
  }

  const updated = await queries.setSettingsBulk(toSave)
  const safe = { ...updated }
  if (safe.cms_password) safe.cms_password = '••••••••'
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
