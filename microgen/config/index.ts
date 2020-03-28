import dotenv from 'dotenv'

dotenv.config({ path: '.env.generator' })

export default {
  PORT_START: parseInt(process.env.PORT_START as string)
}