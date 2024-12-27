pipeline {
    agent any

    environment {
        REMOTE_SERVER = 'ubuntu@139.185.51.164'
        REPO_URL = 'https://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@github.com/IE-Network-Solutions/organizational-structure-and-employee-information-frontend.git'
        BRANCH_NAME = 'production'
        REPO_DIR = 'osei-front'
        SSH_CREDENTIALS_ID = 'pepproduction'


        ORG_AND_EMP_URL="https://org-emp-backend.selamnew.com/api/v1"
        NEXT_PUBLIC_OKR_AND_PLANNING_URL="https://okr-backend.selamnew.com/api/v1"
        OKR_URL="https://okr-backend.selamnew.com/api/v1"
        TENANT_MGMT_URL="https://tenant-backend.selamnew.com/api/v1"
        ORG_DEV_URL = "https://od-backend.selamnew.com/api/v1"
        RECRUITMENT_URL="https://recruitment-backend.selamnew.com/api/v1"
        NEXT_PUBLIC_APPROVERS_URL="https://approval-backend.selamnew.com/api/v1"
        NOTIFICATION_URL = "https://email-service.selamnew.com"
        PUBLIC_DOMAIN="https://selamnew.com"
        NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL="https://time-attendance-backend.selamnew.com/api/v1"
        NEXT_PUBLIC_TRAIN_AND_LEARNING_URL="https://training-backend.selamnew.com/api/v1"
        NEXT_PUBLIC_API_KEY="AIzaSyC2H3_6GRQe48d2xZ0JJ2tjs1vX0eGboSw"
        NEXT_PUBLIC_AUTH_DOMIAN="selamnew-workspace.firebaseapp.com"
        NEXT_PUBLIC_PROJECT_ID="selamnew-workspace"
        NEXT_PUBLIC_STORAGE_BUCKET="selamnew-workspace.appspot.com"
        NEXT_PUBLIC_MESSAGE_SENDER_ID="649403733776"
        NEXT_PUBLIC_APP_ID="1:649403733776:web:1adb71a0c8f60dafdcb795"
    }

    stages {
        stage('Prepare Repository') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER '
                        if [ -d "$REPO_DIR" ]; then
                            sudo chown -R \$USER:\$USER $REPO_DIR
                            sudo chmod -R 755 $REPO_DIR
                        fi'
                    """
                }
            }
        }
        stage('Pull Latest Changes') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER '
                        if [ -d "$REPO_DIR" ]; then
                            cd $REPO_DIR && git reset --hard HEAD && git pull origin $BRANCH_NAME
                        else
                            git clone $REPO_URL -b $BRANCH_NAME $REPO_DIR
                        fi'
                    """
                }
            }
        }
        stage('Create .env File') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cat > ~/$REPO_DIR/.env <<EOF

                        NODE_ENV=production

                        ORG_AND_EMP_URL=${ORG_AND_EMP_URL}
                        TENANT_MGMT_URL=${TENANT_MGMT_URL}
                        ORG_DEV_URL=${ORG_DEV_URL}
                        NEXT_PUBLIC_TRAIN_AND_LEARNING_URL=${NEXT_PUBLIC_TRAIN_AND_LEARNING_URL}
                        NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL=${NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL}
                        NEXT_PUBLIC_OKR_AND_PLANNING_URL=${OKR_URL}
                        OKR_URL=${OKR_URL}
                        NOTIFICATION_URL=${NOTIFICATION_URL}
                        RECRUITMENT_URL=${RECRUITMENT_URL}
                        PUBLIC_DOMAIN=${PUBLIC_DOMAIN}
                        NEXT_PUBLIC_API_KEY=${NEXT_PUBLIC_API_KEY}
                        NEXT_PUBLIC_AUTH_DOMIAN=${NEXT_PUBLIC_AUTH_DOMIAN}
                        NEXT_PUBLIC_PROJECT_ID=${NEXT_PUBLIC_PROJECT_ID}
                        NEXT_PUBLIC_STORAGE_BUCKET=${NEXT_PUBLIC_STORAGE_BUCKET}
                        NEXT_PUBLIC_MESSAGE_SENDER_ID=${NEXT_PUBLIC_MESSAGE_SENDER_ID}
                        NEXT_PUBLIC_APP_ID=${NEXT_PUBLIC_APP_ID}
                        NEXT_PUBLIC_APPROVERS_URL=${NEXT_PUBLIC_APPROVERS_URL}
                        EOF'
                    """
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && npm install'
                    """
                }
            }
        }
        stage('Run Next.js App') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && npm run format'
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && sudo pm2 delete selamnew-app || true'
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && npm run build && PORT=3001 sudo pm2 start npm --name "selamnew-app" -- start'
                    """
                }
            }
        }
    }
        post {

        success {
            echo 'Nest js application deployed successfully!'
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
                to: 'yonas.t@ienetworksolutions.com, surafel@ienetworks.co, abeselom.g@ienetworksolutions.com'
            )
        }
    }
}
