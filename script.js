// Global variables
let currentQuiz = 0;
let score = 0;
let buildRunning = false;
let buildInterval;
let pipelineStages = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let darkModeEnabled = localStorage.getItem('darkMode') === 'true';

// Quiz questions data
const quizQuestions = [
    {
        question: "What does CI/CD stand for?",
        options: [
            "Continuous Integration / Continuous Deployment",
            "Code Integration / Code Deployment",
            "Continuous Inspection / Continuous Development",
            "Central Integration / Central Deployment"
        ],
        correct: 0
    },
    {
        question: "What file defines a Jenkins pipeline as code?",
        options: ["pipeline.yml", "Jenkinsfile", "build.xml", "ci.json"],
        correct: 1
    },
    {
        question: "Which Jenkins pipeline syntax is more structured and easier to read?",
        options: ["Scripted Pipeline", "Declarative Pipeline", "Groovy Pipeline", "XML Pipeline"],
        correct: 1
    },
    {
        question: "What is a Jenkins workspace?",
        options: [
            "The Jenkins web interface",
            "A directory where builds are executed",
            "A group of Jenkins users",
            "The Jenkins configuration file"
        ],
        correct: 1
    },
    {
        question: "What triggers a Jenkins build automatically?",
        options: [
            "Manual clicking only",
            "SCM changes, scheduled time, or upstream jobs",
            "Server restart",
            "User login"
        ],
        correct: 1
    }
];

// Tab switching functionality
function showTab(tabName) {
    // Hide all tabs with smooth transition
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        if (tab.classList.contains('active')) {
            tab.classList.remove('active');
        }
    });

    // Remove active class from all buttons with smooth transition
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        setTimeout(() => {
            selectedTab.classList.add('active');
        }, 10);
    }
    
    event.target.classList.add('active');

    // Load quiz if quiz tab is selected
    if (tabName === 'quiz') {
        loadQuiz();
    }
}

// Quiz functionality
function loadQuiz() {
    const container = document.getElementById('quizContainer');
    const question = quizQuestions[currentQuiz];
    
    container.innerHTML = `
        <div class="question">Question ${currentQuiz + 1} of ${quizQuestions.length}: ${question.question}</div>
        <div class="options">
            ${question.options.map((option, index) => 
                `<div class="option" onclick="selectOption(${index})">${option}</div>`
            ).join('')}
        </div>
        <button class="btn" onclick="submitAnswer()">Submit Answer</button>
        <div id="quizResult"></div>
        <div style="margin-top: 20px;">
            <strong>Score: ${score} / ${currentQuiz}</strong>
        </div>
    `;
}

function selectOption(index) {
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    options[index].classList.add('selected');
    window.selectedOption = index;
    
    // Add haptic feedback simulation with scale animation
    options[index].style.transform = 'scale(1.05)';
    setTimeout(() => {
        options[index].style.transform = 'scale(1.02)';
    }, 100);
}

function submitAnswer() {
    if (window.selectedOption === undefined) {
        alert('Please select an answer!');
        return;
    }

    const result = document.getElementById('quizResult');
    const correct = quizQuestions[currentQuiz].correct;
    
    if (window.selectedOption === correct) {
        score++;
        result.innerHTML = '<div class="result correct">✅ Correct! Great job!</div>';
    } else {
        result.innerHTML = `<div class="result incorrect">❌ Incorrect. The correct answer is: ${quizQuestions[currentQuiz].options[correct]}</div>`;
    }

    // Smooth transition to next question
    setTimeout(() => {
        currentQuiz++;
        if (currentQuiz < quizQuestions.length) {
            window.selectedOption = undefined;
            loadQuiz();
        } else {
            showQuizComplete();
        }
    }, 2500);
}

function showQuizComplete() {
    const container = document.getElementById('quizContainer');
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    container.innerHTML = `
        <div style="text-align: center;">
            <h2>🎉 Quiz Complete!</h2>
            <div style="font-size: 24px; margin: 20px 0;">
                Final Score: ${score} / ${quizQuestions.length} (${percentage}%)
            </div>
            <div style="font-size: 18px; color: #666;">
                ${percentage >= 80 ? "Excellent! You're ready for Jenkins!" : 
                  percentage >= 60 ? "Good job! Review the concepts and try again." : 
                  "Keep studying! Practice makes perfect."}
            </div>
            <button class="btn" onclick="restartQuiz()">🔄 Restart Quiz</button>
        </div>
    `;
}

function restartQuiz() {
    currentQuiz = 0;
    score = 0;
    loadQuiz();
}

// Pipeline Builder Functions
function setupDragAndDrop() {
    const stageItems = document.querySelectorAll('.stage-item');
    const canvas = document.getElementById('pipelineCanvas');

    stageItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.stage);
        });
    });

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        canvas.style.borderColor = '#667eea';
        canvas.style.backgroundColor = '#f8f9ff';
    });

    canvas.addEventListener('dragleave', (e) => {
        canvas.style.borderColor = '#ddd';
        canvas.style.backgroundColor = 'white';
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        canvas.style.borderColor = '#ddd';
        canvas.style.backgroundColor = 'white';
        const stageType = e.dataTransfer.getData('text/plain');
        addStageToCanvas(stageType);
    });
}

function addStageToCanvas(stageType) {
    const canvas = document.getElementById('pipelineCanvas');
    const stageNames = {
        'checkout': '📥 Checkout SCM',
        'build': '🔨 Build',
        'test': '🧪 Test',
        'quality': '🔍 Quality Gate',
        'security': '🛡️ Security Scan',
        'deploy-staging': '🚀 Deploy to Staging',
        'deploy-prod': '🌟 Deploy to Production',
        'notify': '📧 Notify Team'
    };

    if (pipelineStages.length === 0) {
        canvas.innerHTML = '';
    }

    const stageDiv = document.createElement('div');
    stageDiv.className = 'pipeline-stage';
    stageDiv.style.opacity = '0';
    stageDiv.innerHTML = `
        ${stageNames[stageType]}
        <button onclick="removeStage(this)" style="background: rgba(255,255,255,0.3); border: none; color: white; margin-left: 10px; border-radius: 3px; cursor: pointer; padding: 2px 6px; transition: all 0.3s ease;">×</button>
    `;
    
    canvas.appendChild(stageDiv);
    pipelineStages.push(stageType);
    
    // Animate in
    setTimeout(() => {
        stageDiv.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        stageDiv.style.opacity = '1';
        stageDiv.style.transform = 'scale(1)';
    }, 10);
}

function removeStage(button) {
    const stage = button.parentNode;
    const index = Array.from(stage.parentNode.children).indexOf(stage);
    pipelineStages.splice(index, 1);
    
    // Smooth removal animation
    stage.style.transition = 'all 0.4s ease';
    stage.style.opacity = '0';
    stage.style.transform = 'scale(0.8) translateX(-20px)';
    
    setTimeout(() => {
        stage.remove();
        if (pipelineStages.length === 0) {
            document.getElementById('pipelineCanvas').innerHTML = 
                '<p style="text-align: center; color: #999; margin-top: 150px;">Drop pipeline stages here to build your workflow</p>';
        }
    }, 400);
}

function clearPipeline() {
    pipelineStages = [];
    document.getElementById('pipelineCanvas').innerHTML = 
        '<p style="text-align: center; color: #999; margin-top: 150px;">Drop pipeline stages here to build your workflow</p>';
    document.getElementById('jenkinsfileOutput').innerHTML = '';
}

function generateJenkinsfile() {
    if (pipelineStages.length === 0) {
        alert('Please add some stages to your pipeline first!');
        return;
    }

    const stageCode = {
        'checkout': 'checkout scm',
        'build': 'sh "npm install && npm run build"',
        'test': 'sh "npm test"',
        'quality': 'sh "sonar-scanner"',
        'security': 'sh "npm audit"',
        'deploy-staging': 'sh "kubectl apply -f k8s/staging/"',
        'deploy-prod': 'sh "kubectl apply -f k8s/production/"',
        'notify': 'emailext body: "Build completed", to: "team@company.com"'
    };

    const stageNames = {
        'checkout': 'Checkout',
        'build': 'Build',
        'test': 'Test',
        'quality': 'Quality Gate',
        'security': 'Security Scan',
        'deploy-staging': 'Deploy to Staging',
        'deploy-prod': 'Deploy to Production',
        'notify': 'Notify'
    };

    const jenkinsfile = `pipeline {
    agent any
    
    stages {
${pipelineStages.map(stage => `        stage('${stageNames[stage]}') {
            steps {
                ${stageCode[stage]}
            }
        }`).join('\n')}
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}`;

    const output = document.getElementById('jenkinsfileOutput');
    output.style.opacity = '0';
    
    setTimeout(() => {
        output.innerHTML = 
            `<h3>Generated Jenkinsfile:</h3><pre>${jenkinsfile}</pre>`;
        output.style.transition = 'opacity 0.4s ease';
        output.style.opacity = '1';
        
        // Update progress
        const pipelinesGenerated = (parseInt(localStorage.getItem('pipelinesGenerated')) || 0) + 1;
        localStorage.setItem('pipelinesGenerated', pipelinesGenerated);
        updateProgressBars();
    }, 200);
}

// Build Simulator Functions
function startBuild() {
    if (buildRunning) return;
    
    buildRunning = true;
    const log = document.getElementById('buildLog');
    log.innerHTML = '';
    log.style.opacity = '0.5';
    
    // Smooth fade in
    setTimeout(() => {
        log.style.transition = 'opacity 0.3s ease';
        log.style.opacity = '1';
    }, 10);
    
    const buildSteps = [
        { message: '[INFO] Starting Jenkins build #42', delay: 100 },
        { message: '[INFO] Workspace: /var/jenkins_home/workspace/demo-pipeline', delay: 500 },
        { message: '[INFO] Agent: Running on Jenkins built-in node', delay: 300 },
        { message: '', delay: 200 },
        { message: '[PIPELINE] Start of Pipeline', delay: 400 },
        { message: '[CHECKOUT] Checking out from Git repository...', delay: 1000 },
        { message: '[CHECKOUT] > git rev-parse --verify HEAD', delay: 800 },
        { message: '[CHECKOUT] Commit: 7f8a9bc - "Add new feature"', delay: 600 },
        { message: '[CHECKOUT] ✅ Successfully checked out branch: main', delay: 400 },
        { message: '', delay: 200 },
        { message: '[BUILD] Installing dependencies...', delay: 1200 },
        { message: '[BUILD] > npm install', delay: 800 },
        { message: '[BUILD] npm WARN deprecated package@1.0.0', delay: 600 },
        { message: '[BUILD] added 1337 packages in 45.2s', delay: 1500 },
        { message: '[BUILD] Compiling application...', delay: 800 },
        { message: '[BUILD] > npm run build', delay: 1200 },
        { message: '[BUILD] webpack compiled successfully', delay: 1000 },
        { message: '[BUILD] ✅ Build completed successfully', delay: 400 },
        { message: '', delay: 200 },
        { message: '[TEST] Running unit tests...', delay: 800 },
        { message: '[TEST] > npm test', delay: 1000 },
        { message: '[TEST] PASS src/components/App.test.js', delay: 800 },
        { message: '[TEST] PASS src/utils/helpers.test.js', delay: 600 },
        { message: '[TEST] Test Suites: 2 passed, 2 total', delay: 400 },
        { message: '[TEST] Tests: 15 passed, 15 total', delay: 400 },
        { message: '[TEST] ✅ All tests passed', delay: 400 },
        { message: '', delay: 200 },
        { message: '[DEPLOY] Deploying to staging environment...', delay: 1000 },
        { message: '[DEPLOY] > kubectl apply -f k8s/staging/', delay: 1500 },
        { message: '[DEPLOY] deployment.apps/demo-app configured', delay: 800 },
        { message: '[DEPLOY] service/demo-service configured', delay: 600 },
        { message: '[DEPLOY] ✅ Deployment successful', delay: 400 },
        { message: '', delay: 200 },
        { message: '[POST] Cleaning workspace...', delay: 500 },
        { message: '[POST] Publishing test results...', delay: 600 },
        { message: '[POST] Archiving artifacts...', delay: 400 },
        { message: '', delay: 200 },
        { message: '[SUCCESS] 🎉 Build completed successfully!', delay: 300 },
        { message: '[INFO] Finished: SUCCESS', delay: 200 }
    ];

    let stepIndex = 0;
    
    function addLogStep() {
        if (!buildRunning || stepIndex >= buildSteps.length) {
            buildRunning = false;
            return;
        }
        
        const step = buildSteps[stepIndex];
        log.innerHTML += step.message + '\n';
        log.scrollTop = log.scrollHeight;
        stepIndex++;
        
        buildInterval = setTimeout(addLogStep, step.delay);
    }
    
    addLogStep();
}

function stopBuild() {
    buildRunning = false;
    clearTimeout(buildInterval);
    const log = document.getElementById('buildLog');
    log.innerHTML += '\n[ABORTED] ⚠️ Build was stopped by user\n[INFO] Finished: ABORTED\n';
    log.scrollTop = log.scrollHeight;
}

function clearLog() {
    document.getElementById('buildLog').innerHTML = 
        'Welcome to Jenkins Build Simulator!\nClick "Start Build" to begin a simulated CI/CD pipeline execution.\n';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop();
    loadQuiz();
    initializeApp();
    
    // Add some interactive feedback
    console.log('🚀 Jenkins Practice App loaded successfully!');
    console.log('💡 Tip: Try building a complete CI/CD pipeline in the Pipeline Builder tab');
});

// Initialize app settings
function initializeApp() {
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }
    updateProgressBars();
}

// Toggle Settings Panel
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('active');
}

// Toggle Dark Mode
function toggleDarkMode() {
    darkModeEnabled = !darkModeEnabled;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkModeEnabled);
}

// Clear all progress
function clearAllProgress() {
    if (confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
        localStorage.clear();
        favorites = [];
        location.reload();
    }
}

// Toggle Favorites
function toggleFavorite(button, conceptId) {
    const index = favorites.indexOf(conceptId);
    if (index > -1) {
        favorites.splice(index, 1);
        button.classList.remove('favorited');
        button.textContent = '☆ Add to Favorites';
    } else {
        favorites.push(conceptId);
        button.classList.add('favorited');
        button.textContent = '★ Added to Favorites';
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesList();
}

// Update Favorites List
function updateFavoritesList() {
    const favoritesList = document.getElementById('favoritesList');
    const conceptCards = document.querySelectorAll('.concept-card');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="text-align: center; color: #999;">No favorites yet. Click the ☆ icon on any concept to add it here!</p>';
        return;
    }
    
    let html = '<div>';
    conceptCards.forEach((card, index) => {
        const conceptId = `concept-${index}`;
        if (favorites.includes(conceptId)) {
            html += `<div class="concept-card">${card.innerHTML}</div>`;
        }
    });
    html += '</div>';
    favoritesList.innerHTML = html;
}

// Filter Concepts by Search
function filterConcepts() {
    const searchTerm = document.getElementById('conceptSearch').value.toLowerCase();
    const cards = document.querySelectorAll('#concepts .concept-card');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
        if (text.includes(searchTerm)) {
            card.style.animation = 'fadeInLeft 0.4s ease';
        }
    });
}

// Load Pipeline Preset
function loadPreset(presetType) {
    clearPipeline();
    
    const presets = {
        'nodejs': ['checkout', 'build', 'test'],
        'python': ['checkout', 'build', 'test', 'quality'],
        'docker': ['checkout', 'build', 'security', 'deploy-staging', 'deploy-prod'],
        'kubernetes': ['checkout', 'build', 'test', 'deploy-staging', 'deploy-prod', 'notify'],
        'fullstack': ['checkout', 'build', 'test', 'security', 'deploy-staging', 'deploy-prod'],
        'microservices': ['checkout', 'build', 'test', 'deploy-staging', 'deploy-prod', 'notify']
    };
    
    const stages = presets[presetType] || [];
    stages.forEach((stage, index) => {
        setTimeout(() => {
            addStageToCanvas(stage);
        }, index * 150);
    });
}

// Copy Jenkinsfile to Clipboard
function copyToClipboard() {
    const pre = document.querySelector('#jenkinsfileOutput pre');
    if (!pre) {
        alert('Please generate a Jenkinsfile first!');
        return;
    }
    
    const text = pre.textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Jenkinsfile copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy. Please try again.');
    });
}

// Update Progress Bars
function updateProgressBars() {
    // Concept progress (based on scroll through concepts)
    const conceptProgress = Math.min(100, (localStorage.getItem('conceptsViewed') || 0) * 10);
    document.getElementById('conceptProgress').style.width = conceptProgress + '%';
    
    // Quiz progress (based on final score)
    const quizProgress = Math.min(100, score * 20);
    document.getElementById('quizProgress').style.width = quizProgress + '%';
    
    // Pipeline progress (based on generated pipelines)
    const pipelineProgress = Math.min(100, (localStorage.getItem('pipelinesGenerated') || 0) * 25);
    document.getElementById('pipelineProgress').style.width = pipelineProgress + '%';
}