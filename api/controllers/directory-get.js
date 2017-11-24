'use strict'

const util = require('util')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const fetch = require('node-fetch')
const path = require('path')
const config = require('config')
const basepath = config.basepath

function listItems(fullPath){
  return fs.readdirAsync(fullPath)
    .then(items => {
      return Array.from(new Set(items))
    })
    .map(item => {
      return fs.statAsync(path.join(fullPath, item))
        .then(stat => ({
          isDir: stat.isDirectory(),
        }),err => ({
          isDir: false,
        }))
        .then(obj => Object.assign(obj,{
          path: path.join(fullPath, item),
        }))
    })}

const mvURL = 'http://localhost:10010'

async function listSubroutines(path){
  try {
    const fetched = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      },
      qs: {path}
    })
    const json = fetched.json()
    if (json.enabled) {
      ['mkdvd', 'mv']
    } else {
      return ['mkdvd']
    }
  } catch (error) {
    return ['mkdvd']
  }
}

async function get (req, res) {
  try {
    const path = req.swagger.params.path.value || ''
    if (!path.startsWith(basepath)) {
      console.log({path, basepath})
      return res.status(403).end()
    }
    const contentPromise = listItems(path)
    const subroutinesPromise = listSubroutines(path)
    const content = await contentPromise
    const subroutines = await subroutinesPromise
    res.json({
      path,
      subroutines,
      content,
    })
  } catch (error) {
    console.log({error})
    res.status(500).json({message: util.format(error)})
  }
}

module.exports = (req, res) => get(req, res)
