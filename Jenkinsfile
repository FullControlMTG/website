pipeline {
  agent any

  environment {
    COMPOSE_FILE = 'docker-compose.yml'
    SERVICE      = 'website'
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
          docker network inspect traefik >/dev/null 2>&1 || { echo "missing docker network 'traefik'" >&2; exit 1; }
          docker compose -f "$COMPOSE_FILE" config -q
        '''
      }
    }

    stage('Teardown') {
      steps {
        sh 'docker compose -f "$COMPOSE_FILE" down --remove-orphans'
      }
    }

    stage('Build & Deploy') {
      steps {
        sh 'docker compose -f "$COMPOSE_FILE" up -d --build'
      }
    }

    stage('Health Check') {
      steps {
        sh '''
          set -eu
          cid="$(docker compose -f "$COMPOSE_FILE" ps -q "$SERVICE")"
          [ -n "$cid" ] || { echo "$SERVICE container not found" >&2; exit 1; }

          # The image defines a HEALTHCHECK (wget against 127.0.0.1:3000/healthz);
          # wait for Docker to report healthy, failing fast on terminal states.
          deadline=$(( $(date +%s) + 120 ))
          while :; do
            status="$(docker inspect -f '{{.State.Status}}' "$cid")"
            health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$cid")"
            [ "$status" = "running" ] && [ "$health" = "healthy" ] && break
            [ "$health" = "unhealthy" ] && { echo "$SERVICE reported unhealthy" >&2; exit 1; }
            case "$status" in
              exited|dead) echo "$SERVICE container $status before becoming healthy" >&2; exit 1 ;;
            esac
            [ "$(date +%s)" -ge "$deadline" ] && { echo "timed out waiting for healthy (status=$status, health=$health)" >&2; exit 1; }
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

          # /healthz proves the server is up; this proves the build actually deployed:
          # GET / must return 200 and serve the rendered app shell, not a broken build.
          if ! body="$(docker exec "$cid" wget -q -O - http://127.0.0.1:3000/)"; then
            echo "GET / did not return a successful response" >&2; exit 1
          fi
          echo "$body" | grep -q '<title>FullControlMTG</title>' || { echo "GET / response missing expected app marker" >&2; exit 1; }
          echo "smoke test passed"
        '''
      }
    }
  }

  post {
    always {
      discordSend(
        webhookURL: 'https://discordapp.com/api/webhooks/1516612903271403692/bDRkplqAkHvTBfjlmCeURNLTJNOWhorDMZIjXypzlQj9UlsgKtyv695g6zJdNXu-0Wr1',
        title: "${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
        link: env.BUILD_URL,
        result: currentBuild.currentResult,
        description: "Jenkins Build Status: **${currentBuild.currentResult}**"
      )
    }

    failure {
      sh 'docker compose -f "$COMPOSE_FILE" ps || true'
      sh 'docker compose -f "$COMPOSE_FILE" logs --tail=200 || true'
    }
  }
}
