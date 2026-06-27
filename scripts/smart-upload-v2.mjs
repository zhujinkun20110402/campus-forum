/**
 * 智能上传脚本 v2
 * - 单张上传，无并发
 * - 随机间隔 3-8 秒
 * - 自动检测限流，停止并记录
 * - 断点续传
 * 用法: node scripts/smart-upload-v2.mjs
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const IMAGE_DIR = "C:\\Users\\zhuji\\Downloads\\wechatDownload4.6\\下载\\北京市第二中学经开区学校\\图片"
const ALBUM_ID = "oGZTj"
const CHEVERETO_URL = "https://www.picgo.net"
const CHEVERETO_KEY = "chv_kkQXd_0398dadc9d770f43361d0d656a9d662c674ff9d4dd7ad7b7e7d55d2c566348ef_3599f5ac754e2bc39582c0898781e2436dedcd2fd08d1bad16f32b84b65202ab"
const MIN_DELAY = 3000
const MAX_DELAY = 8000
const MAX_RETRIES = 3
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROGRESS_FILE = path.join(SCRIPT_DIR, "uploaded-files.json")
const LOG_FILE = path.join(SCRIPT_DIR, "upload-log.txt")

function log(msg) {
  const ts = new Date().toISOString()
  const line = `[${ts}] ${msg}`
  console.log(line)
  fs.appendFileSync(LOG_FILE, line + "\n")
}

function loadUploaded() {
  try {
    return new Set(JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8")))
  } catch {
    return new Set()
  }
}

function saveUploaded(set) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify([...set], null, 2))
}

function randomDelay() {
  return MIN_DELAY + Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY))
}

async function uploadOne(filepath, filename) {
  const buffer = fs.readFileSync(filepath)
  const formData = new FormData()
  formData.append("source", new Blob([buffer], { type: "image/jpeg" }), filename)
  formData.append("album_id", ALBUM_ID)
  formData.append("format", "json")

  const res = await fetch(`${CHEVERETO_URL}/api/1/upload`, {
    method: "POST",
    headers: { "X-API-Key": CHEVERETO_KEY },
    body: formData,
  })

  const json = await res.json()

  if (json.status_code === 200) {
    return { ok: true, url: json.image?.url }
  }

  const errMsg = json.error?.message || json.status_txt || `HTTP ${res.status}`
  const errCode = json.error?.code || 0
  return { ok: false, error: errMsg, isFlood: errCode === 130 || errMsg.includes("lood") }
}

async function main() {
  log("========================================")
  log("  智能上传脚本 v2（单张·随机间隔）")
  log("========================================")

  const allFiles = fs
    .readdirSync(IMAGE_DIR)
    .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .sort()

  const uploaded = loadUploaded()
  const pending = allFiles.filter((f) => !uploaded.has(f))

  log(`总图片: ${allFiles.length} | 已上传: ${uploaded.size} | 待上传: ${pending.length}`)
  log("")

  let success = 0
  let fail = 0
  let floodStopped = false
  const startTime = Date.now()

  for (let i = 0; i < pending.length; i++) {
    const filename = pending[i]
    const filepath = path.join(IMAGE_DIR, filename)
    const percent = ((i / pending.length) * 100).toFixed(1)
    const elapsed = Math.round((Date.now() - startTime) / 1000)

    let done = false
    for (let retry = 0; retry <= MAX_RETRIES && !done; retry++) {
      try {
        const result = await uploadOne(filepath, filename)

        if (result.ok) {
          uploaded.add(filename)
          success++
          log(`[${i + 1}/${pending.length}] ${percent}% ✓ ${filename} | S:${success} F:${fail} | ${elapsed}s`)
          done = true
        } else if (result.isFlood) {
          log(`⚠️  限流检测！停止上传。已完成 ${success} 张，剩余 ${pending.length - i - 1} 张`)
          log(`   错误: ${result.error}`)
          floodStopped = true
          done = true // 跳出重试循环
        } else {
          if (retry < MAX_RETRIES) {
            log(`  重试 ${retry + 1}/${MAX_RETRIES}: ${filename} - ${result.error}`)
            await new Promise((r) => setTimeout(r, 5000))
          } else {
            fail++
            log(`[${i + 1}/${pending.length}] ${percent}% ✗ ${filename} - ${result.error} | S:${success} F:${fail}`)
            done = true
          }
        }
      } catch (err) {
        if (retry < MAX_RETRIES) {
          log(`  网络错误重试 ${retry + 1}/${MAX_RETRIES}: ${err.message}`)
          await new Promise((r) => setTimeout(r, 5000))
        } else {
          fail++
          log(`[${i + 1}/${pending.length}] ${percent}% ✗ ${filename} - ${err.message} | S:${success} F:${fail}`)
          done = true
        }
      }
    }

    if (floodStopped) break

    // 每 10 张保存进度
    if (success % 10 === 0) saveUploaded(uploaded)

    // 随机间隔
    const delay = randomDelay()
    await new Promise((r) => setTimeout(r, delay))
  }

  saveUploaded(uploaded)

  const totalMin = ((Date.now() - startTime) / 60000).toFixed(1)
  log("")
  log("========================================")
  if (floodStopped) {
    log("  ⛔ 因限流自动停止")
    log(`  限流后请等待 1 小时再运行此脚本`)
  } else {
    log("  ✅ 全部完成！")
  }
  log("========================================")
  log(`本轮成功: ${success}`)
  log(`本轮失败: ${fail}`)
  log(`累计已上传: ${uploaded.size} / ${allFiles.length}`)
  log(`总用时: ${totalMin} 分钟`)
}

main().catch((err) => {
  log("脚本运行出错: " + err.message)
  process.exit(1)
})
