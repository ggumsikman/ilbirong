// 일비롱디자인 애플리케이션 초기 데이터 구조 (초기화 빌드용)
// 이 파일은 브라우저의 localStorage가 비어있을 때 사용됩니다.
const INITIAL_PRODUCT_DATA = [
    {
        id: "cat1",
        name: "현수막 (포토존/가로형)",
        requiresShipping: true,
        customConfig: {
            enabled: true,
            // 공급사 실측 원가 공식: 원가 = areaCoeff×W×H + widthCoeff×W + baseFee (W,H 단위: cm)
            formula: {
                areaCoeff: 0.72,   // 원/cm² (범위 밖 외삽용)
                widthCoeff: -4,    // 원/cm  (범위 밖 외삽용)
                baseFee: 2000,     // 기본제작비 (원) — 항상 고정
                widthStep: 50,     // 가로폭을 50cm 단위로 올림 계산 (공급사 롤 규격)
                minWidth: 100,     // 최소 유효 가로폭 (공급사 최소 과금 단위)
                // 높이별 소재비율 (eff_W 1cm당 소재비) — primead.kr 실측 전수 검증
                heightRates: [
                    { h: 30,  rate: 33  },
                    { h: 40,  rate: 34  },
                    { h: 50,  rate: 35  },
                    { h: 60,  rate: 38  },
                    { h: 70,  rate: 40  },
                    { h: 80,  rate: 42  },
                    { h: 90,  rate: 44  },
                    { h: 100, rate: 68  },
                    { h: 110, rate: 70  },
                    { h: 120, rate: 73  },
                    { h: 130, rate: 76  },
                    { h: 140, rate: 78  },
                    { h: 150, rate: 90  },
                    { h: 160, rate: 92  },
                    { h: 170, rate: 94  },
                    { h: 180, rate: 94  },
                    { h: 190, rate: 136 },
                    { h: 200, rate: 140 }
                ]
            },
            marginRate: 55,     // 마진율 (%)
            minPrice: 5000,     // 최소 주문 금액
            finishingOptions: [
                { id: "none",          label: "후가공 선택 (기본)",            price: 0 },
                { id: "heat_cut",      label: "열재단",                        price: 0 },
                { id: "eyelet_4",      label: "아일렛타공 (사방4개)",           price: 2000 },
                { id: "eyelet_8",      label: "아일렛타공 (8개)",               price: 4000 },
                { id: "eyelet4_cube4", label: "아일렛타공4개 + 큐방4개",        price: 4000 },
                { id: "eyelet8_cube8", label: "아일렛타공8개 + 큐방8개",        price: 8000 },
                { id: "rope_loop",     label: "끈고리가공 (로프포함)",           price: 4000 },
                { id: "rope_3m",       label: "로프 (3m)",                     price: 1000 }
            ]
        },
        options: [
            // 가로형
            { id: "c1_1",  name: "[가로형] 300cm × 70cm",  price: 30000 },
            { id: "c1_2",  name: "[가로형] 400cm × 70cm",  price: 37000 },
            { id: "c1_3",  name: "[가로형] 500cm × 90cm",  price: 45000 },
            { id: "c1_4",  name: "[가로형] 600cm × 90cm",  price: 55000 },
            { id: "c1_5",  name: "[가로형] 700cm × 90cm",  price: 65000 },
            { id: "c1_6",  name: "[가로형] 800cm × 90cm",  price: 75000 },
            { id: "c1_7",  name: "[가로형] 1000cm × 90cm", price: 95000 },
            { id: "c1_8",  name: "[가로형] 1000cm × 100cm",price: 102000 },
            // 포토존형
            { id: "c1_9",  name: "[포토존] 180cm × 150cm", price: 32000 },
            { id: "c1_10", name: "[포토존] 200cm × 180cm", price: 38000 },
            { id: "c1_11", name: "[포토존] 240cm × 180cm", price: 45000 },
            { id: "c1_12", name: "[포토존] 300cm × 180cm", price: 55000 },
            // 대형포토존 (세로 180cm 이상 — 현수막 2장 이음 제작)
            { id: "c1_13", name: "[대형포토존] 300cm × 200cm", price: 80000 },
            { id: "c1_14", name: "[대형포토존] 300cm × 230cm", price: 85000 }
            // 비규격 직접입력은 이 배열에 없고 동적으로 삽입됩니다.
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
    getKey: () => 'ilbirong_products_v5', // v5: 전체 높이 실측 데이터 + 최소폭 100cm 적용
    
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
window.DataManager = DataManager;
window.PRODUCT_DATA = DataManager.loadData();
