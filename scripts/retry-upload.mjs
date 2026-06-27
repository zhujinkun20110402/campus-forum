/**
 * 重试上传脚本：逐张上传失败的文件（无并发，避免限流）
 * 用法: node scripts/retry-upload.mjs
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const IMAGE_DIR = "C:\\Users\\zhuji\\Downloads\\wechatDownload4.6\\下载\\北京市第二中学经开区学校\\图片"
const ALBUM_ID = "oGZTj"
const CHEVERETO_URL = "https://www.picgo.net"
const CHEVERETO_KEY = "chv_kkQXd_0398dadc9d770f43361d0d656a9d662c674ff9d4dd7ad7b7e7d55d2c566348ef_3599f5ac754e2bc39582c0898781e2436dedcd2fd08d1bad16f32b84b65202ab"
const DELAY_MS = 1500 // 每张之间等待 1.5 秒
const MAX_RETRIES = 2 // 每张最多重试 2 次
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROGRESS_FILE = path.join(SCRIPT_DIR, "uploaded-files.json")
const ERROR_LOG = path.join(SCRIPT_DIR, "upload-errors.log")

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
    throw new Error(json.status_txt || `HTTP ${res.status}`)
  }
  return json.image?.url || "unknown"
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  console.log("========================================")
  console.log("  重试上传脚本（逐张上传）")
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
  console.log(`每张间隔: ${DELAY_MS}ms`)
  console.log("")

  let success = 0
  let fail = 0
  const startTime = Date.now()

  for (let i = 0; i < pending.length; i++) {
    const filename = pending[i]
    const filepath = path.join(IMAGE_DIR, filename)
    const percent = ((i / pending.length) * 100).toFixed(1)
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)

    let succeeded = false
    for (let retry = 0; retry <= MAX_RETRIES; retry++) {
      try {
        const url = await uploadOne(filepath, filename)
        uploaded.add(filename)
        success++
        process.stdout.write(
          `\r[${i + 1}/${pending.length}] ${percent}% | ✓ ${filename.substring(0, 40)}... | 成功:${success} 失败:${fail} | ${elapsed}s  `
        )
        succeeded = true
        break
      } catch (err) {
        if (retry < MAX_RETRIES) {
          await sleep(2000 * (retry + 1))
        } else {
          fail++
          process.stdout.write(
            `\r[${i + 1}/${pending.length}] ${percent}% | ✗ ${filename.substring(0, 40)}... | 成功:${success} 失败:${fail} | ${elapsed}s  \n`
          )
          process.stdout.write(`  错误: ${err.message}\n`)
        }
      }
    }

    // 每 10 张保存一次进度
    if (success % 10 === 0) {
      saveUploaded(uploaded)
    }

    await sleep(DELAY_MS)
  }

  saveUploaded(uploaded)

  const totalTime = ((Date.now() - startTime) / 60).toFixed(1)
  console.log("")
  console.log("========================================")
  console.log("  重试上传完成！")
  console.log("========================================")
  console.log(`本轮成功: ${success}`)
  console.log(`本轮失败: ${fail}`)
  console.log(`总用时: ${totalTime} 分钟`)
}

main().catch((err) => {
  console.error("脚本运行出错:", err)
  process.exit(1)
})
