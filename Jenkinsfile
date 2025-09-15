pipeline {
    agent any
    
    environment {
        // Define environment variables
        APP_NAME = 'jenkins-practice-webapp'
        BUILD_DIR = 'dist'
        DEPLOY_DIR = '/var/www/html/jenkins-practice'
        NGINX_CONFIG = '/etc/nginx/sites-available/jenkins-practice'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
                echo "✅ Successfully checked out branch: ${env.BRANCH_NAME}"
            }
        }
        
        stage('Validate Files') {
            steps {
                echo '🔍 Validating project structure...'
                script {
                    // Check if required files exist
                    if (!fileExists('index.html')) {
                        error('❌ index.html not found!')
                    }
                    if (!fileExists('styles.css')) {
                        error('❌ styles.css not found!')
                    }
                    if (!fileExists('script.js')) {
                        error('❌ script.js not found!')
                    }
                    
                    echo '✅ All required files found:'
                    sh 'ls -la *.html *.css *.js'
                }
            }
        }
        
        stage('Code Quality Checks') {
            parallel {
                stage('HTML Validation') {
                    steps {
                        echo '🔍 Validating HTML...'
                        script {
                            // Check for basic HTML structure
                            def htmlContent = readFile('index.html')
                            if (!htmlContent.contains('<!DOCTYPE html>')) {
                                echo '⚠️ Warning: Missing DOCTYPE declaration'
                            }
                            if (!htmlContent.contains('<title>')) {
                                echo '⚠️ Warning: Missing title tag'
                            }
                            echo '✅ HTML validation completed'
                        }
                    }
                }
                
                stage('CSS Validation') {
                    steps {
                        echo '🎨 Validating CSS...'
                        script {
                            def cssContent = readFile('styles.css')
                            def cssLines = cssContent.split('\n').size()
                            echo "📊 CSS file contains ${cssLines} lines"
                            
                            // Check for responsive design
                            if (cssContent.contains('@media')) {
                                echo '✅ Responsive design detected'
                            } else {
                                echo '⚠️ No responsive design rules found'
                            }
                            echo '✅ CSS validation completed'
                        }
                    }
                }
                
                stage('JavaScript Validation') {
                    steps {
                        echo '⚡ Validating JavaScript...'
                        script {
                            def jsContent = readFile('script.js')
                            def jsLines = jsContent.split('\n').size()
                            echo "📊 JavaScript file contains ${jsLines} lines"
                            
                            // Check for common patterns
                            if (jsContent.contains('addEventListener')) {
                                echo '✅ Event listeners detected'
                            }
                            if (jsContent.contains('function')) {
                                echo '✅ Functions detected'
                            }
                            echo '✅ JavaScript validation completed'
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                echo '🔨 Building the web application...'
                script {
                    // Create build directory
                    sh "mkdir -p ${BUILD_DIR}"
                    
                    // Copy files to build directory
                    sh "cp index.html ${BUILD_DIR}/"
                    sh "cp styles.css ${BUILD_DIR}/"
                    sh "cp script.js ${BUILD_DIR}/"
                    
                    // Add build timestamp to HTML
                    def timestamp = new Date().format('yyyy-MM-dd HH:mm:ss')
                    def buildInfo = "<!-- Built on ${timestamp} by Jenkins Build #${env.BUILD_NUMBER} -->"
                    sh "echo '${buildInfo}' >> ${BUILD_DIR}/index.html"
                    
                    echo '✅ Build completed successfully'
                }
                
                // List build artifacts
                echo '📦 Build artifacts:'
                sh "ls -la ${BUILD_DIR}/"
            }
        }
        
        stage('Test') {
            steps {
                echo '🧪 Running tests...'
                script {
                    // Test file sizes (ensure they're not empty)
                    sh """
                        echo '📏 Checking file sizes:'
                        wc -c ${BUILD_DIR}/*.html ${BUILD_DIR}/*.css ${BUILD_DIR}/*.js
                    """
                    
                    // Test HTML syntax (basic check)
                    sh """
                        echo '🔍 Testing HTML structure:'
                        if grep -q '<html' ${BUILD_DIR}/index.html && grep -q '</html>' ${BUILD_DIR}/index.html; then
                            echo '✅ HTML structure is valid'
                        else
                            echo '❌ HTML structure issues found'
                            exit 1
                        fi
                    """
                    
                    // Test CSS syntax (basic check)
                    sh """
                        echo '🎨 Testing CSS syntax:'
                        if grep -q '{' ${BUILD_DIR}/styles.css && grep -q '}' ${BUILD_DIR}/styles.css; then
                            echo '✅ CSS syntax appears valid'
                        else
                            echo '❌ CSS syntax issues found'
                            exit 1
                        fi
                    """
                    
                    // Test JavaScript syntax (basic check)
                    sh """
                        echo '⚡ Testing JavaScript syntax:'
                        node -c ${BUILD_DIR}/script.js && echo '✅ JavaScript syntax is valid' || echo '❌ JavaScript syntax errors found'
                    """
                    
                    echo '✅ All tests passed!'
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo '🛡️ Running security checks...'
                script {
                    // Check for potential security issues
                    def htmlContent = readFile("${BUILD_DIR}/index.html")
                    def jsContent = readFile("${BUILD_DIR}/script.js")
                    
                    // Check for inline scripts (security concern)
                    if (htmlContent.contains('<script>')) {
                        echo '⚠️ Warning: Inline scripts detected'
                    } else {
                        echo '✅ No inline scripts found'
                    }
                    
                    // Check for eval() usage
                    if (jsContent.contains('eval(')) {
                        echo '⚠️ Warning: eval() usage detected'
                    } else {
                        echo '✅ No eval() usage found'
                    }
                    
                    // Check for localStorage usage (our app uses it)
                    if (jsContent.contains('localStorage')) {
                        echo '⚠️ Info: localStorage usage detected'
                    }
                    
                    echo '✅ Security scan completed'
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                echo '🚀 Deploying to staging environment...'
                script {
                    // Create staging directory
                    sh "mkdir -p /tmp/jenkins-practice-staging"
                    
                    // Copy build files to staging
                    sh "cp -r ${BUILD_DIR}/* /tmp/jenkins-practice-staging/"
                    
                    // Create deployment manifest
                    def manifest = """
Deployment Information:
- Application: ${APP_NAME}
- Branch: ${env.BRANCH_NAME}
- Build Number: ${env.BUILD_NUMBER}
- Build Date: ${new Date()}
- Deployed By: Jenkins
"""
                    writeFile file: '/tmp/jenkins-practice-staging/DEPLOYMENT.txt', text: manifest
                    
                    echo '✅ Deployed to staging: /tmp/jenkins-practice-staging'
                    sh 'ls -la /tmp/jenkins-practice-staging/'
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                allOf {
                    branch 'main'
                    environment name: 'DEPLOY_TO_PROD', value: 'true'
                }
            }
            input {
                message "Deploy to Production?"
                ok "Deploy"
                submitterParameter "DEPLOYER"
            }
            steps {
                echo '🌟 Deploying to production environment...'
                script {
                    echo "Deployment approved by: ${DEPLOYER}"
                    
                    // Backup existing deployment (if exists)
                    sh """
                        if [ -d "${DEPLOY_DIR}" ]; then
                            echo '📦 Backing up existing deployment...'
                            mv ${DEPLOY_DIR} ${DEPLOY_DIR}.backup.${env.BUILD_NUMBER}
                        fi
                    """
                    
                    // Deploy to production
                    sh "mkdir -p ${DEPLOY_DIR}"
                    sh "cp -r ${BUILD_DIR}/* ${DEPLOY_DIR}/"
                    
                    // Set proper permissions
                    sh "chmod -R 755 ${DEPLOY_DIR}"
                    
                    echo '✅ Successfully deployed to production!'
                    echo "🌐 Application available at: http://your-domain/jenkins-practice"
                }
            }
        }
        
        stage('Health Check') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo '🏥 Running health checks...'
                script {
                    // Check if files are accessible
                    sh """
                        echo '🔍 Verifying deployment files:'
                        ls -la /tmp/jenkins-practice-staging/
                        
                        echo '📊 File sizes:'
                        du -h /tmp/jenkins-practice-staging/*
                        
                        echo '✅ Health check completed'
                    """
                }
            }
        }
        
        stage('Notify Team') {
            steps {
                echo '📧 Sending notifications...'
                script {
                    def status = currentBuild.result ?: 'SUCCESS'
                    def color = status == 'SUCCESS' ? 'good' : 'danger'
                    def message = """
🚀 Jenkins Practice Web App Deployment
- Status: ${status}
- Branch: ${env.BRANCH_NAME}
- Build: #${env.BUILD_NUMBER}
- Commit: ${env.GIT_COMMIT?.take(7)}
"""
                    
                    echo message
                    // In real scenario, you'd send this via email/Slack/Teams
                    echo '✅ Notification sent (simulated)'
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up workspace...'
            // Archive build artifacts
            archiveArtifacts artifacts: "${BUILD_DIR}/**/*", fingerprint: true
            
            // Clean workspace
            cleanWs()
            
            echo '📊 Pipeline execution summary:'
            echo "- Duration: ${currentBuild.durationString}"
            echo "- Result: ${currentBuild.result ?: 'SUCCESS'}"
        }
        
        success {
            echo '🎉 Pipeline executed successfully!'
            echo "✅ Jenkins Practice Web App build #${env.BUILD_NUMBER} completed"
        }
        
        failure {
            echo '💥 Pipeline failed!'
            echo "❌ Check the logs above for details"
        }
        
        unstable {
            echo '⚠️ Pipeline completed but is unstable'
        }
        
        aborted {
            echo '🛑 Pipeline was aborted'
        }
    }
}
