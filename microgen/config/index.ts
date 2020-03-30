import dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

export default {
  PORT_START: parseInt(process.env.PORT_START as string)
}