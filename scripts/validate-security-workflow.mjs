import { existsSync, readFileSync } from 'node:fs';

const workflowPath = '.github/workflows/security.yml';
const ciWorkflowPath = '.github/workflows/ci.yml';
const dependabotPath = '.github/dependabot.yml';
const rulesPath = '.zap/rules.tsv';
const documentationPath = 'docs/security-scanning.md';
const failures = [];

if (!existsSync(workflowPath)) {
  failures.push(`${workflowPath} exists`);
} else {
  const workflow = readFileSync(workflowPath, 'utf8');
  const checks = [
    ['runs for pull requests and pushes to master', /on:\s*\n(?=[\s\S]*pull_request:)(?=[\s\S]*push:\s*\n\s*branches:\s*\[master\])/],
    ['uses least-privilege default permissions', /permissions:\s*\n\s*contents:\s*read\b/],
    ['defines CodeQL SAST jobs for JavaScript/TypeScript and Actions', /sast:\s*\n[\s\S]*language:\s*\[javascript-typescript, actions\][\s\S]*github\/codeql-action\/init@[0-9a-f]{40}[\s\S]*languages:\s*\$\{\{ matrix\.language \}\}[\s\S]*github\/codeql-action\/analyze@[0-9a-f]{40}/],
    ['grants security-events write only to SAST', /sast:\s*\n[\s\S]*permissions:\s*\n\s*contents:\s*read\b\s*\n\s*security-events:\s*write\b/],
    ['builds the demo runtime before DAST', /dast:\s*\n[\s\S]*npm run build -- --configuration production/],
    ['runs the OWASP ZAP baseline against the built runtime', /zaproxy\/action-baseline@[0-9a-f]{40}[\s\S]*target:\s*["']http:\/\/127\.0\.0\.1:\d+["']/],
    ['fails DAST on warning-level or higher findings', /fail_action:\s*true[\s\S]*cmd_options:\s*["'][^"']*-l WARN[^"']*["']/],
    ['uses an explicit reviewed ZAP rules file', /rules_file_name:\s*["']\.zap\/rules\.tsv["']/],
  ];

  for (const [description, pattern] of checks) {
    if (!pattern.test(workflow)) failures.push(description);
  }
}

if (!existsSync(ciWorkflowPath) || !/npm run validate:security-workflow/.test(readFileSync(ciWorkflowPath, 'utf8'))) {
  failures.push('runs this policy validator in the main CI job');
}

if (!existsSync(rulesPath)) {
  failures.push('provides the reviewed ZAP baseline rules file');
}

if (!existsSync(documentationPath)) {
  failures.push('documents baseline triage and required status checks');
} else {
  const documentation = readFileSync(documentationPath, 'utf8');
  const documentationChecks = [
    ['documents the initial finding baseline', /initial baseline/i],
    ['documents CodeQL new-alert merge protection', /code scanning.*new.*alert/is],
    ['names the DAST required status check', /DAST \(OWASP ZAP\)/],
    ['documents exception rationale and expiry', /rationale[\s\S]*expir/i],
    ['states that Dependabot remains complementary', /Dependabot[\s\S]*complement/i],
  ];
  for (const [description, pattern] of documentationChecks) {
    if (!pattern.test(documentation)) failures.push(description);
  }
}

if (!existsSync(dependabotPath)) {
  failures.push('keeps the existing Dependabot configuration');
}

if (failures.length > 0) {
  console.error('Security CI policy validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`${workflowPath} passes security CI policy validation.`);
