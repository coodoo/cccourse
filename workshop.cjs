const fs = require('node:fs');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { maven } = require('./.workshop/maven.cjs');
const { command: launch, killTree } = require('./.workshop/proc.cjs');
const root = __dirname;
const command = process.argv[2] || 'help';
const next = command.endsWith('-next');
const base = next ? path.join(root, 'next') : root;
const api = fs.existsSync(path.join(base, 'backend', 'pom.xml')) ? path.join(base, 'backend') : base;
const frontend = path.join(base, 'frontend');
const frontendExists = fs.existsSync(path.join(frontend, 'package.json'));
const boot = api !== base;
function run(bin, args, cwd = api) {
  const c = launch(bin, args);
  const r = spawnSync(c.file, c.args, { cwd, stdio: 'inherit', env: process.env, shell: c.shell });
  if (r.error) throw r.error;
  if (r.status !== 0) throw Error(`${bin} failed (${r.status ?? r.signal})`);
}
async function main() {
  if (!['test', 'start', 'test-next', 'start-next'].includes(command)) {
    console.log('Usage: node workshop.cjs test|start|test-next|start-next');
    return;
  }
  if (!fs.existsSync(path.join(api, 'pom.xml'))) throw Error(`No prepared project at ${api}`);
  const mvn = await maven();
  if (command.startsWith('test')) {
    run(mvn, ['-B', '-q', 'test']);
    if (frontendExists) {
      run('pnpm', ['install', '--frozen-lockfile'], frontend);
      run('pnpm', ['build'], frontend);
    }
    const migrationTest = path.join(base, 'scripts', 'migrate.test.cjs');
    if (fs.existsSync(migrationTest)) run(process.execPath, ['--test', migrationTest], base);
    console.log('PASS: backend tests' + (frontendExists ? ' and Vue build' : ''));
    return;
  }
  if (frontendExists) {
    const builder = path.join(base, 'scripts', 'build-ui.cjs');
    if (fs.existsSync(builder)) run(process.execPath, [builder], base);
    else { run('pnpm', ['install', '--frozen-lockfile'], frontend); run('pnpm', ['build'], frontend); }
  }
  console.log(`Workshop app: http://127.0.0.1:${process.env.WORKSHOP_PORT || '8080'} (wait for server startup before opening)`);
  const children = [];
  const c = launch(mvn, ['-B', '-q', ...(boot ? ['spring-boot:run'] : ['compile', 'exec:java'])]);
  const backend = spawn(c.file, c.args, { cwd: api, stdio: 'inherit', env: process.env, shell: c.shell });
  children.push(backend);
  // Complete migration serves the built Vue app through Boot; a single origin avoids CORS.
  let stopping = false;
  function stop(signal) { stopping = true; for (const child of children) if (!child.killed) killTree(child, signal); }
  process.on('SIGINT', () => stop('SIGINT'));
  process.on('SIGTERM', () => stop('SIGTERM'));
  backend.on('error', error => { console.error(error.message); stop('SIGTERM'); process.exitCode = 1; });
  backend.on('exit', code => { if (!stopping && code) process.exitCode = code; });
}
main().catch(error => { console.error(`BLOCKED/FAIL: ${error.message}`); process.exitCode = 1; });
