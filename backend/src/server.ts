import app from './app';
import { env } from './config/env.config';

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 [Skipli Sales Backend] Server running on http://localhost:${PORT}`);
  console.log(`🔗 Health check endpoint: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
