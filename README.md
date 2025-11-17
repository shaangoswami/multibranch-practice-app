# Jenkins-Practice-lab ♾️ 💻

A small demo application used to practice Jenkins multibranch pipeline workflows and CI/CD patterns.

This repository is designed as a learning/practice project to demonstrate:
- Jenkins Multibranch Pipeline setup with GitHub (branches + PRs)
- Automated build, test, and (optionally) Docker image build & push
- Promotion to staging and production with approval gates
- How pipelines treat branch types (feature/*, develop, main) and pull requests

---

## Table of contents ☑️☑️☑️

- Prerequisites
- Branch & pipeline strategy
- Jenkins Multibranch Pipeline — setup
- Example Jenkinsfile (Declarative)
- Typical CI/CD flow
- Environment variables / secrets
- Troubleshooting tips
- Contributing
- License
- Contact

---

---

## Prerequisites 🌟🌟🌟

- GitHub repository (this repo)
- Jenkins server (2.289+ recommended) with:
  - Git plugin
  - GitHub Branch Source plugin
  - Pipeline (workflow) plugin
  - Docker plugin (optional, if building images)
  - Credentials configured for GitHub and Docker registry (if needed)
- Optional: Docker daemon on the Jenkins agent if you want to build images

---

## Branch & pipeline strategy 

Recommended branch naming / behavior:

- main (or master)
  - Production-ready code. Pipeline runs integration tests & deploys to production via a manual approval step.
- develop
  - Integration branch. Runs full CI and deploys to staging automatically on success.
- feature/* (e.g., feature/add-login)
  - Built and tested by Jenkins. PRs from feature branches trigger a branch/PR build. Do not auto-deploy.
- hotfix/* 
  - Built, tested, and may be promoted directly to production after approvals.
- PRs
  - Pull request builds should be configured to run tests and report status back to GitHub (so maintainers can review).

---

---

## Jenkins Multibranch Pipeline — setup

1. On Jenkins, create a new item > "Multibranch Pipeline".
2. Enter a name (e.g., multibranch-practice-app).
3. Under Branch Sources, add GitHub:
   - Set repository URL: https://github.com/shaangoswami/multibranch-practice-app
   - Provide credentials (if private).
   - Configure discovery strategies:
     - Discover branches
     - Discover pull requests from origin/forks as needed
4. Under Build Configuration, set "Mode" to "by Jenkinsfile" and provide the Jenkinsfile path if not the root.
5. Configure webhooks on GitHub (Branch Source plugin provides a webhook URL) so Jenkins automatically scans on push and PR events.
6. Configure credentials for Docker registry if you intend to push images.
7. Save — Jenkins will scan branches and create jobs for each branch/PR that contains a Jenkinsfile.

---

## Jenkinsfile (Declarative)

Below is an example declarative pipeline that works in a multibranch setup. It:
- Builds and tests
- Optionally builds and pushes a Docker image (if DOCKER_REGISTRY is set)
- Deploys to staging automatically for develop
- Requires manual approval for production deploys (main)

Place this as `Jenkinsfile` at repo root.

---

## Typical CI/CD flow

- Developer pushes a branch or opens a PR.
- Jenkins Multibranch automatically detects the change and creates/runs a pipeline for that branch or PR.
- The pipeline runs build and tests, and reports status back to GitHub (pass/fail).
- On develop branch: successful builds deploy to staging.
- On main branch: successful builds require manual approval before deployment to production.
- If Docker registry is configured, images are built and pushed and image tags include branch/build id.

---

## Environment variables / secrets

Store sensitive data in Jenkins Credentials and inject them into the pipeline. Common items:
- GitHub tokens (if repo is private)
- Docker registry username/password or a credentials binding
- Cloud provider keys for deployment (AWS, GCP, Azure)
- Any API keys used by tests

Recommend using Jenkins Credentials + withCredentials to avoid plaintext.

---

## ⁉️ Troubleshooting tips ⁉️

- "No Jenkinsfile found": Ensure Jenkinsfile exists at repo root or configure the path in multibranch job.
- Builds not triggered on PRs: Ensure branch source discovery includes PRs and GitHub webhook is configured.
- Docker build failures: Ensure agent has Docker or use a Docker-in-Docker agent or Jenkins Docker plugin.
- Tests failing only on Jenkins: Reproduce locally in the same environment (same JDK/node/python version).

---

## Contributing 

This is a practice repo. If you want to extend:
- Add a real build for your language (package.json, pom.xml, etc.)
- Add unit/integration tests and test report publishing
- Add pipeline stages for code quality (linting, SonarQube)
- Add environment-specific deployment manifests (e.g., Kubernetes YAML)

---

## License

Use whatever license you prefer. (No license file included by default.)

---

## Contact 

Maintainer: vdiaries000@gmail.com

---

Happy practicing 😉 — use this repo to explore multibranch Jenkins behavior for branches and PRs and tweak the Jenkinsfile to match your toolchain.
