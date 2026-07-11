pipeline {
  agent any

  environment {
    COMPOSE_FILE    = 'docker-compose.yml'
    SERVICE         = 'website'
    CONTAINER       = 'fullcontrolmtg-website'
    DOCKER_NETWORK  = 'traefik'
    CI_IMAGE        = "fullcontrolmtg-website-ci:${env.BUILD_NUMBER}"
    APP_PORT        = '3000'
    HEALTH_TIMEOUT  = '120'
    SMOKE_MARKER    = '<title>FullControlMTG</title>'
    DISCORD_WEBHOOK = credentials('discord-pws-builds-channel-webhook')
  }

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Preflight') {
      steps {
        sh '''
          set -eu
          docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1 \
            || { echo "missing docker network '$DOCKER_NETWORK'" >&2; exit 1; }
          docker compose -f "$COMPOSE_FILE" config -q \
            || { echo "invalid $COMPOSE_FILE" >&2; exit 1; }
        '''
      }
    }

    stage('Lint & Type-check') {
      steps {
        sh '''
          set -eu
          # The build target runs npm ci + next build, so compile errors surface here —
          # before Teardown takes the live site down.
          docker build --target build -t "$CI_IMAGE" . \
            || { echo "next build failed to compile" >&2; exit 1; }
          docker run --rm "$CI_IMAGE" npm run lint \
            || { echo "eslint reported errors" >&2; exit 1; }
        '''
      }
    }

    stage('Teardown') {
      steps {
        sh '''
          set -eu
          docker compose -f "$COMPOSE_FILE" down --remove-orphans || true
          # compose down only removes containers it still tracks; a lingering fixed-name
          # container would collide on up.
          docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
        '''
      }
    }

    stage('Build & Deploy') {
      steps {
        sh '''
          set -eu
          docker compose -f "$COMPOSE_FILE" up -d --build \
            || { echo "compose up failed" >&2; exit 1; }
        '''
      }
    }

    stage('Health Check') {
      steps {
        sh '''
          set -eu
          cid="$(docker compose -f "$COMPOSE_FILE" ps -q "$SERVICE")"
          [ -n "$cid" ] || { echo "$SERVICE container not found" >&2; exit 1; }

          deadline=$(( $(date +%s) + HEALTH_TIMEOUT ))
          while :; do
            state="$(docker inspect -f '{{.State.Status}}' "$cid")"
            health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$cid")"
            [ "$state" = "running" ] && [ "$health" = "healthy" ] && break
            [ "$health" = "unhealthy" ] && { echo "$SERVICE reported unhealthy" >&2; exit 1; }
            case "$state" in
              exited|dead) echo "$SERVICE container $state before becoming healthy" >&2; exit 1 ;;
            esac
            [ "$(date +%s)" -ge "$deadline" ] \
              && { echo "timed out waiting for healthy (state=$state, health=$health)" >&2; exit 1; }
            sleep 2
          done
          echo "$SERVICE healthy"
        '''
      }
    }

    stage('Smoke Test') {
      steps {
        sh '''
          set -eu
          cid="$(docker compose -f "$COMPOSE_FILE" ps -q "$SERVICE")"
          [ -n "$cid" ] || { echo "$SERVICE container not found" >&2; exit 1; }

          # /healthz proves the server is up; this proves the build actually deployed.
          if ! body="$(docker exec "$cid" wget -q -O - "http://127.0.0.1:$APP_PORT/")"; then
            echo "GET / did not return a successful response" >&2; exit 1
          fi
          echo "$body" | grep -q "$SMOKE_MARKER" \
            || { echo "GET / response missing expected app marker" >&2; exit 1; }
          echo "smoke test passed"
        '''
      }
    }
  }

  post {
    always {
      sh 'docker image rm -f "$CI_IMAGE" >/dev/null 2>&1 || true'
      script {
        def changeLog = 'No recent changes detected.'
        def commits = currentBuild.changeSets.collectMany { it.items as List }
        if (commits.size() > 0) {
          changeLog = commits.collect { "> ${it.msg} (by *${it.author.displayName}*)" }.join('\n')
        }

        def statusEmoji = [
          'SUCCESS': ':green_circle:',
          'FAILURE': ':red_circle:'
        ].getOrDefault(currentBuild.currentResult, ':yellow_circle:')

        def duration = currentBuild.durationString
          .replace(' and no weeks', '')
          .replace(' and counting', '')

        // Assembled flush-left: interpolating a multi-line changelog into an indented
        // triple-quote defeats stripIndent() and Discord then renders it as a code block.
        def discordDescription = [
          "**Status:** ${statusEmoji} ${currentBuild.currentResult}",
          "**Branch:** `${env.BRANCH_NAME ?: 'Main/Manual'}`",
          "**Duration:** :stopwatch: ${duration}",
          '',
          '**Commits:**',
          changeLog
        ].join('\n')

        discordSend(
          webhookURL: env.DISCORD_WEBHOOK,
          title: "📦 Build Alert: ${env.JOB_NAME} [Build #${env.BUILD_NUMBER}]",
          link: "${env.BUILD_URL}",
          result: "${currentBuild.currentResult}",
          description: discordDescription
        )
      }
    }

    failure {
      sh 'docker compose -f "$COMPOSE_FILE" ps || true'
      sh 'docker compose -f "$COMPOSE_FILE" logs --tail=200 || true'
    }
  }
}
