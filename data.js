// 일비롱디자인 상품 단가 데이터
const PRODUCT_DATA = [
    {
        id: "cat1",
        name: "현수막 (포토존/가로형)",
        requiresShipping: true,
        options: [
            { id: "c1_1", name: "300cm x 70cm", price: 30000 },
            { id: "c1_2", name: "400cm x 70cm", price: 37000 },
            { id: "c1_3", name: "500cm x 90cm", price: 45000 },
            { id: "c1_4", name: "포토존 180cm x 150cm", price: 32000 },
            { id: "c1_5", name: "포토존 200cm x 180cm", price: 38000 },
            { id: "c1_6", name: "포토존 240cm x 180cm", price: 45000 },
            { id: "c1_7", name: "포토존 300cm x 200cm", price: 80000 },
            { id: "c1_8", name: "비규격(직접입력)", price: 0, isDynamicCustom: true }
        ]
    },
    {
        id: "cat2",
        name: "패트 배너",
        requiresShipping: true,
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
        options: [
            { id: "c4_1", name: "식목일 토퍼 도안 등 유료 디지털 도안", price: 2500 }
        ]
    }
];
