import { Hono } from 'hono'

const image = new Hono()

image.get('/random', (c) => {
  // Use a random seed so each request returns a different picsum image URL
  const seed = Math.random().toString(36).slice(2)
  const url = `https://picsum.photos/seed/${seed}/600/400`
  return c.json({ url })
})

export { image }
