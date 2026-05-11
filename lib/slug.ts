import { customAlphabet } from 'nanoid'

// 8 字符 url-safe slug。DB 列 unique，碰撞时由 caller 重试。
const nano = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

export function newSlug() {
  return nano()
}
