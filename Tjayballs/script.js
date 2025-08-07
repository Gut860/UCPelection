// UCP Election System - JavaScript
let currentUser = null;
let isLoggedIn = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showSection('dashboard');
    
    // Event listener for login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Add modal event listeners for proper cleanup
    const loginModal = document.getElementById('loginModal');
    loginModal.addEventListener('hidden.bs.modal', function() {
        // Ensure complete cleanup when modal is hidden
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Reset the form
        document.getElementById('loginForm').reset();
    });
    
    // Show login modal on page load
    setTimeout(() => {
        showLogin();
    }, 1000);
});

// Show login modal
function showLogin() {
    // Remove any existing modal backdrops first
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Reset the form
    document.getElementById('loginForm').reset();
    
    // Get or create modal instance
    const modalElement = document.getElementById('loginModal');
    let modal = bootstrap.Modal.getInstance(modalElement);
    
    if (!modal) {
        modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
        });
    }
    
    modal.show();
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    
    // Simple validation (replace with real authentication)
    if (username && password && userType) {
        currentUser = {
            username: username,
            type: userType
        };
        isLoggedIn = true;
        
        // Update user info
        document.getElementById('currentUser').textContent = `${username.toUpperCase()}, ${userType.toUpperCase()}`;
        document.getElementById('adminName').textContent = username;
        
        // Properly close the modal and remove backdrop
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (modal) {
            modal.hide();
        }
        
        // Remove any lingering modal backdrops and restore body
        setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 300);
        
        // Configure interface based on user role
        setupUserInterface(userType);
        
        // Show appropriate dashboard based on user type
        setTimeout(() => {
            if (userType === 'admin') {
                showSection('dashboard');
                alert(`Welcome ${username}! You have admin access to the election management system.`);
            } else {
                showSection('vote');
                alert(`Welcome ${username}! You can now cast your vote in the student election.`);
            }
        }, 400);
    } else {
        alert('Please fill in all fields.');
    }
}

// Setup user interface based on role
function setupUserInterface(userType) {
    const sidebar = document.querySelector('.ucp-sidebar');
    const welcomeSection = document.querySelector('.welcome-section');
    
    if (userType === 'student') {
        // Hide admin navigation and show only voting interface
        sidebar.style.display = 'none';
        
        // Update welcome message for students
        welcomeSection.innerHTML = `
            <div class="row">
                <div class="col-12 text-center">
                    <h3 class="text-primary">Student Voting Portal</h3>
                    <p class="text-muted">Cast your vote for the Student Government Election</p>
                    <div class="outstanding-balance">
                        <span class="text-muted">Voting Status:</span>
                        <span class="badge bg-success">ACTIVE</span>
                    </div>
                </div>
            </div>
        `;
        
        // Adjust main content area for full width
        document.querySelector('.ucp-main').style.marginLeft = '0';
        document.querySelector('.ucp-main').style.width = '100%';
        
    } else if (userType === 'admin') {
        // Show full admin interface
        sidebar.style.display = 'block';
        welcomeSection.innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <h3 class="text-primary">Welcome back, <span id="adminName">${currentUser.username}</span></h3>
                    <p class="text-muted">Manage the student government election system</p>
                </div>
                <div class="col-md-4 text-end">
                    <div class="outstanding-balance">
                        <span class="text-muted">Election Status:</span>
                        <span class="badge bg-success">ACTIVE</span>
                    </div>
                </div>
            </div>
        `;
        
        // Reset main content area for sidebar layout
        document.querySelector('.ucp-main').style.marginLeft = '';
        document.querySelector('.ucp-main').style.width = '';
    }
}

// Logout function
function logout() {
    currentUser = null;
    isLoggedIn = false;
    
    // Clean up any modal remnants
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Reload the page
    location.reload();
}

// Show different sections
function showSection(section) {
    // Check if user is logged in
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    
    // Check permissions for admin-only sections
    const adminSections = ['dashboard', 'elections', 'candidates', 'voters', 'results', 'reports', 'settings'];
    if (currentUser.type === 'student' && adminSections.includes(section)) {
        alert('Access denied! Students can only access the voting section.');
        showSection('vote');
        return;
    }
    
    const content = document.getElementById('mainContent');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Update active navigation (only for admin users)
    if (currentUser.type === 'admin') {
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(`[onclick="showSection('${section}')"]`)?.classList.add('active');
    }
    
    switch(section) {
        case 'dashboard':
            if (currentUser.type === 'admin') {
                content.innerHTML = createDashboard();
            } else {
                showSection('vote');
            }
            break;
        case 'elections':
            content.innerHTML = createElectionsSection();
            break;
        case 'candidates':
            content.innerHTML = createCandidatesSection();
            break;
        case 'voters':
            content.innerHTML = createVotersSection();
            break;
        case 'results':
            content.innerHTML = createResultsSection();
            break;
        case 'reports':
            content.innerHTML = createReportsSection();
            break;
        case 'settings':
            content.innerHTML = createSettingsSection();
            break;
        case 'vote':
            content.innerHTML = createVotingSection();
            break;
        default:
            if (currentUser.type === 'admin') {
                content.innerHTML = createDashboard();
            } else {
                content.innerHTML = createVotingSection();
            }
    }
}

// Create Dashboard
function createDashboard() {
    return `
        <div class="dashboard-grid">
            <div class="module-card module-elections" onclick="showSection('elections')">
                <div class="module-icon">
                    <i class="fas fa-vote-yea"></i>
                </div>
                <h5 class="module-title">Elections</h5>
                <p class="module-description">Manage election campaigns, schedules, and configurations</p>
            </div>
            
            <div class="module-card module-candidates" onclick="showSection('candidates')">
                <div class="module-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h5 class="module-title">Candidates</h5>
                <p class="module-description">Register and manage election candidates</p>
            </div>
            
            <div class="module-card module-voters" onclick="showSection('voters')">
                <div class="module-icon">
                    <i class="fas fa-user-check"></i>
                </div>
                <h5 class="module-title">Voters</h5>
                <p class="module-description">Manage student voter registration and verification</p>
            </div>
            
            <div class="module-card module-results" onclick="showSection('results')">
                <div class="module-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <h5 class="module-title">Results</h5>
                <p class="module-description">View real-time election results and analytics</p>
            </div>
            
            <div class="module-card module-reports" onclick="showSection('reports')">
                <div class="module-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <h5 class="module-title">Reports</h5>
                <p class="module-description">Generate detailed election reports and statistics</p>
            </div>
            
            <div class="module-card module-settings" onclick="showSection('settings')">
                <div class="module-icon">
                    <i class="fas fa-cog"></i>
                </div>
                <h5 class="module-title">Settings</h5>
                <p class="module-description">Configure system settings and preferences</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="stats-row">
                    <div class="stat-card">
                        <span class="stat-number">1,247</span>
                        <span class="stat-label">Total Registered Voters</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">234</span>
                        <span class="stat-label">Votes Cast Today</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">12</span>
                        <span class="stat-label">Active Candidates</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">6</span>
                        <span class="stat-label">Open Positions</span>
                    </div>
                </div>
                
                <div class="data-table">
                    <div class="table-header">
                        <i class="fas fa-clock me-2"></i> Recent Activity
                    </div>
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Activity</th>
                                <th>User</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2:30 PM</td>
                                <td>Vote Cast - President Position</td>
                                <td>STU-2021-001</td>
                                <td><span class="badge bg-success">Success</span></td>
                            </tr>
                            <tr>
                                <td>2:25 PM</td>
                                <td>Candidate Registered</td>
                                <td>John Doe</td>
                                <td><span class="badge bg-info">Pending</span></td>
                            </tr>
                            <tr>
                                <td>2:20 PM</td>
                                <td>Voter Registration</td>
                                <td>STU-2021-045</td>
                                <td><span class="badge bg-success">Approved</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="calendar-widget">
                    <div class="calendar-header">
                        <h6 class="mb-0">August 2025</h6>
                        <div>
                            <button class="btn btn-sm btn-outline-secondary me-1">&lt;</button>
                            <button class="btn btn-sm btn-outline-secondary">&gt;</button>
                        </div>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-day">Sun</div>
                        <div class="calendar-day">Mon</div>
                        <div class="calendar-day">Tue</div>
                        <div class="calendar-day">Wed</div>
                        <div class="calendar-day">Thu</div>
                        <div class="calendar-day">Fri</div>
                        <div class="calendar-day">Sat</div>
                        <div class="calendar-day other-month">27</div>
                        <div class="calendar-day other-month">28</div>
                        <div class="calendar-day other-month">29</div>
                        <div class="calendar-day other-month">30</div>
                        <div class="calendar-day other-month">31</div>
                        <div class="calendar-day">1</div>
                        <div class="calendar-day">2</div>
                        <div class="calendar-day">3</div>
                        <div class="calendar-day">4</div>
                        <div class="calendar-day">5</div>
                        <div class="calendar-day">6</div>
                        <div class="calendar-day today">7</div>
                        <div class="calendar-day">8</div>
                        <div class="calendar-day">9</div>
                        <div class="calendar-day">10</div>
                        <div class="calendar-day">11</div>
                        <div class="calendar-day">12</div>
                        <div class="calendar-day">13</div>
                        <div class="calendar-day">14</div>
                        <div class="calendar-day">15</div>
                        <div class="calendar-day">16</div>
                        <div class="calendar-day">17</div>
                        <div class="calendar-day">18</div>
                        <div class="calendar-day">19</div>
                        <div class="calendar-day">20</div>
                        <div class="calendar-day">21</div>
                        <div class="calendar-day">22</div>
                        <div class="calendar-day">23</div>
                        <div class="calendar-day">24</div>
                        <div class="calendar-day">25</div>
                        <div class="calendar-day">26</div>
                        <div class="calendar-day">27</div>
                        <div class="calendar-day">28</div>
                        <div class="calendar-day">29</div>
                        <div class="calendar-day">30</div>
                        <div class="calendar-day">31</div>
                    </div>
                </div>
                
                <div class="notice-board mt-4">
                    <h6 class="mb-3">Notice Board</h6>
                    <div class="notice-item">
                        <div class="notice-date">Today, 2:00 PM</div>
                        <div class="notice-text">Election period starts tomorrow. All candidates must submit final documents.</div>
                    </div>
                    <div class="notice-item">
                        <div class="notice-date">Yesterday, 4:30 PM</div>
                        <div class="notice-text">Voter registration deadline extended to August 10, 2025.</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Voting System
function showVotingInterface() {
    if (!currentUser) {
        alert('Please login first.');
        return;
    }
    
    const votingArea = document.getElementById('votingArea');
    
    if (currentUser.hasVoted) {
        votingArea.innerHTML = `
            <div class="text-center">
                <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                <h4>Thank you for voting!</h4>
                <p>You have already cast your vote. Results will be available after the election period.</p>
            </div>
        `;
        return;
    }
    
    votingArea.innerHTML = '<h3 class="text-center mb-4">Cast Your Vote</h3>';
    
    positions.forEach(position => {
        const positionCandidates = candidates.filter(c => c.position === position.id);
        if (positionCandidates.length > 0) {
            const votingCard = createVotingCard(position, positionCandidates);
            votingArea.appendChild(votingCard);
        }
    });
    
    // Add submit button
    const submitButton = document.createElement('div');
    submitButton.className = 'text-center mt-4';
    submitButton.innerHTML = `
        <button class="btn btn-success btn-lg" onclick="submitVote()">
            <i class="fas fa-vote-yea"></i> Submit My Vote
        </button>
    `;
    votingArea.appendChild(submitButton);
}

function createVotingCard(position, positionCandidates) {
    const card = document.createElement('div');
    card.className = 'voting-card';
    
    let candidateOptions = positionCandidates.map(candidate => `
        <div class="candidate-option" onclick="selectCandidate('${position.id}', ${candidate.id}, this)">
            <input type="radio" name="${position.id}" value="${candidate.id}" id="candidate-${candidate.id}">
            <label for="candidate-${candidate.id}">
                <strong>${candidate.name}</strong> (${candidate.year})
                <br><small class="text-muted">${candidate.platform.substring(0, 100)}...</small>
            </label>
        </div>
    `).join('');
    
    card.innerHTML = `
        <div class="position-title">
            <h4>${position.name}</h4>
            <p class="mb-0">${position.description}</p>
        </div>
        ${candidateOptions}
    `;
    
    return card;
}

function selectCandidate(position, candidateId, element) {
    // Remove previous selections for this position
    const positionOptions = element.parentNode.querySelectorAll('.candidate-option');
    positionOptions.forEach(option => option.classList.remove('selected'));
    
    // Mark current selection
    element.classList.add('selected');
    element.querySelector('input').checked = true;
    
    // Store the vote
    votingData[position] = candidateId;
}

function processVote(votes) {
    // In a real system, this would send the votes to a backend server
    console.log('Processing votes:', votes);
    
    // For demo purposes, we'll just store in localStorage
    let allVotes = JSON.parse(localStorage.getItem('electionVotes') || '[]');
    allVotes.push({
        voterId: currentUser.id,
        votes: votes,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('electionVotes', JSON.stringify(allVotes));
}

// Admin Panel
function showAdminPanel() {
    if (!isAdmin) {
        alert('Access denied. Admin privileges required.');
        return;
    }
    
    const main = document.querySelector('main') || document.body;
    main.innerHTML = `
        <div class="admin-panel">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-3">
                        <div class="admin-sidebar">
                            <h4><i class="fas fa-cog"></i> Admin Panel</h4>
                            <div class="admin-nav-item active" onclick="showAdminSection('dashboard', this)">
                                <i class="fas fa-tachometer-alt"></i> Dashboard
                            </div>
                            <div class="admin-nav-item" onclick="showAdminSection('candidates', this)">
                                <i class="fas fa-users"></i> Manage Candidates
                            </div>
                            <div class="admin-nav-item" onclick="showAdminSection('elections', this)">
                                <i class="fas fa-vote-yea"></i> Manage Elections
                            </div>
                            <div class="admin-nav-item" onclick="showAdminSection('results', this)">
                                <i class="fas fa-chart-bar"></i> View Results
                            </div>
                            <div class="admin-nav-item" onclick="showAdminSection('settings', this)">
                                <i class="fas fa-cog"></i> Settings
                            </div>
                            <div class="admin-nav-item" onclick="location.reload()">
                                <i class="fas fa-home"></i> Back to Main Site
                            </div>
                        </div>
                    </div>
                    <div class="col-md-9">
                        <div id="adminContent">
                            <!-- Admin content will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showAdminSection('dashboard');
}

function showAdminSection(section, navElement) {
    const content = document.getElementById('adminContent');
    const navItems = document.querySelectorAll('.admin-nav-item');
    
    // Update active navigation
    navItems.forEach(item => item.classList.remove('active'));
    navElement.classList.add('active');
    
    switch(section) {
        case 'dashboard':
            content.innerHTML = createAdminDashboard();
            break;
        case 'candidates':
            content.innerHTML = createCandidateManagement();
            break;
        case 'elections':
            content.innerHTML = createElectionManagement();
            break;
        case 'results':
            content.innerHTML = createResultsManagement();
            break;
        case 'settings':
            content.innerHTML = createSettingsPanel();
            break;
    }
}

function createAdminDashboard() {
    const votes = JSON.parse(localStorage.getItem('electionVotes') || '[]');
    
    return `
        <div class="admin-card">
            <h3><i class="fas fa-tachometer-alt"></i> Election Dashboard</h3>
            <div class="row">
                <div class="col-md-3">
                    <div class="stat-card bg-primary text-white p-3 rounded">
                        <h4>${votes.length}</h4>
                        <p>Total Votes</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-success text-white p-3 rounded">
                        <h4>${candidates.length}</h4>
                        <p>Total Candidates</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-warning text-white p-3 rounded">
                        <h4>${positions.length}</h4>
                        <p>Active Positions</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-info text-white p-3 rounded">
                        <h4>Active</h4>
                        <p>Election Status</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="admin-card">
            <h4>Recent Activity</h4>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Activity</th>
                            <th>User</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${votes.slice(-5).map(vote => `
                            <tr>
                                <td>${new Date(vote.timestamp).toLocaleString()}</td>
                                <td>Vote Cast</td>
                                <td>${vote.voterId}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function createCandidateManagement() {
    return `
        <div class="admin-card">
            <h3><i class="fas fa-users"></i> Candidate Management</h3>
            <button class="btn btn-primary mb-3" onclick="showAddCandidateForm()">
                <i class="fas fa-plus"></i> Add New Candidate
            </button>
            
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Position</th>
                            <th>Year Level</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${candidates.map(candidate => `
                            <tr>
                                <td>${candidate.name}</td>
                                <td>${positions.find(p => p.id === candidate.position)?.name}</td>
                                <td>${candidate.year}</td>
                                <td>
                                    <button class="btn btn-sm btn-warning" onclick="editCandidate(${candidate.id})">Edit</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteCandidate(${candidate.id})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function createElectionManagement() {
    return `
        <div class="admin-card">
            <h3><i class="fas fa-vote-yea"></i> Election Management</h3>
            
            <div class="row">
                <div class="col-md-6">
                    <h5>Election Settings</h5>
                    <form>
                        <div class="mb-3">
                            <label class="form-label">Election Title</label>
                            <input type="text" class="form-control" value="UCP Student Election 2025">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Start Date</label>
                            <input type="datetime-local" class="form-control">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">End Date</label>
                            <input type="datetime-local" class="form-control">
                        </div>
                        <button type="submit" class="btn btn-primary">Update Settings</button>
                    </form>
                </div>
                
                <div class="col-md-6">
                    <h5>Election Controls</h5>
                    <div class="d-grid gap-2">
                        <button class="btn btn-success">Start Election</button>
                        <button class="btn btn-warning">Pause Election</button>
                        <button class="btn btn-danger">End Election</button>
                        <button class="btn btn-info">Export Results</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createResultsManagement() {
    const votes = JSON.parse(localStorage.getItem('electionVotes') || '[]');
    const results = calculateResults(votes);
    
    return `
        <div class="admin-card">
            <h3><i class="fas fa-chart-bar"></i> Election Results</h3>
            
            ${positions.map(position => {
                const positionResults = results[position.id] || {};
                return `
                    <div class="mb-4">
                        <h5>${position.name}</h5>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Votes</th>
                                        <th>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(positionResults).map(([candidateId, voteCount]) => {
                                        const candidate = candidates.find(c => c.id === parseInt(candidateId));
                                        const percentage = votes.length > 0 ? ((voteCount / votes.length) * 100).toFixed(1) : 0;
                                        return `
                                            <tr>
                                                <td>${candidate?.name || 'Unknown'}</td>
                                                <td>${voteCount}</td>
                                                <td>${percentage}%</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function createSettingsPanel() {
    return `
        <div class="admin-card">
            <h3><i class="fas fa-cog"></i> System Settings</h3>
            
            <form>
                <div class="mb-3">
                    <label class="form-label">University Name</label>
                    <input type="text" class="form-control" value="University of Cebu - Pardo">
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Election Year</label>
                    <input type="number" class="form-control" value="2025">
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Voting Rules</label>
                    <select class="form-control">
                        <option>One vote per position</option>
                        <option>Ranked choice voting</option>
                        <option>Approval voting</option>
                    </select>
                </div>
                
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="allowAbstain">
                        <label class="form-check-label" for="allowAbstain">
                            Allow abstain votes
                        </label>
                    </div>
                </div>
                
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="showRealTime">
                        <label class="form-check-label" for="showRealTime">
                            Show real-time results
                        </label>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary">Save Settings</button>
                <button type="button" class="btn btn-danger" onclick="resetElection()">Reset Election Data</button>
            </form>
        </div>
    `;
}

// Utility Functions
function calculateResults(votes) {
    const results = {};
    
    votes.forEach(vote => {
        Object.entries(vote.votes).forEach(([position, candidateId]) => {
            if (!results[position]) {
                results[position] = {};
            }
            results[position][candidateId] = (results[position][candidateId] || 0) + 1;
        });
    });
    
    return results;
}

function updateElectionStats() {
    const votes = JSON.parse(localStorage.getItem('electionVotes') || '[]');
    const totalStudents = 1000; // This would come from your database
    
    document.getElementById('totalVotes').textContent = votes.length;
    document.getElementById('turnoutRate').textContent = 
        ((votes.length / totalStudents) * 100).toFixed(1) + '%';
}

// Additional admin functions
function showAddCandidateForm() {
    // Implementation for adding new candidates
    alert('Add candidate form would open here');
}

function editCandidate(candidateId) {
    // Implementation for editing candidates
    alert(`Edit candidate ${candidateId}`);
}

function deleteCandidate(candidateId) {
    if (confirm('Are you sure you want to delete this candidate?')) {
        // Implementation for deleting candidates
        alert(`Candidate ${candidateId} deleted`);
    }
}

function showRegistration() {
    alert('Student registration feature would be implemented here. For demo purposes, use any Student ID with password "student123".');
}

// Create Elections Section
function createElectionsSection() {
    return `
        <div class="form-section">
            <h4><i class="fas fa-vote-yea me-2"></i>Election Management</h4>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Election Title</label>
                        <input type="text" class="form-control" value="UCP Student Government Election 2025">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Election Type</label>
                        <select class="form-control">
                            <option>Student Government</option>
                            <option>Class Representatives</option>
                            <option>Organization Officers</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Start Date & Time</label>
                        <input type="datetime-local" class="form-control">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">End Date & Time</label>
                        <input type="datetime-local" class="form-control">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Election Status</label>
                        <select class="form-control">
                            <option>Draft</option>
                            <option>Active</option>
                            <option>Paused</option>
                            <option>Completed</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Eligible Voters</label>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="year1" checked>
                            <label class="form-check-label" for="year1">1st Year Students</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="year2" checked>
                            <label class="form-check-label" for="year2">2nd Year Students</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="year3" checked>
                            <label class="form-check-label" for="year3">3rd Year Students</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="year4" checked>
                            <label class="form-check-label" for="year4">4th Year Students</label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <button class="btn btn-ucp-primary">
                            <i class="fas fa-save me-2"></i>Save Election Settings
                        </button>
                        <button class="btn btn-success ms-2">
                            <i class="fas fa-play me-2"></i>Start Election
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="data-table">
            <div class="table-header">
                <i class="fas fa-list me-2"></i>Election Positions
            </div>
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Candidates</th>
                        <th>Votes Cast</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>President</td>
                        <td>3 candidates</td>
                        <td>127 votes</td>
                        <td><span class="badge bg-success">Active</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary">Edit</button>
                            <button class="btn btn-sm btn-outline-info">View</button>
                        </td>
                    </tr>
                    <tr>
                        <td>Vice President</td>
                        <td>2 candidates</td>
                        <td>98 votes</td>
                        <td><span class="badge bg-success">Active</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary">Edit</button>
                            <button class="btn btn-sm btn-outline-info">View</button>
                        </td>
                    </tr>
                    <tr>
                        <td>Secretary</td>
                        <td>4 candidates</td>
                        <td>156 votes</td>
                        <td><span class="badge bg-success">Active</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary">Edit</button>
                            <button class="btn btn-sm btn-outline-info">View</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Create Candidates Section
function createCandidatesSection() {
    return `
        <div class="form-section">
            <h4><i class="fas fa-users me-2"></i>Candidate Registration</h4>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" placeholder="Enter candidate's full name">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Student ID</label>
                        <input type="text" class="form-control" placeholder="Enter student ID">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Year Level</label>
                        <select class="form-control">
                            <option value="">Select Year Level</option>
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            <option value="3rd">3rd Year</option>
                            <option value="4th">4th Year</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Program/Course</label>
                        <input type="text" class="form-control" placeholder="e.g., BS Computer Science">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Position Running For</label>
                        <select class="form-control">
                            <option value="">Select Position</option>
                            <option value="president">President</option>
                            <option value="vice-president">Vice President</option>
                            <option value="secretary">Secretary</option>
                            <option value="treasurer">Treasurer</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Platform/Agenda</label>
                        <textarea class="form-control" rows="4" placeholder="Describe the candidate's platform and agenda"></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Candidate Photo</label>
                        <input type="file" class="form-control" accept="image/*">
                    </div>
                    <div class="mb-3">
                        <button class="btn btn-ucp-primary">
                            <i class="fas fa-user-plus me-2"></i>Register Candidate
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="data-table">
            <div class="table-header">
                <i class="fas fa-users me-2"></i>Registered Candidates
            </div>
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Photo</th>
                        <th>Name</th>
                        <th>Student ID</th>
                        <th>Position</th>
                        <th>Year Level</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><img src="https://via.placeholder.com/40x40" class="rounded-circle" alt="Photo"></td>
                        <td>John Doe</td>
                        <td>2021-001</td>
                        <td>President</td>
                        <td>4th Year</td>
                        <td><span class="badge bg-success">Approved</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary">Edit</button>
                            <button class="btn btn-sm btn-outline-danger">Remove</button>
                        </td>
                    </tr>
                    <tr>
                        <td><img src="https://via.placeholder.com/40x40" class="rounded-circle" alt="Photo"></td>
                        <td>Jane Smith</td>
                        <td>2021-002</td>
                        <td>Vice President</td>
                        <td>3rd Year</td>
                        <td><span class="badge bg-warning">Pending</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-success">Approve</button>
                            <button class="btn btn-sm btn-outline-danger">Reject</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Create Voters Section
function createVotersSection() {
    return `
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="form-section">
                    <h4><i class="fas fa-user-check me-2"></i>Voter Registration</h4>
                    <div class="mb-3">
                        <label class="form-label">Student ID</label>
                        <input type="text" class="form-control" placeholder="Enter student ID">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" placeholder="Enter full name">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Year Level</label>
                        <select class="form-control">
                            <option value="">Select Year Level</option>
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            <option value="3rd">3rd Year</option>
                            <option value="4th">4th Year</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Program/Course</label>
                        <input type="text" class="form-control" placeholder="Enter program">
                    </div>
                    <button class="btn btn-ucp-primary">
                        <i class="fas fa-user-plus me-2"></i>Register Voter
                    </button>
                </div>
            </div>
            <div class="col-md-6">
                <div class="stats-row">
                    <div class="stat-card">
                        <span class="stat-number">1,247</span>
                        <span class="stat-label">Total Registered</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">234</span>
                        <span class="stat-label">Voted Today</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">18.8%</span>
                        <span class="stat-label">Turnout Rate</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">1,013</span>
                        <span class="stat-label">Pending Votes</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="data-table">
            <div class="table-header">
                <i class="fas fa-users me-2"></i>Registered Voters
            </div>
            <div class="p-3">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Search by name or student ID...">
                    </div>
                    <div class="col-md-3">
                        <select class="form-control">
                            <option>All Year Levels</option>
                            <option>1st Year</option>
                            <option>2nd Year</option>
                            <option>3rd Year</option>
                            <option>4th Year</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select class="form-control">
                            <option>All Status</option>
                            <option>Voted</option>
                            <option>Not Voted</option>
                        </select>
                    </div>
                </div>
            </div>
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Year Level</th>
                        <th>Program</th>
                        <th>Voting Status</th>
                        <th>Vote Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>2021-001</td>
                        <td>Alice Johnson</td>
                        <td>4th Year</td>
                        <td>BS Computer Science</td>
                        <td><span class="badge bg-success">Voted</span></td>
                        <td>2:30 PM</td>
                        <td>
                            <button class="btn btn-sm btn-outline-info">View</button>
                        </td>
                    </tr>
                    <tr>
                        <td>2021-002</td>
                        <td>Bob Williams</td>
                        <td>3rd Year</td>
                        <td>BS Business Admin</td>
                        <td><span class="badge bg-warning">Not Voted</span></td>
                        <td>-</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary">Remind</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Create Results Section
function createResultsSection() {
    return `
        <div class="row mb-4">
            <div class="col-md-12">
                <div class="stats-row">
                    <div class="stat-card">
                        <span class="stat-number">234</span>
                        <span class="stat-label">Total Votes Cast</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">18.8%</span>
                        <span class="stat-label">Voter Turnout</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">12</span>
                        <span class="stat-label">Candidates</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">6</span>
                        <span class="stat-label">Positions</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="data-table">
                    <div class="table-header">
                        <i class="fas fa-crown me-2"></i>President Results
                    </div>
                    <table class="table mb-0">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Votes</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="table-success">
                                <td><strong>John Doe</strong> <span class="badge bg-success">Leading</span></td>
                                <td>89</td>
                                <td>38.1%</td>
                            </tr>
                            <tr>
                                <td>Jane Smith</td>
                                <td>78</td>
                                <td>33.3%</td>
                            </tr>
                            <tr>
                                <td>Mike Johnson</td>
                                <td>67</td>
                                <td>28.6%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-md-6">
                <div class="data-table">
                    <div class="table-header">
                        <i class="fas fa-user-tie me-2"></i>Vice President Results
                    </div>
                    <table class="table mb-0">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Votes</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="table-success">
                                <td><strong>Sarah Wilson</strong> <span class="badge bg-success">Leading</span></td>
                                <td>123</td>
                                <td>52.6%</td>
                            </tr>
                            <tr>
                                <td>Alex Brown</td>
                                <td>111</td>
                                <td>47.4%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-6">
                <div class="data-table">
                    <div class="table-header">
                        <i class="fas fa-edit me-2"></i>Secretary Results
                    </div>
                    <table class="table mb-0">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Votes</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="table-success">
                                <td><strong>Emily Davis</strong> <span class="badge bg-success">Leading</span></td>
                                <td>98</td>
                                <td>41.9%</td>
                            </tr>
                            <tr>
                                <td>Tom Wilson</td>
                                <td>87</td>
                                <td>37.2%</td>
                            </tr>
                            <tr>
                                <td>Lisa Chen</td>
                                <td>49</td>
                                <td>20.9%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-md-6">
                <div class="data-table">
                    <div class="table-header">
                        <i class="fas fa-dollar-sign me-2"></i>Treasurer Results
                    </div>
                    <table class="table mb-0">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Votes</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="table-success">
                                <td><strong>David Lee</strong> <span class="badge bg-success">Leading</span></td>
                                <td>145</td>
                                <td>62.0%</td>
                            </tr>
                            <tr>
                                <td>Maria Garcia</td>
                                <td>89</td>
                                <td>38.0%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Create Reports Section
function createReportsSection() {
    return `
        <div class="form-section">
            <h4><i class="fas fa-file-alt me-2"></i>Generate Reports</h4>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Report Type</label>
                        <select class="form-control">
                            <option>Election Summary Report</option>
                            <option>Voter Turnout Analysis</option>
                            <option>Candidate Performance Report</option>
                            <option>Detailed Vote Report</option>
                            <option>Demographic Analysis</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Date Range</label>
                        <div class="row">
                            <div class="col-md-6">
                                <input type="date" class="form-control" placeholder="Start Date">
                            </div>
                            <div class="col-md-6">
                                <input type="date" class="form-control" placeholder="End Date">
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Format</label>
                        <select class="form-control">
                            <option>PDF Report</option>
                            <option>Excel Spreadsheet</option>
                            <option>CSV Data</option>
                        </select>
                    </div>
                    <button class="btn btn-ucp-primary">
                        <i class="fas fa-download me-2"></i>Generate Report
                    </button>
                </div>
                <div class="col-md-6">
                    <div class="notice-board">
                        <h6>Quick Statistics</h6>
                        <div class="notice-item">
                            <div class="notice-text"><strong>Total Registered Voters:</strong> 1,247</div>
                        </div>
                        <div class="notice-item">
                            <div class="notice-text"><strong>Votes Cast:</strong> 234 (18.8%)</div>
                        </div>
                        <div class="notice-item">
                            <div class="notice-text"><strong>Average Vote Time:</strong> 2.3 minutes</div>
                        </div>
                        <div class="notice-item">
                            <div class="notice-text"><strong>Peak Voting Hour:</strong> 2:00 PM - 3:00 PM</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="data-table">
            <div class="table-header">
                <i class="fas fa-history me-2"></i>Report History
            </div>
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        <th>Report Name</th>
                        <th>Generated Date</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Election Summary Report - Aug 2025</td>
                        <td>Aug 7, 2025 3:30 PM</td>
                        <td>PDF</td>
                        <td><span class="badge bg-success">Completed</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary">Download</button>
                            <button class="btn btn-sm btn-outline-info">View</button>
                        </td>
                    </tr>
                    <tr>
                        <td>Voter Turnout Analysis</td>
                        <td>Aug 6, 2025 1:15 PM</td>
                        <td>Excel</td>
                        <td><span class="badge bg-success">Completed</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary">Download</button>
                            <button class="btn btn-sm btn-outline-info">View</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Create Voting Section (for students)
function createVotingSection() {
    if (!isLoggedIn || currentUser?.type !== 'student') {
        return `
            <div class="text-center py-5">
                <i class="fas fa-lock fa-4x text-muted mb-4"></i>
                <h3>Access Restricted</h3>
                <p class="text-muted">Please login as a student to access the voting system.</p>
                <button class="btn btn-ucp-primary" onclick="showLogin()">Login</button>
            </div>
        `;
    }
    
    return `
        <div class="form-section">
            <h4><i class="fas fa-vote-yea me-2"></i>Cast Your Vote</h4>
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                You can vote for one candidate per position. Make sure to review your choices before submitting.
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="voting-position mb-4">
                        <h5 class="text-primary">President</h5>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="president" id="pres1" value="1">
                            <label class="form-check-label" for="pres1">
                                <strong>John Doe</strong> - 4th Year Computer Science<br>
                                <small class="text-muted">Platform: Student welfare and academic excellence</small>
                            </label>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="president" id="pres2" value="2">
                            <label class="form-check-label" for="pres2">
                                <strong>Jane Smith</strong> - 4th Year Business Admin<br>
                                <small class="text-muted">Platform: Better campus facilities and services</small>
                            </label>
                        </div>
                    </div>
                    
                    <div class="voting-position mb-4">
                        <h5 class="text-primary">Secretary</h5>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="secretary" id="sec1" value="1">
                            <label class="form-check-label" for="sec1">
                                <strong>Emily Davis</strong> - 3rd Year Education<br>
                                <small class="text-muted">Platform: Improved communication and transparency</small>
                            </label>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="secretary" id="sec2" value="2">
                            <label class="form-check-label" for="sec2">
                                <strong>Tom Wilson</strong> - 2nd Year Engineering<br>
                                <small class="text-muted">Platform: Digital record management</small>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="voting-position mb-4">
                        <h5 class="text-primary">Vice President</h5>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="vicepresident" id="vp1" value="1">
                            <label class="form-check-label" for="vp1">
                                <strong>Sarah Wilson</strong> - 4th Year Psychology<br>
                                <small class="text-muted">Platform: Mental health support and counseling</small>
                            </label>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="vicepresident" id="vp2" value="2">
                            <label class="form-check-label" for="vp2">
                                <strong>Alex Brown</strong> - 3rd Year Sports Science<br>
                                <small class="text-muted">Platform: Sports and cultural activities</small>
                            </label>
                        </div>
                    </div>
                    
                    <div class="voting-position mb-4">
                        <h5 class="text-primary">Treasurer</h5>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="treasurer" id="treas1" value="1">
                            <label class="form-check-label" for="treas1">
                                <strong>David Lee</strong> - 3rd Year Accounting<br>
                                <small class="text-muted">Platform: Financial transparency and accountability</small>
                            </label>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" name="treasurer" id="treas2" value="2">
                            <label class="form-check-label" for="treas2">
                                <strong>Maria Garcia</strong> - 4th Year Finance<br>
                                <small class="text-muted">Platform: Budget optimization for student activities</small>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <button class="btn btn-success btn-lg" onclick="submitVote()">
                    <i class="fas fa-check me-2"></i>Submit My Vote
                </button>
            </div>
        </div>
    `;
}

// Submit vote function
function submitVote() {
    // Collect all votes
    const votes = {};
    const positions = ['president', 'vicepresident', 'secretary', 'treasurer'];
    
    positions.forEach(position => {
        const selected = document.querySelector(`input[name="${position}"]:checked`);
        if (selected) {
            votes[position] = selected.value;
        }
    });
    
    if (Object.keys(votes).length === 0) {
        alert('Please select at least one candidate before submitting your vote.');
        return;
    }
    
    if (confirm('Are you sure you want to submit your vote? This action cannot be undone.')) {
        // Process the vote
        console.log('Votes submitted:', votes);
        
        // Show success message
        document.getElementById('mainContent').innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-check-circle fa-4x text-success mb-4"></i>
                <h3>Vote Successfully Submitted!</h3>
                <p class="text-muted">Thank you for participating in the election. Your vote has been recorded.</p>
                <button class="btn btn-ucp-primary" onclick="logout()">Logout</button>
            </div>
        `;
        
        alert('Your vote has been successfully submitted! Thank you for participating.');
    }
}

// Create Settings Section
function createSettingsSection() {
    return `
        <div class="row">
            <div class="col-12">
                <h2 class="mb-4"><i class="fas fa-cog me-2"></i>System Settings</h2>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="form-section">
                    <h4><i class="fas fa-vote-yea me-2"></i>Election Configuration</h4>
                    
                    <div class="mb-3">
                        <label for="electionName" class="form-label">Election Name</label>
                        <input type="text" class="form-control" id="electionName" value="Student Government Election 2025">
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <label for="startDate" class="form-label">Start Date</label>
                            <input type="datetime-local" class="form-control" id="startDate" value="2025-08-10T08:00">
                        </div>
                        <div class="col-md-6">
                            <label for="endDate" class="form-label">End Date</label>
                            <input type="datetime-local" class="form-control" id="endDate" value="2025-08-12T18:00">
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="allowMultipleVotes" checked>
                            <label class="form-check-label" for="allowMultipleVotes">
                                Enable Real-time Results
                            </label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="requireStudentId" checked>
                            <label class="form-check-label" for="requireStudentId">
                                Require Student ID Verification
                            </label>
                        </div>
                    </div>
                    
                    <button class="btn btn-ucp-primary mt-3" onclick="saveElectionSettings()">
                        <i class="fas fa-save me-2"></i>Save Election Settings
                    </button>
                </div>
                
                <div class="form-section">
                    <h4><i class="fas fa-users-cog me-2"></i>User Management</h4>
                    
                    <div class="mb-3">
                        <label for="maxVoters" class="form-label">Maximum Registered Voters</label>
                        <input type="number" class="form-control" id="maxVoters" value="1500">
                    </div>
                    
                    <div class="mb-3">
                        <label for="adminEmails" class="form-label">Admin Email Notifications</label>
                        <textarea class="form-control" id="adminEmails" rows="3" placeholder="admin1@ucp.edu.ph&#10;admin2@ucp.edu.ph">admin@ucp.edu.ph&#10;election@ucp.edu.ph</textarea>
                    </div>
                    
                    <button class="btn btn-ucp-primary" onclick="saveUserSettings()">
                        <i class="fas fa-save me-2"></i>Save User Settings
                    </button>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="form-section">
                    <h4><i class="fas fa-shield-alt me-2"></i>Security Settings</h4>
                    
                    <div class="mb-3">
                        <label for="sessionTimeout" class="form-label">Session Timeout (minutes)</label>
                        <select class="form-select" id="sessionTimeout">
                            <option value="15">15 minutes</option>
                            <option value="30" selected>30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="passwordPolicy" class="form-label">Password Policy</label>
                        <select class="form-select" id="passwordPolicy">
                            <option value="basic">Basic (6+ characters)</option>
                            <option value="standard" selected>Standard (8+ chars, mixed case)</option>
                            <option value="strong">Strong (12+ chars, symbols)</option>
                        </select>
                    </div>
                    
                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="twoFactorAuth">
                        <label class="form-check-label" for="twoFactorAuth">
                            Enable Two-Factor Authentication
                        </label>
                    </div>
                    
                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="auditLogging" checked>
                        <label class="form-check-label" for="auditLogging">
                            Enable Audit Logging
                        </label>
                    </div>
                    
                    <button class="btn btn-ucp-primary" onclick="saveSecuritySettings()">
                        <i class="fas fa-save me-2"></i>Save Security Settings
                    </button>
                </div>
                
                <div class="form-section">
                    <h4><i class="fas fa-database me-2"></i>System Maintenance</h4>
                    
                    <div class="mb-3">
                        <p class="text-muted">Database Size: <strong>245 MB</strong></p>
                        <p class="text-muted">Last Backup: <strong>August 6, 2025 11:30 PM</strong></p>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button class="btn btn-outline-primary" onclick="backupDatabase()">
                            <i class="fas fa-download me-2"></i>Backup Database
                        </button>
                        <button class="btn btn-outline-info" onclick="exportElectionData()">
                            <i class="fas fa-file-export me-2"></i>Export Election Data
                        </button>
                        <button class="btn btn-outline-warning" onclick="clearOldLogs()">
                            <i class="fas fa-trash me-2"></i>Clear Old Logs
                        </button>
                        <button class="btn btn-outline-danger" onclick="resetElection()">
                            <i class="fas fa-exclamation-triangle me-2"></i>Reset Election
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Settings functions
function saveElectionSettings() {
    const electionName = document.getElementById('electionName').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Save to localStorage (in real app, save to database)
    const settings = {
        electionName,
        startDate,
        endDate,
        allowMultipleVotes: document.getElementById('allowMultipleVotes').checked,
        requireStudentId: document.getElementById('requireStudentId').checked
    };
    
    localStorage.setItem('electionSettings', JSON.stringify(settings));
    alert('Election settings saved successfully!');
}

function saveUserSettings() {
    const maxVoters = document.getElementById('maxVoters').value;
    const adminEmails = document.getElementById('adminEmails').value;
    
    const settings = {
        maxVoters: parseInt(maxVoters),
        adminEmails: adminEmails.split('\\n').filter(email => email.trim())
    };
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    alert('User settings saved successfully!');
}

function saveSecuritySettings() {
    const settings = {
        sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
        passwordPolicy: document.getElementById('passwordPolicy').value,
        twoFactorAuth: document.getElementById('twoFactorAuth').checked,
        auditLogging: document.getElementById('auditLogging').checked
    };
    
    localStorage.setItem('securitySettings', JSON.stringify(settings));
    alert('Security settings saved successfully!');
}

function backupDatabase() {
    alert('Database backup initiated. This may take a few minutes...');
    setTimeout(() => {
        alert('Database backup completed successfully!');
    }, 2000);
}

function exportElectionData() {
    const data = {
        timestamp: new Date().toISOString(),
        electionName: 'Student Government Election 2025',
        totalVoters: 1247,
        totalVotes: 234,
        candidates: 12,
        positions: 6
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'election-data-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Election data exported successfully!');
}

function clearOldLogs() {
    if (confirm('Are you sure you want to clear old logs? This action cannot be undone.')) {
        alert('Old logs cleared successfully!');
    }
}

function resetElection() {
    if (confirm('WARNING: This will reset ALL election data including votes, candidates, and results. This action cannot be undone. Are you sure?')) {
        if (confirm('This is your final warning. Resetting will permanently delete all election data. Continue?')) {
            // Clear all data
            localStorage.clear();
            alert('Election data has been reset. The page will now reload.');
            location.reload();
        }
    }
}