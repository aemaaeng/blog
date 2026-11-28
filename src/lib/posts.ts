import { getCollection } from "astro:content"

// 공개 글만, 최신순
export async function getPosts() {
  const posts = await getCollection("posts", ({ data }) => !data.draft)
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
}

export function formatDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}
