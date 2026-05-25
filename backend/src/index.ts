import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { employeeRoutes } from './routes/employees'
import { analyticsRoutes } from './routes/analytics'

const app = Fastify({ logger: true })

async function bootstrap() {
  await app.register(cors, { origin: true })

  await app.register(swagger, {
    openapi: {
      info: { title: 'Salary Management API', version: '1.0.0' },
    },
  })
  await app.register(swaggerUi, { routePrefix: '/docs' })

  await app.register(employeeRoutes, { prefix: '/api/employees' })
  await app.register(analyticsRoutes, { prefix: '/api/analytics' })

  app.get('/health', async () => ({ status: 'ok' }))

  const port = Number(process.env.PORT ?? 3001)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`Server running on port ${port}`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
