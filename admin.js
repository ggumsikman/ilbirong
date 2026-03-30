document.addEventListener('DOMContentLoaded', () => {
    let clickCount = 0;
    let clickTimer = null;
    let isAdminActive = false;

    // === DOM ===
    const adminTrigger = document.getElementById('adminTrigger');
    const adminIndicator = document.getElementById('adminIndicator');
    const adminModal = document.getElementById('adminModal');
    const btnOpenAdminPanel = document.getElementById('btnOpenAdminPanel');
    const btnExitAdmin = document.getElementById('btnExitAdmin');
    const btnCloseAdmin = document.getElementById('btnCloseAdmin');
    const btnAdminReset = document.getElementById('btnAdminReset');
    const btnAdminSave = document.getElementById('btnAdminSave');
    const adminCategoryList = document.getElementById('adminCategoryList');
    
    // === 히든 트리거 로직 ===
    adminTrigger.addEventListener('click', () => {
        clickCount++;
        clearTimeout(clickTimer);
        
        if (clickCount >= 5) {
            clickCount = 0;
            if (!isAdminActive) {
                const pwd = prompt("관리자 비밀번호를 입력하세요:");
                // app.js의 CONFIG에서 비밀번호 확인 (전역 변수 활용)
                if (pwd === (window.APP_CONFIG ? window.APP_CONFIG.ADMIN_PASSWORD : "1234")) {
                    enableAdminMode();
                } else if (pwd !== null) {
                    alert("비밀번호가 틀렸습니다.");
                }
            }
        } else {
            clickTimer = setTimeout(() => { clickCount = 0; }, 2000); // 2초 내 5번
        }
    });

    function enableAdminMode() {
        isAdminActive = true;
        adminIndicator.style.display = 'flex';
    }

    function disableAdminMode() {
        isAdminActive = false;
        adminIndicator.style.display = 'none';
        adminModal.style.display = 'none';
    }

    // === 패널 열기/닫기 ===
    btnExitAdmin.addEventListener('click', disableAdminMode);
    btnOpenAdminPanel.addEventListener('click', () => {
        adminModal.style.display = 'flex';
        renderAdminPanel();
    });
    btnCloseAdmin.addEventListener('click', () => {
        adminModal.style.display = 'none';
    });
    adminModal.querySelector('.admin-modal-overlay').addEventListener('click', () => {
        adminModal.style.display = 'none';
    });

    // === 관리자 패널 렌더링 ===
    // 패널 렌더링 시 사용할 임시 데이터 복사본
    let draftData = [];

    function renderAdminPanel() {
        draftData = JSON.parse(JSON.stringify(window.PRODUCT_DATA));
        drawCategoryList();
    }

    function drawCategoryList() {
        adminCategoryList.innerHTML = '';

        draftData.forEach((cat, catIndex) => {
            const card = document.createElement('div');
            card.className = 'admin-card';
            
            // 1. 카테고리 헤더
            card.innerHTML = `
                <div class="admin-card-title">
                    <input type="text" class="admin-input" value="${cat.name}" data-cat-idx="${catIndex}" data-field="name" style="font-weight:bold;">
                    <button class="btn-icon btn-del-cat" data-cat-idx="${catIndex}" title="카테고리 삭제">🗑</button>
                </div>
                <div class="admin-row">
                    <label>배송비:</label>
                    <input type="checkbox" ${cat.requiresShipping ? 'checked' : ''} data-cat-idx="${catIndex}" data-field="requiresShipping"> 기본 배송비 부과 적용
                </div>
            `;

            // 2. 비규격 설정
            const cnf = cat.customConfig || { enabled: false, baseCost: 8000, marginRate: 0, minPrice: 5000 };
            const customBox = document.createElement('div');
            customBox.className = 'admin-custom-box';
            customBox.innerHTML = `
                <div style="font-weight:bold; margin-bottom: 8px;">📏 비규격(직접입력) 설정 자동화</div>
                <div class="admin-row">
                    <label>사용여부:</label>
                    <input type="checkbox" ${cnf.enabled ? 'checked' : ''} data-cat-idx="${catIndex}" data-field="custom.enabled"> 허용함
                </div>
                <div class="admin-row">
                    <label>원가:</label>
                    <input type="number" class="admin-input" value="${cnf.baseCost}" data-cat-idx="${catIndex}" data-field="custom.baseCost"> 원(1㎡당)
                </div>
                <div class="admin-row">
                    <label>마진율:</label>
                    <input type="number" class="admin-input" value="${cnf.marginRate}" data-cat-idx="${catIndex}" data-field="custom.marginRate"> %
                </div>
            `;
            card.appendChild(customBox);

            // 3. 상품 목록
            const itemList = document.createElement('div');
            itemList.className = 'admin-item-list';
            cat.options.forEach((opt, optIndex) => {
                const itemRow = document.createElement('div');
                itemRow.className = 'admin-item';
                itemRow.innerHTML = `
                    <input type="text" class="admin-input" value="${opt.name}" data-cat-idx="${catIndex}" data-opt-idx="${optIndex}" data-field="opt.name" style="flex:2;" placeholder="상품명">
                    <input type="number" class="admin-input" value="${opt.price}" data-cat-idx="${catIndex}" data-opt-idx="${optIndex}" data-field="opt.price" style="flex:1;" placeholder="가격">
                    <button class="btn-icon btn-del-opt" data-cat-idx="${catIndex}" data-opt-idx="${optIndex}" title="상품 삭제">❌</button>
                `;
                itemList.appendChild(itemRow);
            });

            // 상품 추가 버튼
            const btnAddOpt = document.createElement('button');
            btnAddOpt.className = 'btn-add';
            btnAddOpt.textContent = '+ 상품 항목 추가';
            btnAddOpt.onclick = () => {
                draftData[catIndex].options.push({ id: 'opt_' + Date.now(), name: '새 상품', price: 0 });
                drawCategoryList();
            };
            itemList.appendChild(btnAddOpt);

            card.appendChild(itemList);
            adminCategoryList.appendChild(card);
        });

        // 카테고리 추가 버튼
        const btnAddCat = document.createElement('button');
        btnAddCat.className = 'btn-add';
        btnAddCat.style.borderStyle = 'solid';
        btnAddCat.style.background = '#FFF0F2';
        btnAddCat.textContent = '🌟 새 카테고리 추가';
        btnAddCat.onclick = () => {
            draftData.push({
                id: 'cat_' + Date.now(),
                name: '새 카테고리',
                requiresShipping: true,
                customConfig: { enabled: false, baseCost: 8000, marginRate: 0, minPrice: 5000 },
                options: []
            });
            drawCategoryList();
        };
        adminCategoryList.appendChild(btnAddCat);

        // 이벤트 리스너 바인딩
        bindDraftEvents();
    }

    function bindDraftEvents() {
        const inputs = adminCategoryList.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const el = e.target;
                const cIdx = el.getAttribute('data-cat-idx');
                const oIdx = el.getAttribute('data-opt-idx');
                const field = el.getAttribute('data-field');

                if (field === 'name') draftData[cIdx].name = el.value;
                if (field === 'requiresShipping') draftData[cIdx].requiresShipping = el.checked;
                
                if (field.startsWith('custom.')) {
                    if (!draftData[cIdx].customConfig) draftData[cIdx].customConfig = {};
                    const key = field.split('.')[1];
                    if (key === 'enabled') draftData[cIdx].customConfig.enabled = el.checked;
                    else draftData[cIdx].customConfig[key] = parseFloat(el.value) || 0;
                }

                if (field === 'opt.name') draftData[cIdx].options[oIdx].name = el.value;
                if (field === 'opt.price') draftData[cIdx].options[oIdx].price = parseInt(el.value) || 0;
            });
        });

        // 삭제 버튼 이벤트
        adminCategoryList.querySelectorAll('.btn-del-cat').forEach(btn => {
            btn.onclick = (e) => {
                if(confirm("이 카테고리를 완전히 삭제할까요?")) {
                    const cIdx = e.target.getAttribute('data-cat-idx');
                    draftData.splice(cIdx, 1);
                    drawCategoryList();
                }
            };
        });

        adminCategoryList.querySelectorAll('.btn-del-opt').forEach(btn => {
            btn.onclick = (e) => {
                const cIdx = e.target.getAttribute('data-cat-idx');
                const oIdx = e.target.getAttribute('data-opt-idx');
                draftData[cIdx].options.splice(oIdx, 1);
                drawCategoryList();
            };
        });
    }

    // === 저장 로직 (저장 + 파일 다운로드 동시 진행) ===
    btnAdminSave.addEventListener('click', () => {
        // 1. 브라우저 localStorage에 안전하게 저장 (앱 즉시 반영용)
        window.PRODUCT_DATA = draftData;
        window.DataManager.saveData(draftData);
        adminModal.style.display = 'none';
        
        if (typeof window.reinitApp === 'function') {
            window.reinitApp();
        }

        // 2. data.js 파일 생성용 문자열 만들기
        const dataJson = JSON.stringify(draftData, null, 4);
        const fileContent = `// 일비롱디자인 애플리케이션 초기 데이터 구조 (초기화 빌드용)
// 이 파일은 브라우저의 localStorage가 비어있을 때 또는 GitHub 배포용으로 사용됩니다.
const INITIAL_PRODUCT_DATA = ${dataJson};

// 데이터 매니저 (LocalStorage 제어)
const DataManager = {
    getKey: () => 'ilbirong_products_v2', // v2 데이터 키
    
    loadData: function() {
        const stored = localStorage.getItem(this.getKey());
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { return this.resetData(); }
        }
        return this.resetData();
    },

    saveData: function(dataArray) {
        localStorage.setItem(this.getKey(), JSON.stringify(dataArray));
    },

    resetData: function() {
        const copy = JSON.parse(JSON.stringify(INITIAL_PRODUCT_DATA));
        this.saveData(copy);
        return copy;
    }
};

window.PRODUCT_DATA = DataManager.loadData();
`;

        // 3. 파일 다운로드 (브라우저 유도)
        const blob = new Blob([fileContent], { type: "text/javascript;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "data.js";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // 4. 대표님 전용 맞춤 팝업 (가장 마지막에 띄움)
        alert("다운로드 폴더에서 꿈식맨에게 'data.js' 파일을 전달해 주세요");
    });

    // === 초기화 로직 ===
    btnAdminReset.addEventListener('click', () => {
        if (confirm("경고: 모든 데이터가 덮어씌워집니다. 공장 초기화하시겠습니까? (기존 맞춤 데이터 상실됨)")) {
            const copy = window.DataManager.resetData();
            window.PRODUCT_DATA = copy;
            alert("초기화 완료되었습니다.");
            adminModal.style.display = 'none';
            if (typeof window.reinitApp === 'function') window.reinitApp();
        }
    });
});
