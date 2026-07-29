import { readFileSync } from 'node:fs';

const workflowPath = '.github/workflows/publish.yml';
const workflow = readFileSync(workflowPath, 'utf8');

const checks = [
  ['triggers when a full GitHub Release is published', /on:\s*\n(?:.|\n)*release:\s*\n(?:.|\n)*types:\s*\[released\]/],
  ['supports manual dry-run rehearsals', /workflow_dispatch:\s*\n(?:.|\n)*dry-run:\s*\n(?:.|\n)*type:\s*boolean(?:.|\n)*default:\s*true/],
  ['keeps top-level permissions least-privilege', /permissions:\s*\n\s*contents:\s*read\b/],
  ['gates the publish job through the release environment', /publish:\s*\n(?:.|\n)*environment:\s*release\b/],
  ['grants OIDC only to the publish job', /publish:\s*\n(?:.|\n)*permissions:\s*\n\s*contents:\s*read\b\s*\n\s*id-token:\s*write\b/],
  ['sets up npm against the public registry', /registry-url:\s*["']https:\/\/registry\.npmjs\.org["']/],
  ['verifies the release tag matches projects/icons/package.json', /require\('\.\/projects\/icons\/package\.json'\)\.version/],
  ['builds the Angular package before publishing', /npm run build-prod/],
  ['publishes from the ng-packagr output directory', /working-directory:\s*dist\/icons\b/],
  ['enforces workflow_dispatch as dry-run only', /workflow_dispatch runs must use dry-run=true/],
  ['runs npm publish in dry-run mode by default', /npm publish --dry-run --access public --registry https:\/\/registry\.npmjs\.org/],
  [
    'can run live npm publish only for release events when dry-run is false',
    /if:\s*github\.event_name\s*==\s*(['"])release\1\s*&&\s*steps\.mode\.outputs\[(['"])dry-run\2\]\s*==\s*(['"])false\3(?:.|\n)*run:\s*npm publish --access public --registry https:\/\/registry\.npmjs\.org/,
  ],
  ['does not use long-lived npm token secrets', /NODE_AUTH_TOKEN|NPM_TOKEN|npm_[A-Za-z0-9]/, true],
];

const failures = [];
for (const [description, pattern, mustNotMatch = false] of checks) {
  const matched = pattern.test(workflow);
  if (mustNotMatch ? matched : !matched) {
    failures.push(description);
  }
}

if (failures.length > 0) {
  console.error(`${workflowPath} failed validation:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${workflowPath} passes publish workflow validation.`);
