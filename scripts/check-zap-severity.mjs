import { readFileSync } from 'node:fs';

const reportPath = process.argv[2] ?? 'report_json.json';
const rulesPath = process.argv[3] ?? '.zap/rules.tsv';
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const ignoredRuleIds = new Set(
  readFileSync(rulesPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.startsWith('#'))
    .map((line) => line.split('\t'))
    .filter(([, action]) => action === 'IGNORE')
    .map(([ruleId]) => ruleId),
);

const blockingAlerts = (report.site ?? [])
  .flatMap((site) => site.alerts ?? [])
  .filter((alert) => Number(alert.riskcode) >= 2 && !ignoredRuleIds.has(String(alert.pluginid)));

if (blockingAlerts.length > 0) {
  console.error('ZAP found medium- or high-risk alerts:');
  for (const alert of blockingAlerts) {
    console.error(`- [${alert.pluginid}] ${alert.alert}: ${alert.riskdesc}`);
  }
  process.exit(1);
}

console.log('ZAP found no unexcepted medium- or high-risk alerts.');
