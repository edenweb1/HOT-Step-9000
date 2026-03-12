import { Router, Response, Request } from 'express';
import { config } from '../config/index.js';

const router = Router();

// Proxy system metrics from Python API
router.get('/metrics', async (_req: Request, res: Response) => {
    try {
        const response = await fetch(`${config.acestep.apiUrl}/v1/system/metrics`);
        if (!response.ok) {
            res.status(response.status).json({ error: 'Failed to fetch metrics' });
            return;
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(502).json({ error: 'Python API unreachable' });
    }
});

// SSE endpoint that polls Python API logs and streams to client
router.get('/logs', async (req: Request, res: Response) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    });

    let cursor = -1;
    let alive = true;

    req.on('close', () => {
        alive = false;
    });

    const poll = async () => {
        while (alive) {
            try {
                const response = await fetch(
                    `${config.acestep.apiUrl}/v1/system/logs?after=${cursor}`
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data.lines && data.lines.length > 0) {
                        res.write(`data: ${JSON.stringify(data)}\n\n`);
                    }
                    cursor = data.cursor ?? cursor;
                }
            } catch {
                // Python API not reachable — send heartbeat to keep connection alive
                res.write(`: heartbeat\n\n`);
            }
            // Wait 1 second between polls
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    };

    poll().catch(() => { });
});

export default router;
