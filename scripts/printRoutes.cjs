// scripts/printRoutes.cjs
const path = require('path');
const { getRoutesAsync } = require('expo-router/build/getRoutes');

(async () => {
  const projectRoot = process.cwd();
  const routes = await getRoutesAsync(projectRoot, { platform: 'native' });
  for (const r of routes) {
    console.log(`${r.route}  ->  ${path.relative(projectRoot, r.file)}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
