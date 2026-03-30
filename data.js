// 일비롱디자인 애플리케이션 초기 데이터 구조 (초기화 빌드용)
// 이 파일은 브라우저의 localStorage가 비어있을 때 사용됩니다.
const INITIAL_PRODUCT_DATA = [
    {
        id: "cat1",
        name: "현수막 (포토존/가로형)",
        requiresShipping: true,
        customConfig: {
            enabled: true,
            baseCost: 8000,     // 1헤베(10,000㎠)당 기본 원가
            marginRate: 0,      // 마진율 (%)
            minPrice: 5000      // 최소 주문 금액
        },
        options: [
            { id: "c1_1", name: "300cm x 70cm", price: 30000 },
            { id: "c1_2", name: "400cm x 70cm", price: 37000 },
            { id: "c1_3", name: "500cm x 90cm", price: 45000 },
            { id: "c1_4", name: "포토존 180cm x 150cm", price: 32000 },
            { id: "c1_5", name: "포토존 200cm x 180cm", price: 38000 },
            { id: "c1_6", name: "포토존 240cm x 180cm", price: 45000 },
            { id: "c1_7", name: "포토존 300cm x 200cm", price: 80000 }
            // 비규격 직접입력은 이제 이 배열에 들어있지 않고 동적으로 삽입됩니다.
        ]
    },
    {
        id: "cat2",
        name: "패트 배너",
        requiresShipping: true,
        customConfig: {
            enabled: false,
            baseCost: 10000,
            marginRate: 20,
            minPrice: 5000
        },
        options: [
            { id: "c2_1", name: "일반 UV 패트 배너", price: 28000 },
            { id: "c2_2", name: "졸업/수료 미니 UV 패트 배너 (캔바 셀프작업형)", price: 12000 },
            { id: "c2_3", name: "졸업/수료 미니 UV 패트 배너 (일비롱 작업형)", price: 15000 }
        ]
    },
    {
        id: "cat3",
        name: "환경구성판 및 굿즈",
        requiresShipping: true,
        customConfig: {
            enabled: false,
            baseCost: 8000,
            marginRate: 0,
            minPrice: 5000
        },
        options: [
            { id: "c3_1", name: "캔버스천 생일판", price: 35000 },
            { id: "c3_2", name: "관찰/자석놀이 포맥스판", price: 35000 },
            { id: "c3_3", name: "날짜판", price: 33000 },
            { id: "c3_4", name: "투약함", price: 41000 },
            { id: "c3_5", name: "미세먼지 안내판", price: 39000 },
            { id: "c3_6", name: "차량용 자석 스티커", price: 28000 },
            { id: "c3_7", name: "포맥스 명찰 (원형/사각형)", price: 3500 },
            { id: "c3_8", name: "삼각대 이름표", price: 2500 },
            { id: "c3_9", name: "대봉투 제작", price: 130000 },
            { id: "c3_10", name: "소봉투 제작", price: 70000 }
        ]
    },
    {
        id: "cat4",
        name: "디지털 도안",
        requiresShipping: false,
        customConfig: {
            enabled: false,
            baseCost: 0,
            marginRate: 0,
            minPrice: 0
        },
        options: [
            { id: "c4_1", name: "식목일 토퍼 도안 등 유료 디지털 도안", price: 2500 }
        ]
    }
];

// 데이터 매니저 (LocalStorage 제어)
const DataManager = {
    getKey: () => 'ilbirong_products_v2', // v2 데이터 키
    
    // 현재 데이터 로드 (없으면 기본값 반환 후 저장)
    loadData: function() {
        const stored = localStorage.getItem(this.getKey());
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("데이터 파싱 오류", e);
                return this.resetData();
            }
        }
        return this.resetData();
    },

    // 데이터 저장
    saveData: function(dataArray) {
        localStorage.setItem(this.getKey(), JSON.stringify(dataArray));
    },

    // 초기화 및 복구
    resetData: function() {
        const copy = JSON.parse(JSON.stringify(INITIAL_PRODUCT_DATA));
        this.saveData(copy);
        return copy;
    }
};

// 전역 변수로 노출하여 앱에서 사용
window.PRODUCT_DATA = DataManager.loadData();
