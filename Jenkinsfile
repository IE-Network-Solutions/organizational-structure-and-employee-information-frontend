pipeline {
    agent any

    options {
        timeout(time: 45, unit: 'MINUTES')
    }

    stages {

        stage('Select Environment') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'REMOTE_SERVER_TEST', variable: 'REMOTE_SERVER_TEST'),
                        string(credentialsId: 'REMOTE_SERVER_PROD', variable: 'REMOTE_SERVER_PROD')
                    ]) {
                        def branchName = env.GIT_BRANCH ?: sh(
                            script: "git rev-parse --abbrev-ref HEAD",
                            returnStdout: true
                        ).trim()

                        // strip any 'origin/' prefix so matches are exact, not substring-based
                        branchName = branchName.replaceFirst(/^origin\//, '')

                        // stash the resolved branch name for later reference —
                        // env.BRANCH_NAME gets overwritten by the Fetch Application Variables stage
                        env.RESOLVED_BRANCH = branchName

                        // exact match only — no .contains(), so there's no ordering trap between
                        // 'production' and 'core-production' (previously 'production' was checked
                        // before 'core-production', and since "core-production".contains('production")
                        // is true, core-production builds were silently using production's secrets)
                        if (branchName == 'develop-redesign-branch') {
                            env.REMOTE_SERVER = REMOTE_SERVER_TEST
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.osei-front-env-redesign'
                            env.SECRET_KEY = 'peptest'

                        } else if (branchName == 'develop') {
                            env.REMOTE_SERVER = REMOTE_SERVER_TEST
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.osei-front-env'
                            env.SECRET_KEY = 'peptest'

                        } else if (branchName == 'staging') {
                            env.REMOTE_SERVER = REMOTE_SERVER_PROD
                            env.SECRETS_PATH = '/home/ubuntu/secrets/staging/.osei-front-env'
                            env.SECRET_KEY = 'pepproduction'

                        } else if (branchName == 'core-production') {
                            env.REMOTE_SERVER = REMOTE_SERVER_PROD
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.core-workspace-env'
                            env.SECRET_KEY = 'pepproduction'

                        } else if (branchName == 'production') {
                            env.REMOTE_SERVER = REMOTE_SERVER_PROD
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.osei-front-env'
                            env.SECRET_KEY = 'pepproduction'

                        } else {
                            error "Unrecognized branch '${branchName}': no matching environment (develop/develop-redesign-branch/staging/production/core-production)."
                        }
                    }
                }
            }
        }

        stage('Fetch Application Variables') {
            steps {
                sshagent(credentials: [env.SECRET_KEY]) {
                    script {
                        def secretsFile = env.SECRETS_PATH

                        env.REPO_URL = sh(
                            script: "#!/bin/bash\nssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep REPO_URL ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.BRANCH_NAME = sh(
                            script: "#!/bin/bash\nssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep BRANCH_NAME ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.REPO_DIR = sh(
                            script: "#!/bin/bash\nssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep REPO_DIR ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.DOCKERHUB_REPO = sh(
                            script: "#!/bin/bash\nssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep DOCKERHUB_REPO ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.SERVICE_NAME = sh(
                            script: "#!/bin/bash\nssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep SERVICE_NAME ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.VAULT_ADDR = sh(
                            script: "#!/bin/bash\nssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep VAULT_ADDR ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.VAULT_USERNAME = sh(
                            script: "#!/bin/bash\nssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep VAULT_USERNAME ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.VAULT_PASSWORD = sh(
                            script: "#!/bin/bash\nssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep VAULT_PASSWORD ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.VAULT_SECRET_PATH = sh(
                            script: "#!/bin/bash\nssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep VAULT_SECRET_PATH ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        if (!env.REPO_URL?.trim())       { error "REPO_URL is empty — check ${secretsFile} (permission or missing key)" }
                        if (!env.BRANCH_NAME?.trim())    { error "BRANCH_NAME is empty — check ${secretsFile} (permission or missing key)" }
                        if (!env.REPO_DIR?.trim())       { error "REPO_DIR is empty — check ${secretsFile} (permission or missing key)" }
                        if (!env.DOCKERHUB_REPO?.trim()) { error "DOCKERHUB_REPO is empty — check ${secretsFile} (permission or missing key)" }
                        if (!env.SERVICE_NAME?.trim())   { error "SERVICE_NAME is empty — check ${secretsFile} (permission or missing key)" }
                    }
                }
            }
        }

        stage('Prepare Repository') {
            steps {
                sshagent(credentials: [env.SECRET_KEY]) {
                    sh """#!/bin/bash
                        set -e
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                            if [ -d "${env.REPO_DIR}" ]; then
                                sudo chown -R \$USER:\$USER ${env.REPO_DIR}
                                sudo chmod -R 755 ${env.REPO_DIR}
                            fi
                        '
                    """
                }
            }
        }

        stage('Pull Latest Changes') {
            steps {
                sshagent(credentials: [env.SECRET_KEY]) {
                    // shebang suppresses Jenkins' default `set -x` trace, which was printing
                    // the PAT embedded in REPO_URL into the console log
                    sh """#!/bin/bash
                        set -e
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                            if [ ! -d "${env.REPO_DIR}/.git" ]; then
                                git clone ${env.REPO_URL} -b ${env.BRANCH_NAME} ${env.REPO_DIR}
                            else
                                cd ${env.REPO_DIR} &&
                                git fetch origin ${env.BRANCH_NAME} &&
                                git reset --hard origin/${env.BRANCH_NAME} &&
                                git clean -fdx
                            fi
                        '
                    """
                }
            }
        }

        stage('Build and Push Docker Image') {
            steps {
                sshagent(credentials: [env.SECRET_KEY]) {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'dockerhub',
                            usernameVariable: 'DOCKERHUB_USERNAME',
                            passwordVariable: 'DOCKERHUB_PASSWORD'
                        )
                    ]) {
                        // shebang suppresses the `set -x` trace that was printing VAULT_PASSWORD
                        sh """#!/bin/bash
                            set -e
                            ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} "
                                set -e

                                echo 'Logging into Docker Hub...'
                                echo '${DOCKERHUB_PASSWORD}' | docker login -u '${DOCKERHUB_USERNAME}' --password-stdin || { echo 'Docker login failed'; exit 1; }

                                echo 'Building Docker image...'
                                cd ${env.REPO_DIR}
                                docker build \\
                                    --build-arg VAULT_ADDR='${env.VAULT_ADDR}' \\
                                    --build-arg VAULT_USERNAME='${env.VAULT_USERNAME}' \\
                                    --build-arg VAULT_PASSWORD='${env.VAULT_PASSWORD}' \\
                                    --build-arg VAULT_SECRET_PATH='${env.VAULT_SECRET_PATH}' \\
                                    --build-arg VAULT_CACHE_BUSTER=\$(date +%s) \\
                                    -t ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} . || { echo 'Docker build failed'; exit 1; }

                                echo 'Pushing Docker image...'
                                docker push ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} || { echo 'Docker push failed'; exit 1; }

                                echo 'Cleaning up old images...'
                                docker image prune -f

                                echo 'Build and push completed successfully.'
                            "
                        """
                    }
                }
            }
        }

        stage('Deploy Service') {
            steps {
                sshagent(credentials: [env.SECRET_KEY]) {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'dockerhub',
                            usernameVariable: 'DOCKERHUB_USERNAME',
                            passwordVariable: 'DOCKERHUB_PASSWORD'
                        )
                    ]) {
                        sh """#!/bin/bash
                            set -e
                            ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                                set -e

                                echo "${DOCKERHUB_PASSWORD}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin || { echo "Docker login failed"; exit 1; }

                                docker pull ${DOCKERHUB_REPO}:${BRANCH_NAME} || { echo "Docker pull failed"; exit 1; }

                                if docker service inspect ${SERVICE_NAME} >/dev/null 2>&1; then
                                    echo "Updating existing service ${SERVICE_NAME}..."
                                    docker service update \\
                                        --image ${DOCKERHUB_REPO}:${BRANCH_NAME} \\
                                        --with-registry-auth \\
                                        --force ${SERVICE_NAME} || { echo "Service update failed"; exit 1; }
                                else
                                    if [ "${BRANCH_NAME}" = "staging" ]; then
                                        docker stack deploy --with-registry-auth -c stage-docker-compose.yml staging || { echo "Stack deploy (staging) failed"; exit 1; }
                                    elif [ "${BRANCH_NAME}" = "develop-redesign-branch" ]; then
                                        docker stack deploy --with-registry-auth -c redesign-docker-compose.yml redesign || { echo "Stack deploy (redesign) failed"; exit 1; }
                                    elif [ "${BRANCH_NAME}" = "core-production" ]; then
                                        docker stack deploy --with-registry-auth -c core-docker-compose.yml service || { echo "Stack deploy (core-prod) failed"; exit 1; }
                                    else
                                        docker stack deploy --with-registry-auth -c docker-compose.yml pep || { echo "Stack deploy (prod/develop) failed"; exit 1; }
                                    fi
                                fi
                            '
                        """
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                sshagent(credentials: [env.SECRET_KEY]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                            echo "Verifying deployment status..."

                            for i in {1..20}; do
                                STATUS=\$(docker service inspect --format "{{ if .UpdateStatus }}{{ .UpdateStatus.State }}{{ else }}none{{ end }}" ${env.SERVICE_NAME} 2>/dev/null)

                                [ -z "\$STATUS" ] && STATUS="none"
                                echo "Current update status: \$STATUS"

                                if [ "\$STATUS" = "rollback_started" ] || [ "\$STATUS" = "rollback_completed" ] || [ "\$STATUS" = "rollback_paused" ]; then
                                    echo "Service is rolling back! Deployment failed."
                                    exit 1
                                fi

                                if [ "\$STATUS" = "completed" ] || [ "\$STATUS" = "none" ]; then
                                    echo "Service update completed successfully."
                                    break
                                fi

                                sleep 5
                            done
                        '
                    """
                }
            }
        }

        stage('Sync core-develop from develop') {
            when {
                expression { env.RESOLVED_BRANCH == 'develop' }
            }
            steps {
                // the deployment itself is already done and verified by this point —
                // a failed branch mirror marks the build UNSTABLE, not FAILURE
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE',
                           message: 'core-develop sync failed — the deployment itself succeeded') {
                    // REPO_URL (from the secrets file) already carries its own credentials and is
                    // what the clone/fetch in Pull Latest Changes uses. It is referenced as a shell
                    // variable, never interpolated into the script text, so the token stays out of
                    // the console log.
                    sh '''#!/bin/bash
                        set -e
                        rm -rf sync-tmp
                        git clone "$REPO_URL" sync-tmp
                        cd sync-tmp
                        git config user.email "jenkins@ienetworks.co"
                        git config user.name "Jenkins CI"
                        git fetch origin develop core-develop

                        # Make core-develop EXACTLY match develop...
                        git checkout -B core-develop origin/develop

                        # ...except keep core-develop's own Jenkinsfile (different env/branch logic)
                        git checkout origin/core-develop -- Jenkinsfile
                        git clean -fd

                        # Only push if the content actually differs.
                        # (The old second test, `git diff --quiet HEAD --`, could never pass:
                        #  restoring Jenkinsfile always leaves a staged change, so every build
                        #  force-pushed a new commit even when nothing had changed.)
                        if git diff --quiet origin/core-develop -- . ':!Jenkinsfile'; then
                            echo "core-develop already matches develop (excl. Jenkinsfile) — nothing to sync."
                        else
                            git add -A
                            git commit -m "Sync from develop (build ${BUILD_NUMBER})"
                            git push origin HEAD:core-develop --force
                        fi

                        cd ..
                        rm -rf sync-tmp
                    '''
                }
            }
        }

        // stage('Sync core-production from production') {
        //     when {
        //         expression { env.RESOLVED_BRANCH == 'production' }
        //     }
        //     steps {
        //         withCredentials([
        //             usernamePassword(
        //                 credentialsId: 'github-pat',
        //                 usernameVariable: 'GH_USER',
        //                 passwordVariable: 'GH_TOKEN'
        //             )
        //         ]) {
        //             sh '''
        //                 set -e

        //                 rm -rf sync-tmp

        //                 git clone "https://${GH_TOKEN}@github.com/IE-Network-Solutions/selamnew-collaboration-fe.git" sync-tmp

        //                 cd sync-tmp

        //                 git config user.email "jenkins@ienetworks.co"
        //                 git config user.name "Jenkins CI"

        //                 git fetch origin production core-production

        //                 echo "Switching to core-production..."

        //                 git checkout core-production

        //                 echo "Making core-production match production..."

        //                 git reset --hard origin/production

        //                 echo "Restoring core-production Jenkinsfile..."

        //                 git checkout origin/core-production -- Jenkinsfile

        //                 git clean -fd

        //                 if git diff --quiet origin/core-production -- . ':!Jenkinsfile' 2>/dev/null && \
        //                    git diff --quiet HEAD --; then

        //                     echo "core-production already matches production (excluding Jenkinsfile)."

        //                 else

        //                     git add -A

        //                     git commit -m "Sync from production (build ${BUILD_NUMBER})" || \
        //                         echo "Nothing to commit"

        //                     git push origin HEAD:core-production --force

        //                     echo "core-production synchronized successfully."

        //                 fi

        //                 cd ..

        //                 rm -rf sync-tmp
        //             '''
        //         }
        //     }
        // }
    }

    post {
        success {
            script { cleanupStoppedContainers() }
        }

        // an UNSTABLE build (failed branch sync) still deployed, so still clean up
        unstable {
            script { cleanupStoppedContainers() }
        }

        failure {
            echo 'Deployment failed.'
            emailext(
                subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """
                    <html>
                        <head>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    color: #333333;
                                    line-height: 1.6;
                                }
                                h2 {
                                    color: #e74c3c;
                                }
                                .details {
                                    margin-top: 20px;
                                }
                                .label {
                                    font-weight: bold;
                                }
                                .link {
                                    color: #3498db;
                                    text-decoration: none;
                                }
                                .footer {
                                    margin-top: 30px;
                                    font-size: 0.9em;
                                    color: #7f8c8d;
                                }
                            </style>
                        </head>
                        <body>
                            <h2>Build Failed</h2>
                            <p>The Jenkins job has failed. Please review the details below:</p>
                            <div class="details">
                                <p><span class="label">Job:</span> ${env.JOB_NAME}</p>
                                <p><span class="label">Build Number:</span> ${env.BUILD_NUMBER}</p>
                                <p><span class="label">Console Output:</span> <a href="${env.BUILD_URL}console" class="link">View the console output</a></p>
                            </div>
                        </body>
                    </html>
                """,
                from: 'selamnew@ienetworksolutions.com',
                recipientProviders: [[$class: 'DevelopersRecipientProvider']],
                to: 'yordanos.z@ienetworks.co, surafel@ienetworks.co, abeselom.g@ienetworksolutions.com, yohannes.t@ienetworks.co'
            )
        }
    }
}

// shared by the success and unstable post blocks
def cleanupStoppedContainers() {
    if (!env.SECRET_KEY || !env.REMOTE_SERVER || !env.SERVICE_NAME) {
        echo 'Environment not resolved — skipping container cleanup.'
        return
    }

    sshagent(credentials: [env.SECRET_KEY]) {
        sh """#!/bin/bash
            set -e
            ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                if docker service inspect ${env.SERVICE_NAME} >/dev/null 2>&1; then
                    echo "Cleaning up stopped containers for service ${env.SERVICE_NAME}..."
                    docker ps -a \\
                        --filter "label=com.docker.swarm.service.name=${env.SERVICE_NAME}" \\
                        --filter "status=exited" -q | xargs -r docker rm -f
                fi
            '
        """
    }
}
