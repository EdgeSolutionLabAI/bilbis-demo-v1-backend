import { Hono } from 'hono'

const rollDice = new Hono()

rollDice.get('/', (c) => {
  return c.json({
    dice1: Math.floor(Math.random() * 6) + 1,
    dice2: Math.floor(Math.random() * 6) + 1,
  })
})

export { rollDice }
