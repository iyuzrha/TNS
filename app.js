// Data Store Management (Using LocalStorage for persistence)
const STORAGE_KEY = 'nursPlannerData';

const defaultData = {
    students: [
        { id: '20240001', name: '임수철', status: 'active', type: 'regular', history: { hospitals: [], subjects: [] } },
        { id: '20240002', name: '이민준', status: 'active', type: 'regular', history: { hospitals: ['A'], subjects: ['아동간호'] } },
        { id: '20240003', name: '박서연', status: 'active', type: 'regular', history: { hospitals: [], subjects: [] } },
        { id: '20240004', name: '최현우', status: 'active', type: 'regular', history: { hospitals: ['B'], subjects: ['여성간호'] } },
        { id: '20240005', name: '정하은', status: 'active', type: 'regular', history: { hospitals: ['C'], subjects: ['아동간호'] } }
    ],
    hospitals: ['A병원', 'B병원', 'C병원', 'D병원', 'E병원'],
    subjects: ['아동간호', '여성간호'],
    schedules: []
};

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || JSON.parse(JSON.stringify(defaultData));

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    updateDashboardStats();
}

// UI Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Show target page
        const targetId = e.currentTarget.getAttribute('data-target');
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
        
        // Update title
        document.getElementById('page-title').innerText = e.currentTarget.innerText.trim();
        
        // Re-render specific page data if needed
        if(targetId === 'students') renderStudents();
        if(targetId === 'hospitals') renderHospitalsAndSubjects();
        if(targetId === 'dashboard') updateDashboardStats();
    });
});

// Dashboard Logic
function updateDashboardStats() {
    const activeStudents = appData.students.filter(s => s.status === 'active').length;
    document.getElementById('stat-total-students').innerText = activeStudents;
    document.getElementById('stat-total-hospitals').innerText = appData.hospitals.length;
    document.getElementById('stat-total-subjects').innerText = appData.subjects.length;
    
    const dashboardContent = document.querySelector('.dashboard-content .panel');
    if(appData.schedules.length === 0) {
        dashboardContent.innerHTML = '<h2>최근 생성된 스케줄 요약</h2><p class="empty-state">아직 생성된 스케줄이 없습니다.</p>';
    } else {
        const latest = appData.schedules[appData.schedules.length - 1];
        dashboardContent.innerHTML = `
            <h2>최근 스케줄: ${latest.semester}학기</h2>
            <p>총 배정 인원: ${latest.assignments.length}명</p>
            <button class="btn btn-outline" style="margin-top: 1rem;" onclick="document.querySelector('[data-target=\\'scheduler\\']').click()">스케줄러로 이동</button>
        `;
    }
}

// Students Logic
const studentModal = document.getElementById('student-modal');
const studentForm = document.getElementById('student-form');

document.getElementById('add-student-btn').addEventListener('click', () => {
    studentForm.reset();
    document.getElementById('student-modal-title').innerText = '학생 추가';
    studentModal.classList.add('active');
});

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => studentModal.classList.remove('active'));
});

studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('student-id').value;
    const name = document.getElementById('student-name').value;
    const status = document.getElementById('student-status').value;
    const type = document.getElementById('student-type').value;

    const existingIndex = appData.students.findIndex(s => s.id === id);
    if(existingIndex >= 0) {
        appData.students[existingIndex] = { ...appData.students[existingIndex], name, status, type };
    } else {
        appData.students.push({ id, name, status, type, history: { hospitals: [], subjects: [] } });
    }
    
    saveData();
    renderStudents();
    studentModal.classList.remove('active');
});

function editStudent(id) {
    const student = appData.students.find(s => s.id === id);
    if(!student) return;
    
    document.getElementById('student-id').value = student.id;
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-status').value = student.status;
    document.getElementById('student-type').value = student.type;
    
    document.getElementById('student-modal-title').innerText = '학생 정보 수정';
    studentModal.classList.add('active');
}

function deleteStudent(id) {
    if(confirm('정말로 이 학생을 삭제하시겠습니까?')) {
        appData.students = appData.students.filter(s => s.id !== id);
        saveData();
        renderStudents();
    }
}

function getStatusBadge(status) {
    const map = { active: '재학', leave: '휴학', dropout: '자퇴' };
    return `<span class="badge ${status}">${map[status]}</span>`;
}

function getTypeBadge(type) {
    const map = { regular: '일반', transfer: '편입생' };
    return `<span class="badge ${type}">${map[type]}</span>`;
}

function renderStudents() {
    const tbody = document.querySelector('#students-table tbody');
    tbody.innerHTML = '';
    
    appData.students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${student.name}</strong></td>
            <td>${student.id}</td>
            <td>${getStatusBadge(student.status)}</td>
            <td>${getTypeBadge(student.type)}</td>
            <td>
                <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.875rem;" onclick="editStudent('${student.id}')">수정</button>
                <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.875rem; color: var(--danger); border-color: rgba(239,68,68,0.3);" onclick="deleteStudent('${student.id}')">삭제</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Hospitals & Subjects Logic
function renderHospitalsAndSubjects() {
    const hList = document.getElementById('hospitals-list');
    hList.innerHTML = '';
    appData.hospitals.forEach(h => {
        hList.innerHTML += `<li class="list-item"><span><i class="ri-hospital-building-fill" style="color:var(--primary); margin-right:8px;"></i> ${h}</span></li>`;
    });

    const sList = document.getElementById('subjects-list');
    sList.innerHTML = '';
    appData.subjects.forEach(s => {
        sList.innerHTML += `<li class="list-item"><span><i class="ri-book-open-fill" style="color:var(--secondary); margin-right:8px;"></i> ${s}</span></li>`;
    });
}

// Scheduling Algorithm Logic
document.getElementById('generate-schedule-btn').addEventListener('click', generateSchedule);

function generateSchedule() {
    const semester = document.getElementById('schedule-semester').value;
    const activeStudents = appData.students.filter(s => s.status === 'active');
    
    if (activeStudents.length === 0) {
        alert('배정할 활성(재학) 학생이 없습니다.');
        return;
    }

    if (appData.hospitals.length === 0 || appData.subjects.length === 0) {
        alert('병원 또는 과목 데이터가 부족합니다.');
        return;
    }

    const assignments = [];
    
    // 1. 과목 교차 배정 로직 (Subject Rotation)
    // 1학기: 아동/여성 반반 나눔, 2학기: 히스토리 보고 안 들은 과목 배정
    
    // Shuffle students randomly first to avoid bias, but prioritize transfer students to fill gaps if needed.
    let studentsToAssign = [...activeStudents].sort(() => Math.random() - 0.5);

    studentsToAssign.forEach(student => {
        let targetSubject = '';
        
        // Subject logic
        if (student.history.subjects.length > 0) {
            // Find a subject they haven't taken
            targetSubject = appData.subjects.find(s => !student.history.subjects.includes(s)) || appData.subjects[0];
        } else {
            // Randomly assign one of the subjects to start
            targetSubject = appData.subjects[Math.floor(Math.random() * appData.subjects.length)];
        }

        // 2. 병원 순환 배정 로직 (Hospital Rotation)
        let targetHospital = '';
        
        // Find hospitals they haven't visited
        const unvisitedHospitals = appData.hospitals.filter(h => !student.history.hospitals.includes(h));
        
        if (unvisitedHospitals.length > 0) {
            targetHospital = unvisitedHospitals[Math.floor(Math.random() * unvisitedHospitals.length)];
        } else {
            // If they visited all (unlikely but possible), pick any
            targetHospital = appData.hospitals[Math.floor(Math.random() * appData.hospitals.length)];
        }

        assignments.push({
            studentId: student.id,
            studentName: student.name,
            hospital: targetHospital,
            subject: targetSubject,
            isTransfer: student.type === 'transfer'
        });
        
        // Update temporary history (don't save to real history until finalized/locked - but for this MVP we simulate it)
        // In a real app, history is updated only when semester ends.
    });

    const newSchedule = {
        id: 'sch_' + Date.now(),
        semester: semester,
        date: new Date().toISOString(),
        assignments: assignments
    };

    // Replace or add for this semester (simplified logic: just add new)
    appData.schedules.push(newSchedule);
    saveData();
    renderScheduleResult(newSchedule);
}

function renderScheduleResult(schedule) {
    const container = document.getElementById('schedule-result');
    if (!schedule) {
        container.innerHTML = '<p class="empty-state">생성된 스케줄이 없습니다.</p>';
        return;
    }

    let html = `<div class="schedule-grid">`;
    html += `<h3>${schedule.semester}학기 실습 배정 결과</h3>`;
    
    // Group by Subject -> Hospital
    appData.subjects.forEach(subject => {
        html += `<div class="schedule-block">`;
        html += `<div class="schedule-block-header">과목: ${subject}</div>`;
        html += `<div class="schedule-hospitals">`;
        
        appData.hospitals.forEach(hospital => {
            const assigned = schedule.assignments.filter(a => a.subject === subject && a.hospital === hospital);
            html += `<div class="schedule-hospital-card">`;
            html += `<h4>${hospital} (${assigned.length}명)</h4>`;
            html += `<div>`;
            if(assigned.length === 0) {
                html += `<span class="text-secondary" style="font-size:0.8rem;">배정 인원 없음</span>`;
            } else {
                assigned.forEach(a => {
                    const highlight = a.isTransfer ? 'border: 1px solid var(--secondary);' : '';
                    html += `<span class="student-tag" style="${highlight}" title="${a.studentId}">${a.studentName}</span>`;
                });
            }
            html += `</div></div>`;
        });
        
        html += `</div></div>`;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

// Reset Data
document.getElementById('reset-data-btn').addEventListener('click', () => {
    if(confirm('모든 데이터를 초기화하시겠습니까? 초기 상태로 돌아갑니다.')) {
        appData = JSON.parse(JSON.stringify(defaultData));
        saveData();
        location.reload();
    }
});

// Init App
updateDashboardStats();
if (appData.schedules.length > 0) {
    // Optionally render the latest schedule if on scheduler page
    renderScheduleResult(appData.schedules[appData.schedules.length - 1]);
}
