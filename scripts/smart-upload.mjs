/**
 * 智能重试上传脚本
 * - 自动检测限流，等待后继续
 * - 每小时最多 500 张（Chevereto API 限制）
 * - 断点续传
 * 用法: node scripts/smart-upload.mjs
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const IMAGE_DIR = "C:\\Users\\zhuji\\Downloads\\wechatDownload4.6\\下载\\北京市第二中学经开区学校\\图片"
const ALBUM_ID = "oGZTj"
const CHEVERETO_URL = "https://www.picgo.net"
const CHEVERETO_KEY = "chv_kkQXd_0398dadc9d770f43361d0d656a9d662c674ff9d4dd7ad7b7e7d55d2c566348ef_3599f5ac754e2bc39582c0898781e2436dedcd2fd08d1bad16f32b84b65202ab"
const HOURLY_LIMIT = 480 // 留点余量，设为 480
const DELAY_MS = 2000 // 每张间隔 2 秒
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROGRESS_FILE = path.join(SCRIPT_DIR, "uploaded-files.json")

function loadUploaded() {
  try {
    const data = fs.readFileSync(PROGRESS_FILE, "utf-8")
    return new Set(JSON.parse(data))
  } catch {
    return new Set()
  }
}

function saveUploaded(set) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify([...set], null, 2))
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
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

  if (json.status_code !== 200) {
    // 返回错误对象，包含是否为限流
    return {
      error: json.error?.message || json.status_txt || `HTTP ${res.status}`,
      isFlood: json.error?.code === 130,
    }
  }
  return { url: json.image?.url || "unknown" }
}

async function main() {
  console.log("========================================")
  console.log("  智能上传脚本（自动限流处理）")
  console.log("========================================")

  const allFiles = fs
    .readdirSync(IMAGE_DIR)
    .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .sort()

  const uploaded = loadUploaded()
  const pending = allFiles.filter((f) => !uploaded.has(f))

  console.log(`总图片: ${allFiles.length}`)
  console.log(`已上传: ${uploaded.size}`)
  console.log(`待上传: ${pending.length}`)
  console.log(`每小时限制: ${HOURLY_LIMIT} 张`)
  console.log(`每张间隔: ${DELAY_MS}ms`)
  console.log("")

  let success = 0
  let fail = 0
  let hourlyCount = 0
  let hourlyStartTime = Date.now()
  const startTime = Date.now()

  for (let i = 0; i < pending.length; i++) {
    const filename = pending[i]
    const filepath = path.join(IMAGE_DIR, filename)
    const percent = ((i / pending.length) * 100).toFixed(1)
    const elapsed = Math.round((Date.now() - startTime) / 1000)

    // 检查小时限额
    const hourElapsed = (Date.now() - hourlyStartTime) / 1000 / 60 // 分钟
    if (hourlyCount >= HOURLY_LIMIT) {
      const waitMin = Math.max(1, 60 - hourElapsed)
      console.log(`\n⏰ 已达每小时限额 (${HOURLY_LIMIT})，等待 ${waitMin.toFixed(0)} 分钟...`)
      await sleep(waitMin * 60 * 1000)
      hourlyCount = 0
      hourlyStartTime = Date.now()
      console.log("✅ 等待结束，继续上传\n")
    }

    let retries = 0
    const maxRetries = 3

    while (retries <= maxRetries) {
      const result = await uploadOne(filepath, filename)

      if (result.url) {
        uploaded.add(filename)
        success++
        hourlyCount++
        process.stdout.write(
          `\r[${i + 1}/${pending.length}] ${percent}% | ✓ ${filename.substring(0, 35)}... | S:${success} F:${fail} | ${elapsed}s  `
        )
        break
      } else if (result.isFlood) {
        // 限流，等待 5 分钟后重试
        console.log(`\n⏳ 限流检测，等待 5 分钟后重试...`)
        await sleep(5 * 60 * 1000)
        hourlyCount = 0
        hourlyStartTime = Date.now()
        retries++
        // 不增加 fail 计数，重试
      } else {
        // 其他错误，重试
        if (retries < maxRetries) {
          await sleep(3000)
          retries++
        } else {
          fail++
          process.stdout.write(
            `\r[${i + 1}/${pending.length}] ${percent}% | ✗ ${filename.substring(0, 35)}... | S:${success} F:${fail} | ${elapsed}s  \n`
          )
          process.stdout.write(`  错误: ${result.error}\n`)
        }
      }
    }

    // 每 10 张保存进度
    if (success % 10 === 0) {
      saveUploaded(uploaded)
    }

    await sleep(DELAY_MS)
  }

  saveUploaded(uploaded)

  const totalMin = ((Date.now() - startTime) / 60000).toFixed(1)
  console.log("")
  console.log("========================================")
  console.log("  上传完成！")
  console.log("========================================")
  console.log(`本轮成功: ${success}`)
  console.log(`本轮失败: ${fail}`)
  console.log(`累计已上传: ${uploaded.size} / ${allFiles.length}`)
  console.log(`总用时: ${totalMin} 分钟`)
}

main().catch((err) => {
  console.error("脚本运行出错:", err)
  process.exit(1)
})
