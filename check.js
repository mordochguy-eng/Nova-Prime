
    // Initial Seed Data
    const seedWorkers = [
        { 
            id: "341122331", firstName: "דוד", lastName: "כהן", 
            sector: "מנהלה", department: "תברואה נפת בנימין", status: "עובדים",
            phone: "050-1234567", years: 11, avatar: "https://i.pravatar.cc/150?img=11", 
            tags: ["לקראת פנסיה", "נוסע לוינה 2026"] 
        },
        { 
            id: "015522884", firstName: "שרית", lastName: "מדמוני", 
            sector: "חינוך", department: "ביה\"ס פסגות - ניהול פיננסי", status: "עובדים",
            phone: "052-9876543", years: 5.5, avatarText: "שמ", avatarColor: "bg-pink-50 text-pink-500 border-pink-100", 
            tags: ["משרת מילואים/זוג משרת", "+ עולה לכיתה א'"] 
        },
        { 
            id: "312244566", firstName: "אבי", lastName: "רז", 
            sector: "מנהלה", department: "אגף שפ\"ע / חשמלאי", status: "עובדים",
            phone: "054-1112233", years: 12, avatarText: "אר", avatarColor: "bg-emerald-50 text-emerald-600 border-emerald-100", 
            tags: [] 
        }
    ];

    // State
    let workers = [];

    // Elements
    const tbody = document.getElementById('workers-tbody');
    const searchInput = document.getElementById('search-input');
    const sectorFilter = document.getElementById('sector-filter');
    const totalCount = document.getElementById('total-workers-count');
    const emptyState = document.getElementById('empty-state');
    
    const modal = document.getElementById('employee-modal');
    const form = document.getElementById('new-employee-form');
    const idError = document.getElementById('id-error');
    const idInput = document.getElementById('emp-id');

    function init() {
        // Load from localStorage or seed
        const stored = localStorage.getItem('committee_workers');
        if (stored) {
            workers = JSON.parse(stored);
        } else {
            workers = [...seedWorkers];
            saveWorkers();
        }
        
        renderWorkers();
        setupListeners();
    }

    function saveWorkers() {
        localStorage.setItem('committee_workers', JSON.stringify(workers));
    }

    function normalizeId(id) {
        return id.replace(/\D/g, '').padStart(9, '0');
    }

    function generateAvatarColor(str) {
        const colors = [
            'bg-blue-50 text-blue-600 border-blue-100',
            'bg-purple-50 text-purple-600 border-purple-100',
            'bg-orange-50 text-orange-600 border-orange-100',
            'bg-teal-50 text-teal-600 border-teal-100',
            'bg-amber-50 text-amber-600 border-amber-100'
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }

    function getTagStyles(tag) {
        if(tag.includes("פנסיה")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
        if(tag.includes("וינה") || tag.includes("נופש")) return "bg-purple-100 text-purple-700 border-purple-200";
        if(tag.includes("מילואים")) return "bg-green-100 text-green-700 border-green-200";
        if(tag.includes("עולה ל")) return "bg-blue-50 text-blue-600 border-blue-200";
        if(tag.includes("קליטה")) return "bg-orange-100 text-orange-700 border-orange-200";
        return "bg-gray-100 text-gray-700 border-gray-200";
    }

    function renderWorkers() {
        const searchTerm = searchInput.value.toLowerCase();
        const sectorTerm = sectorFilter.value;

        // Filter
        let filtered = workers.filter(w => {
            const matchesSearch = w.id.includes(searchTerm) || 
                                  w.firstName.includes(searchTerm) || 
                                  w.lastName.includes(searchTerm) || 
                                  w.phone.includes(searchTerm);
            
            const matchesSector = sectorTerm === 'all' || w.sector === sectorTerm;
            
            return matchesSearch && matchesSector;
        });

        // Sort: newest first or by name (for simplicity, we'll just reverse so new ones are on top)
        filtered = filtered.reverse();

        totalCount.textContent = workers.length.toLocaleString();

        if (filtered.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
            return;
        }

        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        
        tbody.innerHTML = filtered.map(w => {
            // Avatar logic
            let avatarHtml = '';
            if (w.avatar) {
                avatarHtml = `<div class="w-12 h-12 rounded-full border-2 border-gray-100 overflow-hidden shrink-0 shadow-sm group-hover:border-indigo-300 transition"><img src="${w.avatar}" alt=""></div>`;
            } else {
                const initials = (w.firstName[0] || '') + (w.lastName[0] || '');
                const colorClass = w.avatarColor || generateAvatarColor(w.id);
                avatarHtml = `<div class="w-12 h-12 rounded-full ${colorClass} flex justify-center items-center font-black text-xl border-2 shrink-0 shadow-sm group-hover:border-indigo-300 transition">${initials}</div>`;
            }

            // Tags logic
            let tagsHtml = '';
            if (w.tags && w.tags.length > 0) {
                tagsHtml = `<div class="flex flex-wrap gap-2">` + 
                    w.tags.map(t => `<span class="${getTagStyles(t)} border text-xs px-2 py-1 rounded-md font-bold shadow-sm">${t}</span>`).join('') + 
                `</div>`;
            } else {
                tagsHtml = `<span class="text-gray-400 text-sm font-medium">ללא תגיות מיוחדות</span>`;
            }

            // Department formatting
            const deptText = w.department || 'טרם שובץ למחלקה';
            const sectorBadge = w.sector ? `<p class="text-xs bg-gray-200 text-gray-700 inline-block px-2 py-0.5 rounded mt-1 font-bold">${w.sector}</p>` : '';

            return `
                <tr class="hover:bg-indigo-50/40 transition group cursor-pointer" onclick="openProfile('${w.id}')">
                    <td class="py-4 px-6 font-medium">
                        <div class="flex items-center gap-3">
                            ${avatarHtml}
                            <div>
                                <p class="font-extrabold text-gray-900 text-base group-hover:text-indigo-600 transition">${w.firstName} ${w.lastName}</p>
                                <p class="text-xs text-gray-400 font-mono tracking-widest">${Number(w.id)}</p>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-6">
                        <p class="font-bold text-gray-800 text-base">${deptText}</p>
                        ${sectorBadge}
                    </td>
                    <td class="py-4 px-6">
                        ${tagsHtml}
                    </td>
                    <td class="py-4 px-6 font-black text-gray-500 text-lg">
                        ${w.years !== undefined ? `${w.years} <span class="text-sm font-bold opacity-70">שנים</span>` : '<span class="text-sm font-medium text-gray-400">חדש</span>'}
                    </td>
                    <td class="py-4 px-6 text-center">
                        <button onclick="event.stopPropagation(); openProfile('${w.id}');" class="bg-white border-2 border-indigo-100 hover:bg-indigo-50 text-indigo-700 px-5 py-2 font-bold rounded-xl text-sm transition shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">פתח כרטסת בחלון</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function setupListeners() {
        // Search button triggers renderWorkers manually now.

        // ID validation on blur to remove error
        idInput.addEventListener('input', () => {
            idInput.classList.remove('border-red-500', 'focus:border-red-500');
            idError.classList.add('hidden');
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const rawId = idInput.value;
            const normId = normalizeId(rawId);

            // Duplicate Check
            if (workers.some(w => normalizeId(w.id) === normId)) {
                idInput.classList.add('border-red-500', 'focus:border-red-500');
                idError.classList.remove('hidden');
                return; // Stop submission
            }

            const newWorker = {
                id: normId,
                firstName: document.getElementById('emp-first').value.trim(),
                lastName: document.getElementById('emp-last').value.trim(),
                phone: document.getElementById('emp-phone').value.trim(),
                sector: document.getElementById('emp-sector').value,
                status: document.getElementById('emp-status').value,
                department: "", // to be filled in profile
                tags: ["עובד חדש בקליטה"],
                years: 0
            };

            workers.push(newWorker);
            saveWorkers();
            closeNewEmployeeModal();
            renderWorkers();
            
            // Optionally, we could immediately navigate to their profile:
            // openProfile(normId);
        });
    }

    // Modal logic
    window.openNewEmployeeModal = function() {
        form.reset();
        idInput.classList.remove('border-red-500', 'focus:border-red-500');
        idError.classList.add('hidden');
        modal.classList.remove('hidden');
        setTimeout(() => idInput.focus(), 100);
    }

    window.closeNewEmployeeModal = function() {
        modal.classList.add('hidden');
    }

    // Navigation logic
    window.openProfile = function(id) {
        const url = `worker-profile-demo.html?id=${id}`;
        if (window.parent && window.parent.loadPage) {
            window.parent.loadPage(url, null);
        } else {
            window.location.href = url;
        }
    }

    // --- EXCEL IMPORT LOGIC ---
    let excelData = [];
    let excelHeaders = [];
    
    window.handleExcelUpload = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                if (typeof XLSX === 'undefined') {
                    throw new Error("ספריית האקסל לא נטענה. אנא בדוק חיבור לאינטרנט או נסה לרענן.");
                }
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON
                excelData = XLSX.utils.sheet_to_json(worksheet, {defval: ""});
                
                if (excelData.length === 0) {
                    alert("הקובץ ריק או לא תקין.");
                    return;
                }
                
                // Get headers from first row
                excelHeaders = Object.keys(excelData[0]);
                
                buildMappingUI();
                document.getElementById('excel-mapping-modal').classList.remove('hidden');
                document.getElementById('import-row-count').textContent = excelData.length + ' שורות';
                
                // Reset input so same file can be selected again if needed
                document.getElementById('excel-upload').value = '';
            } catch (err) {
                console.error(err);
                alert("שגיאה בפענוח הקובץ: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    window.closeMappingModal = function() {
        document.getElementById('excel-mapping-modal').classList.add('hidden');
        excelData = [];
        excelHeaders = [];
    };

    const systemFields = [
        { key: 'id', label: 'תעודת זהות (שדה חובה)', req: true },
        { key: 'firstName', label: 'שם פרטי' },
        { key: 'lastName', label: 'שם משפחה' },
        { key: 'department', label: 'תפקיד / מחלקה' },
        { key: 'startDate', label: 'תאריך תחילת עבודה' },
        { key: 'fte', label: 'אחוז משרה' },
        { key: 'phone', label: 'סלולרי' },
        { key: 'email', label: 'דואר אלקטרוני' },
        { key: 'city', label: 'עיר מגורים' }
    ];

    function buildMappingUI() {
        const container = document.getElementById('mapping-container');
        
        let html = '';
        systemFields.forEach(f => {
            // Try to auto guess
            let bestMatch = '';
            const testLabel = f.label.replace(' (שדה חובה)', '');
            excelHeaders.forEach(h => {
                if (h.includes(testLabel) || testLabel.includes(h) || 
                   (f.key === 'id' && (h.includes('ת.ז') || h.includes('זהות'))) ||
                   (f.key === 'phone' && (h.includes('נייד') || h.includes('טלפון')))) {
                    bestMatch = h;
                }
            });

            const options = excelHeaders.map(h => `<option value="${h}" ${h === bestMatch ? 'selected' : ''}>${h}</option>`).join('');
            
            html += `
                <div class="grid grid-cols-2 gap-4 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div class="font-bold text-gray-800 flex items-center gap-2">
                        ${f.label} ${f.req ? '<span class="text-red-500">*</span>' : ''}
                    </div>
                    <div>
                        <select id="map-${f.key}" class="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-bold text-indigo-700 transition">
                            <option value="">-- אל תייבא שדה זה --</option>
                            ${options}
                        </select>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    window.executeExcelImport = function() {
        const idCol = document.getElementById('map-id').value;
        if (!idCol) {
            alert("חובה למפות עמודה עבור 'תעודת זהות'.");
            return;
        }

        let newCount = 0;
        let updateCount = 0;
        let errorCount = 0;

        excelData.forEach(row => {
            const rawId = row[idCol];
            if (!rawId) {
                errorCount++;
                return;
            }

            const normId = normalizeId(String(rawId));
            
            // Find existing worker
            let worker = workers.find(w => normalizeId(w.id) === normId);
            let isNew = false;
            
            if (!worker) {
                isNew = true;
                worker = { id: normId, tags: ["יובא מאקסל"], years: 0 };
            }

            // Map fields safely
            systemFields.forEach(f => {
                if (f.key === 'id') return; // already handled
                
                const colName = document.getElementById(`map-${f.key}`).value;
                if (colName && row[colName] !== undefined && row[colName] !== null && String(row[colName]).trim() !== '') {
                    // We only write if the excel has a real value
                    if (f.key === 'city') {
                        if (!worker.address) worker.address = {};
                        worker.address.city = String(row[colName]).trim();
                    } else {
                        worker[f.key] = String(row[colName]).trim();
                    }
                }
            });

            if (isNew) {
                workers.push(worker);
                newCount++;
            } else {
                updateCount++;
            }
        });

        saveWorkers();
        renderWorkers();
        closeMappingModal();
        
        alert(`הקליטה הסתיימה בהצלחה!\nנוספו: ${newCount} עובדים חדשים.\nעודכנו: ${updateCount} עובדים קיימים.\nשורות שהתעלמנו (ללא ת.ז): ${errorCount}`);
    };

    // Run
    init();

