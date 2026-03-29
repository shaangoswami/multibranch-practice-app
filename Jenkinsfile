pipeline {
    agent any

    environment{
        DOCKER_IMAGE = "shaangoswami/jenkins-kubectl:v2"
        
        // The ID of the K8s credentials you saved in Jenkins
        K8S_CREDS_ID = "host-ssh"
    }
        
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
                echo "✅ Successfully checked out branch: ${env.BRANCH_NAME}"
            }
        }

        
        stage('Deploy to Kubernetes') {
            steps {
                //connect to the cluster
                withKubeConfig([credentialsId: K8S_CREDS_ID]) {
                    sh """                     
                        # A. Apply the changes
                        kubectl apply -f deployment.yaml
                        kubectl apply -f service.yaml
                    """
                }
            }
        }
    }
}
