pipeline {
    agent any

    environment {
        REMOTE_SERVER = 'ubuntu@139.185.53.18'
        REPO_URL = 'https://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@github.com/IE-Network-Solutions/organizational-structure-and-employee-information-frontend.git'
        BRANCH_NAME = 'develop'
        REPO_DIR = 'osei-front'
        SSH_CREDENTIALS_ID = 'peptest'

        ORG_AND_EMP_URL="https://staging-org-emp.selamnew.com/api/v1"
        NEXT_PUBLIC_OKR_AND_PLANNING_URL="https://staging-okr.selamnew.com/api/v1"
        OKR_URL="https://staging-okr.selamnew.com/api/v1"
        TENANT_MGMT_URL="https://staging-tenant.selamnew.com/api/v1"
        ORG_DEV_URL = "https://staging-org-dev.selamnew.com/api/v1"
        RECRUITMENT_URL="https://staging-recruitment.selamnew.com/api/v1"
        PUBLIC_DOMAIN="https://selamnew.com"
        NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL="https://staging-time.selamnew.com/api/v1"
        NEXT_PUBLIC_TRAIN_AND_LEARNING_URL="https://staging-training.selamnew.com/api/v1"
        NEXT_PUBLIC_API_KEY="AIzaSyDDOSSGJy2izlW9CzhzhjHUTEVur0J16zs"
        NEXT_PUBLIC_AUTH_DOMIAN="pep-authentication.firebaseapp.com"
        NEXT_PUBLIC_PROJECT_ID="pep-authentication"
        NEXT_PUBLIC_STORAGE_BUCKET="pep-authentication.appspot.com"
        NEXT_PUBLIC_MESSAGE_SENDER_ID="871958776875"
        NEXT_PUBLIC_APP_ID="1:871958776875:web:426ec9b0b49fc35df1ae6e"
    }

    stages {
        stage('Clone Repository') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                    echo one
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'sudo rm -r $REPO_DIR'
                        echo two
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'git clone $REPO_URL -b $BRANCH_NAME $REPO_DIR'
                        echo three
                    """
                }
            }
        }
        stage('Create .env File') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cat > ~/$REPO_DIR/.env <<EOF
                        ORG_AND_EMP_URL=${ORG_AND_EMP_URL}
                        TENANT_MGMT_URL=${TENANT_MGMT_URL}
                        ORG_DEV_URL=${ORG_DEV_URL}
                        NEXT_PUBLIC_TRAIN_AND_LEARNING_URL=${NEXT_PUBLIC_TRAIN_AND_LEARNING_URL}
                        NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL=${NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL}
                        NEXT_PUBLIC_OKR_AND_PLANNING_URL=${OKR_URL}
                        OKR_URL=${OKR_URL}
                        RECRUITMENT_URL=${RECRUITMENT_URL}
                        PUBLIC_DOMAIN=${PUBLIC_DOMAIN}
                        NEXT_PUBLIC_API_KEY=${NEXT_PUBLIC_API_KEY}
                        NEXT_PUBLIC_AUTH_DOMIAN=${NEXT_PUBLIC_AUTH_DOMIAN}
                        NEXT_PUBLIC_PROJECT_ID=${NEXT_PUBLIC_PROJECT_ID}
                        NEXT_PUBLIC_STORAGE_BUCKET=${NEXT_PUBLIC_STORAGE_BUCKET}
                        NEXT_PUBLIC_MESSAGE_SENDER_ID=${NEXT_PUBLIC_MESSAGE_SENDER_ID}
                        NEXT_PUBLIC_APP_ID=${NEXT_PUBLIC_APP_ID}
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
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && pm2 delete test-osei-front-app || true'
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && npm run build && PORT=3001 pm2 start npm --name "test-osei-front-app" -- start'
                    """
                }
            }
        }
    }
    post {
        success {
            echo 'Next.js application deployed successfully!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}
