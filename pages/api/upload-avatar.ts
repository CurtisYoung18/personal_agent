import type { NextApiRequest, NextApiResponse } from 'next'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // 限制 10MB
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '仅支持 POST 请求' })
  }

  try {
    const { image, filename } = req.body

    if (!image || !filename) {
      return res.status(400).json({ success: false, message: '缺少必要参数' })
    }

    // 验证是否为 base64 图片
    const matches = image.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/)
    if (!matches) {
      return res.status(400).json({ success: false, message: '无效的图片格式' })
    }

    const imageFormat = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')

    // 验证文件大小（10MB）
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: '图片大小不能超过 10MB' })
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const finalFilename = `${timestamp}_${safeFilename}`
    
    // 保存到 public/avatars 目录
    const avatarPath = join(process.cwd(), 'public', 'avatars', finalFilename)
    await writeFile(avatarPath, buffer)

    // 返回可访问的 URL
    const avatarUrl = `/avatars/${finalFilename}`

    console.log('✅ 头像上传成功:', avatarUrl)

    return res.status(200).json({
      success: true,
      avatarUrl,
      message: '头像上传成功',
    })
  } catch (error) {
    console.error('❌ 头像上传失败:', error)
    return res.status(500).json({
      success: false,
      message: '头像上传失败',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

