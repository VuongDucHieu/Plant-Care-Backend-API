import { Router } from 'express';
import { ReadinessState } from '../../infra/health/readiness-state.js';

export function createHealthRouter(readinessState: ReadinessState) {
  const router = Router()

  //Legacy health endpoint
  router.get('/', (_req, res) => {
    return res.status(200).json({ status: 'ok' })
  })

  //Liveness
  router.get('/liveness', (_req, res) => {
    return res.status(200).json({ status: 'alive' })
  })

  //Readiness
  router.get('/ready', (_req, res) => {
    if (!readinessState.isReady()) {
      return res.status(503).json({ status: 'not ready' })
    }

    return res.status(200).json({
      status: 'ready'
    })
  })

  return router;
}