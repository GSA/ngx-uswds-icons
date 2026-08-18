# Security scanning

The `Security` GitHub Actions workflow complements Dependabot's dependency-update coverage with static and dynamic application security testing. Dependabot remains complementary and is not replaced. The workflow runs on every pull request, every push to `master`, and manual dispatches.

## Gates

- **Analyze (`javascript-typescript`)** and **Analyze (`actions`)** are provided by the repository's CodeQL default setup. Code scanning merge protection should block pull requests that introduce a new medium- or high-severity alert. The default setup is intentionally not duplicated in `security.yml`, because GitHub rejects advanced-configuration SARIF uploads while default setup is enabled.
- **DAST (OWASP ZAP)** builds and serves the production Angular demo with representative production security headers, then runs the ZAP baseline scanner. A separate report parser fails the job only for unexcepted alerts whose JSON `riskcode` is medium (`2`) or high (`3`); low-risk alerts remain visible in the retained `zap-report` artifact.

Repository administrators must add these required status checks to the `master` branch protection or ruleset:

- `Analyze (javascript-typescript)`
- `Analyze (actions)`
- `DAST (OWASP ZAP)`

They must also enable the GitHub ruleset option **Code scanning results → Require code scanning results**, selecting CodeQL and the threshold that blocks new medium-or-higher alerts. Branch protection and rulesets are admin-owned settings and cannot be applied by this repository change alone.

## Initial baseline and triage

The initial scan found six low-risk missing-header alerts from Python's development file server. The workflow now uses a server with representative production headers, and the follow-up scan identified two medium-risk header gaps that were fixed (`form-action` in CSP and Cross-Origin-Embedder-Policy). `.zap/rules.tsv` therefore contains no ignored alerts. ZAP's rule actions do not determine the gate: the JSON report's risk codes do, so pre-existing low-risk observations remain report-only while medium/high findings block immediately. CodeQL's pull-request comparison identifies findings introduced by changed code; existing default-branch findings remain visible in Security → Code scanning for separate triage rather than red-walling the rollout.

Before making the checks required, run the workflow on `master` and triage every existing finding. Create a remediation issue for each valid finding. A finding that is demonstrably not exploitable may be dismissed in GitHub code scanning or temporarily added to the ZAP rules file using the process below.

## Exception policy

For ZAP, use one tab-separated row per exception:

```text
rule-id<TAB>IGNORE<TAB>issue-url<TAB>owner<TAB>expiry(YYYY-MM-DD)<TAB>rationale
```

The policy validator rejects malformed or expired rows. Every exception must be reviewed in a pull request and include:

1. the scanner rule or alert identifier;
2. a link to its triage or remediation issue;
3. the technical rationale for accepting or suppressing it;
4. an owner and an expiry date; and
5. the narrowest available scope.

Expired exceptions must be removed or explicitly renewed through review. Never lower the workflow threshold or broadly ignore medium/high findings to make CI pass.

## Local validation

Run the policy validator whenever the security workflow, baseline, or this document changes:

```sh
npm run validate:security-workflow
```

The actual CodeQL and containerized ZAP scans run in GitHub Actions. Download `zap-report` from a workflow run to inspect DAST evidence.
