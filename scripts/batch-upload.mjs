/**
 * 批量上传脚本：将本地照片上传到 Chevereto 图床相册
 * 用法: node scripts/batch-upload.mjs
 *
 * 功能：
 * - 每批 10 张并发上传
 * - 实时显示进度
 * - 断点续传（记录已上传文件到 scripts/uploaded-files.json）
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createReadStream } from "fs"

// ===== 配置 =====
const IMAGE_DIR = "C:\\Users\\zhuji\\Downloads\\wechatDownload4.6\\下载\\北京市第二中学经开区学校\\图片"
const ALBUM_ID = "oGZTj"
const CHEVERETO_URL = "https://www.picgo.net"
const CHEVERETO_KEY = "chv_kkQXd_0398dadc9d770f43361d0d656a9d662c674ff9d4dd7ad7b7e7d55d2c566348ef_3599f5ac754e2bc39582c0898781e2436dedcd2fd08d1bad16f32b84b65202ab"
const BATCH_SIZE = 10
const PROGRESS_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "uploaded-files.json")
const ERROR_LOG = path.join(path.dirname(fileURLToPath(import.meta.url)), "upload-errors.log")

// ===== 加载已上传记录 =====
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

function logError(filename, error) {
  const timestamp = new Date().toISOString()
  fs.appendFileSync(ERROR_LOG, `[${timestamp}] ${filename}: ${error}\n`)
}

// ===== 上传单张照片 =====
async function uploadOne(filepath, filename) {
  const buffer = fs.readFileSync(filepath)
  const formData = new FormData()
  formData.append("source", new Blob([buffer], { type: "image/jpeg" }), filename)
  formData.append("album_id", ALBUM_ID)
  formData.append("format", "json")

  const res = await fetch(`${CHEVERETO_URL}/api/1/upload`, {
    method: "POST",
    headers: {
      "X-API-Key": CHEVERETO_KEY,
    },
    body: formData,
  })

  const json = await res.json()

  if (json.status_code !== 200) {
    throw new Error(json.status_txt || `HTTP ${res.status}`)
  }

  return json.image?.url || "unknown"
}

// ===== 批量上传 =====
async function uploadBatch(files, batchNum, totalBatches, uploaded) {
  const results = { success: 0, fail: 0, skip: 0 }
  const promises = files.map(async (file) => {
    if (uploaded.has(file.name)) {
      results.skip++
      return
    }
    try {
      const url = await uploadOne(file.path, file.name)
      uploaded.add(file.name)
      results.success++
      process.stdout.write(`  ✓ ${file.name} → ${url}\n`)
    } catch (err) {
      results.fail++
      logError(file.name, err.message)
      process.stdout.write(`  ✗ ${file.name}: ${err.message}\n`)
    }
  })

  await Promise.all(promises)
  return results
}

// ===== 主函数 =====
async function main() {
  console.log("========================================")
  console.log("  Chevereto 批量上传脚本")
  console.log("========================================")
  console.log(`图片目录: ${IMAGE_DIR}`)
  console.log(`目标相册: ${ALBUM_ID}`)
  console.log(`每批数量: ${BATCH_SIZE}`)
  console.log("")

  // 读取所有图片
  const allFiles = fs
    .readdirSync(IMAGE_DIR)
    .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .sort()
    .map((name) => ({
      name,
      path: path.join(IMAGE_DIR, name),
    }))

  console.log(`找到 ${allFiles.length} 张图片`)

  const uploaded = loadUploaded()
  console.log(`已上传记录: ${uploaded.size} 张`)
  console.log("")

  const totalBatches = Math.ceil(allFiles.length / BATCH_SIZE)
  let totalSuccess = 0
  let totalFail = 0
  let totalSkip = 0
  const startTime = Date.now()

  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const batch = allFiles.slice(i, i + BATCH_SIZE)

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    const processed = totalSuccess + totalFail + totalSkip
    const percent = ((processed / allFiles.length) * 100).toFixed(1)

    console.log(
      `[${batchNum}/${totalBatches}] 进度: ${processed}/${allFiles.length} (${percent}%) | ` +
      `成功: ${totalSuccess} 失败: ${totalFail} 跳过: ${totalSkip} | ` +
      `用时: ${elapsed}s`
    )

    const results = await uploadBatch(batch, batchNum, totalBatches, uploaded)
    totalSuccess += results.success
    totalFail += results.fail
    totalSkip += results.skip

    // 每 5 批保存一次进度
    if (batchNum % 5 === 0) {
      saveUploaded(uploaded)
    }

    // 批间短暂等待，避免 API 限流
    await new Promise((r) => setTimeout(r, 500))
  }

  // 最终保存
  saveUploaded(uploaded)

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log("")
  console.log("========================================")
  console.log("  上传完成！")
  console.log("========================================")
  console.log(`总图片数: ${allFiles.length}`)
  console.log(`成功上传: ${totalSuccess}`)
  console.log(`上传失败: ${totalFail}`)
  console.log(`跳过(已传): ${totalSkip}`)
  console.log(`总用时: ${totalTime}s`)
  if (totalFail > 0) {
    console.log(`失败日志: ${ERROR_LOG}`)
  }
  console.log(`进度记录: ${PROGRESS_FILE}`)
}

main().catch((err) => {
  console.error("脚本运行出错:", err)
  process.exit(1)
})
