// 전역 환경 설정 (앱 전체)
window.APP_CONFIG = {
    ADMIN_PASSWORD: "1234" // 히든 관리자 모드 비밀번호
};

document.addEventListener('DOMContentLoaded', () => {
    // === 상태 (State) ===
    let cart = [];
    let selectedCategoryId = "";
    let selectedOptionId = "";
    let isDynamicCustomSelected = false;
    let computedCustomPrice = 0;
    let quantity = 1;
    let finishingPrice = 0;
    let finishingLabel = '';

    // === DOM 요소 참조 ===
    const els = {
        categorySelect: document.getElementById('categorySelect'),
        productSelect: document.getElementById('productSelect'),
        customSizeGroup: document.getElementById('customSizeGroup'),
        customWidth: document.getElementById('customWidth'),
        customHeight: document.getElementById('customHeight'),
        customDynamicPrice: document.getElementById('customDynamicPrice'),
        quantityWrapper: document.getElementById('quantityWrapper'),
        quantityInput: document.getElementById('quantityInput'),
        btnMinus: document.getElementById('btnMinus'),
        btnPlus: document.getElementById('btnPlus'),
        btnAddCart: document.getElementById('btnAddCart'),
        
        cartList: document.getElementById('cartList'),
        
        itemsTotal: document.getElementById('itemsTotal'),
        shippingFee: document.getElementById('shippingFee'),
        grandTotal: document.getElementById('grandTotal'),
        
        btnCopyEstimate: document.getElementById('btnCopyEstimate'),
        toast: document.getElementById('toast'),

        priceBreakdown: document.getElementById('priceBreakdown'),
        priceSimplePlaceholder: document.getElementById('priceSimplePlaceholder'),
        rawCostDisplay: document.getElementById('rawCostDisplay'),
        marginRateDisplay: document.getElementById('marginRateDisplay'),
        marginDisplay: document.getElementById('marginDisplay'),
        finishingSelect: document.getElementById('finishingSelect'),
        finishingGroup: document.getElementById('finishingGroup'),
        finishingBreakdownRow: document.getElementById('finishingBreakdownRow'),
        finishingLabelDisplay: document.getElementById('finishingLabelDisplay'),
        finishingPriceDisplay: document.getElementById('finishingPriceDisplay'),
    };

    // === 초기화 로직 ===
    window.reinitApp = function() {
        // 관리자가 데이터 수정 후 폼 재로드 시 호출
        selectedCategoryId = "";
        selectedOptionId = "";
        quantity = 1;
        isDynamicCustomSelected = false;
        finishingPrice = 0;
        finishingLabel = '';
        els.customSizeGroup.style.display = 'none';
        els.finishingGroup.style.display = 'none';

        els.categorySelect.innerHTML = '<option value="">카테고리를 선택해주세요</option>';
        els.productSelect.innerHTML = '<option value="">먼저 카테고리를 선택해주세요</option>';
        els.productSelect.disabled = true;
        
        window.PRODUCT_DATA.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            els.categorySelect.appendChild(option);
        });

        // 장바구니에 담긴 상품 중 삭제된 게 있을 수 있으나 단순성을 위해 놔둠 (실제 서비스 시 비우는 편이 안전)
        // cart = []; 
        renderCart();
        updateAddButtonState();
    };

    function init() {
        window.reinitApp();

        // 2. 이벤트 리스너 등록
        els.categorySelect.addEventListener('change', handleCategoryChange);
        els.productSelect.addEventListener('change', handleProductChange);
        els.customWidth.addEventListener('input', calculateDynamicPrice);
        els.customHeight.addEventListener('input', calculateDynamicPrice);
        els.btnMinus.addEventListener('click', () => updateQuantity(-1));
        els.btnPlus.addEventListener('click', () => updateQuantity(1));
        els.btnAddCart.addEventListener('click', addToCart);
        els.btnCopyEstimate.addEventListener('click', copyEstimate);
        els.finishingSelect.addEventListener('change', handleFinishingChange);
    }

    // === 높이별 소재비율 보간 함수 ===
    // heightRates 데이터포인트 사이는 선형 보간, 범위 밖은 공식 계산
    function interpolateRatePerWidth(H, formula) {
        const rates = formula.heightRates;
        if (!rates || rates.length < 2) {
            return formula.areaCoeff * H + formula.widthCoeff;
        }

        const sorted = [...rates].sort((a, b) => a.h - b.h);

        // 첫 데이터포인트 미만: 최솟값 rate 사용 (외삽 시 음수 방지, 공급사 최소 소재비 보장)
        if (H < sorted[0].h) {
            return sorted[0].rate;
        }
        // 마지막 데이터포인트 초과: 공식으로 외삽
        if (H > sorted[sorted.length - 1].h) {
            return formula.areaCoeff * H + formula.widthCoeff;
        }
        // 사이 구간: 선형 보간
        for (let i = 0; i < sorted.length - 1; i++) {
            if (H >= sorted[i].h && H <= sorted[i + 1].h) {
                const t = (H - sorted[i].h) / (sorted[i + 1].h - sorted[i].h);
                return sorted[i].rate + t * (sorted[i + 1].rate - sorted[i].rate);
            }
        }
        return formula.areaCoeff * H + formula.widthCoeff;
    }

    // === 이벤트 핸들러 ===
    function handleFinishingChange() {
        const opt = els.finishingSelect.options[els.finishingSelect.selectedIndex];
        finishingPrice = parseInt(opt.dataset.price) || 0;
        finishingLabel = opt.dataset.label || opt.textContent;
        calculateDynamicPrice();
    }

    function populateFinishingOptions() {
        const category = window.PRODUCT_DATA.find(c => c.id === selectedCategoryId);
        els.finishingSelect.innerHTML = '';
        finishingPrice = 0;
        finishingLabel = '';

        if (category && category.customConfig && category.customConfig.finishingOptions) {
            category.customConfig.finishingOptions.forEach(opt => {
                const el = document.createElement('option');
                el.value = opt.id;
                el.dataset.price = opt.price;
                el.dataset.label = opt.label;
                el.textContent = opt.price > 0
                    ? `${opt.label} (+${opt.price.toLocaleString()}원)`
                    : opt.label;
                els.finishingSelect.appendChild(el);
            });
            els.finishingGroup.style.display = 'block';
        } else {
            els.finishingGroup.style.display = 'none';
        }
    }

    function handleCategoryChange(e) {
        selectedCategoryId = e.target.value;
        selectedOptionId = "";
        quantity = 1;
        isDynamicCustomSelected = false;
        finishingPrice = 0;
        finishingLabel = '';

        els.productSelect.innerHTML = '<option value="">상세 상품 및 크기를 선택해주세요</option>';
        els.quantityInput.value = quantity;
        els.customSizeGroup.style.display = 'none';
        els.finishingGroup.style.display = 'none';
        updateAddButtonState();

        if (selectedCategoryId) {
            const category = window.PRODUCT_DATA.find(c => c.id === selectedCategoryId);
            
            // 일반 상품들 렌더링
            category.options.forEach(opt => {
                const optEl = document.createElement('option');
                optEl.value = opt.id;
                optEl.textContent = `${opt.name} (${opt.price.toLocaleString()}원)`;
                els.productSelect.appendChild(optEl);
            });

            // 비규격 옵션 자동 주입 (enabled=true 일 때만)
            if (category.customConfig && category.customConfig.enabled) {
                const optEl = document.createElement('option');
                optEl.value = "dynamic_custom_id";
                optEl.textContent = "비규격(직접입력)";
                els.productSelect.appendChild(optEl);
            }

            els.productSelect.disabled = false;
        } else {
            els.productSelect.disabled = true;
            els.productSelect.innerHTML = '<option value="">먼저 카테고리를 선택해주세요</option>';
        }
    }

    function handleProductChange(e) {
        selectedOptionId = e.target.value;
        quantity = 1;
        els.quantityInput.value = quantity;
        
        isDynamicCustomSelected = (selectedOptionId === "dynamic_custom_id");
        finishingPrice = 0;
        finishingLabel = '';

        if (isDynamicCustomSelected) {
            els.customSizeGroup.style.display = 'block';
            populateFinishingOptions();
            calculateDynamicPrice();
        } else {
            els.customSizeGroup.style.display = 'none';
            els.finishingGroup.style.display = 'none';
        }

        updateAddButtonState();
    }

    function calculateDynamicPrice() {
        if (!isDynamicCustomSelected) return;

        const category = window.PRODUCT_DATA.find(c => c.id === selectedCategoryId);
        if (!category || !category.customConfig) return;

        const cnf = category.customConfig;
        const width = parseFloat(els.customWidth.value) || 0;
        const height = parseFloat(els.customHeight.value) || 0;

        if (width > 0 && height > 0) {
            // 공급사 실측 원가 공식 적용
            let rawCost;
            const S = Math.min(width, height);  // 짧은 변 (스코프를 블록 밖으로)
            const L = Math.max(width, height);  // 긴 변
            if (cnf.formula) {
                // 공급사 실측 공식: rate(짧은변) × ceil(긴변/50)×50
                const step = cnf.formula.widthStep || 50;
                const minL = cnf.formula.minWidth || 100;
                const effectiveLong = Math.max(Math.ceil(L / step) * step, minL);
                const ratePerLong = interpolateRatePerWidth(S, cnf.formula);
                rawCost = ratePerLong * effectiveLong + cnf.formula.baseFee;
            } else {
                // 레거시: 헤베당 단가 방식
                const areaSqm = (width * height) / 10000;
                rawCost = areaSqm * (cnf.baseCost || 8000);
            }
            rawCost = Math.max(rawCost, 0);

            // 공급사 소형 자동 재단비: 짧은 변이 테이블 최솟값(30cm) 미만이면 1,400원 가산
            if (cnf.formula && cnf.formula.heightRates && cnf.formula.heightRates.length > 0) {
                const minTableH = Math.min(...cnf.formula.heightRates.map(r => r.h));
                if (S < minTableH) {
                    rawCost += 1400;
                }
            }

            const marginRate = cnf.marginRate || 0;
            let finalPrice = rawCost * (1 + marginRate / 100);

            // 최소 주문 금액 보호
            computedCustomPrice = Math.max(finalPrice, cnf.minPrice || 0);

            // 100원 단위 반올림
            computedCustomPrice = Math.round(computedCustomPrice / 100) * 100;

            // 가격 분해 표시
            const marginAmt = computedCustomPrice - Math.round(rawCost / 100) * 100;
            els.rawCostDisplay.textContent = Math.round(rawCost).toLocaleString() + '원';
            els.marginRateDisplay.textContent = marginRate;
            els.marginDisplay.textContent = '+' + Math.max(marginAmt, 0).toLocaleString() + '원';

            if (finishingPrice > 0) {
                els.finishingBreakdownRow.style.display = 'flex';
                els.finishingLabelDisplay.textContent = finishingLabel;
                els.finishingPriceDisplay.textContent = '+' + finishingPrice.toLocaleString() + '원';
            } else {
                els.finishingBreakdownRow.style.display = 'none';
            }

            els.priceBreakdown.style.display = 'block';
            els.priceSimplePlaceholder.style.display = 'none';
        } else {
            computedCustomPrice = 0;
            els.priceBreakdown.style.display = 'none';
            els.finishingBreakdownRow.style.display = 'none';
            els.priceSimplePlaceholder.style.display = 'block';
        }

        const totalDisplayPrice = computedCustomPrice + finishingPrice;
        els.customDynamicPrice.textContent = `${totalDisplayPrice.toLocaleString()}원`;
        updateAddButtonState();
    }

    function updateQuantity(delta) {
        const newValue = quantity + delta;
        if (newValue >= 1) {
            quantity = newValue;
            els.quantityInput.value = quantity;
        }
    }

    function updateAddButtonState() {
        let canAdd = selectedCategoryId !== "" && selectedOptionId !== "";
        
        if (isDynamicCustomSelected) {
            canAdd = canAdd && computedCustomPrice > 0;
        }

        els.btnAddCart.disabled = !canAdd;
        
        if (canAdd) {
            els.quantityWrapper.style.opacity = '1';
            els.quantityWrapper.style.pointerEvents = 'auto';
        } else {
            els.quantityWrapper.style.opacity = '0.5';
            els.quantityWrapper.style.pointerEvents = 'none';
        }
    }

    // === 장바구니 로직 ===
    function addToCart() {
        const category = window.PRODUCT_DATA.find(c => c.id === selectedCategoryId);
        if (!category) return;

        let finalOptionName = "";
        let finalPrice = 0;

        if (isDynamicCustomSelected) {
            const w = els.customWidth.value;
            const h = els.customHeight.value;
            finalOptionName = `비규격(${w}x${h}cm)${finishingPrice > 0 ? ' / ' + finishingLabel : ''}`;
            finalPrice = computedCustomPrice + finishingPrice;
        } else {
            const option = category.options.find(o => o.id === selectedOptionId);
            if (!option) return;
            finalOptionName = option.name;
            finalPrice = option.price;
        }

        const cartItem = {
            cartItemId: Date.now().toString(),
            categoryName: category.name,
            requiresShipping: category.requiresShipping,
            optionName: finalOptionName,
            price: finalPrice,
            quantity: quantity,
            isCustom: isDynamicCustomSelected
        };

        cart.push(cartItem);
        renderCart();
        
        // 추가 후 폼 및 값 초기화
        els.categorySelect.value = "";
        handleCategoryChange({ target: { value: "" } });
        els.customWidth.value = "";
        els.customHeight.value = "";
        calculateDynamicPrice();
    }

    function removeFromCart(cartItemId) {
        cart = cart.filter(item => item.cartItemId !== cartItemId);
        renderCart();
    }

    // === 랜더링 및 계산 로직 ===
    function renderCart() {
        els.cartList.innerHTML = "";

        if (cart.length === 0) {
            els.cartList.className = "cart-list empty";
            els.cartList.innerHTML = `<li class="empty-msg">원하시는 상품을 담아주세요.</li>`;
            updateSummary();
            return;
        }

        els.cartList.className = "cart-list";
        cart.forEach(item => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            
            const subTotal = item.price * item.quantity;

            li.innerHTML = `
                <div class="cart-item-header">
                    <div>
                        <div class="item-cat">${item.categoryName}</div>
                        <div class="item-name">${item.optionName}</div>
                    </div>
                    <button type="button" class="btn-delete" aria-label="삭제">&times;</button>
                </div>
                <div class="cart-item-footer">
                    <div class="item-qty-badge">${item.quantity}개</div>
                    <div class="item-price">${subTotal.toLocaleString()}원</div>
                </div>
            `;

            li.querySelector('.btn-delete').addEventListener('click', () => removeFromCart(item.cartItemId));
            els.cartList.appendChild(li);
        });

        updateSummary();
    }

    function updateSummary() {
        let itemsSum = 0;
        let requiresShipping = false;

        cart.forEach(item => {
            itemsSum += (item.price * item.quantity);
            if (item.requiresShipping) {
                requiresShipping = true;
            }
        });

        const shippingFee = cart.length > 0 && requiresShipping ? 3000 : 0;
        const grandTotal = itemsSum + shippingFee;

        // 화면 표기 업데이트
        els.itemsTotal.textContent = `${itemsSum.toLocaleString()}원`;
        els.shippingFee.textContent = `${shippingFee === 0 ? '0' : '+3,000'}원`;
        els.grandTotal.textContent = `${grandTotal.toLocaleString()}원`;
    }

    // === 복사하기 기능 ===
    function copyEstimate() {
        if (cart.length === 0) {
            showToast("장바구니가 비어있습니다.");
            return;
        }

        let itemsSum = 0;
        let requiresShipping = false;
        let text = "[일비롱디자인 견적 문의]\n\n";

        cart.forEach(item => {
            const subTotal = item.price * item.quantity;
            itemsSum += subTotal;
            if (item.requiresShipping) requiresShipping = true;
            
            text += `- ${item.categoryName} : ${item.optionName} x ${item.quantity}개 = ${subTotal.toLocaleString()}원\n`;
        });

        const shippingFee = cart.length > 0 && requiresShipping ? 3000 : 0;
        const grandTotal = itemsSum + shippingFee;

        text += `\n`;
        text += `상품 합계: ${itemsSum.toLocaleString()}원\n`;
        text += `배송비: ${shippingFee.toLocaleString()}원\n`;
        text += `--------------------------\n`;
        text += `총 예상 결제 금액: ${grandTotal.toLocaleString()}원\n\n`;
        text += `(위 내용을 카톡 방에 전송해주세요. 확인 후 친절하게 안내해 드릴게요! 💛)`;

        navigator.clipboard.writeText(text).then(() => {
            showToast("✅ 카톡 공유용 견적서가 텍스트로 복사되었어요!");
        }).catch(err => {
            console.error('복사 실패:', err);
            showToast("복사에 실패했습니다. 기기 설정을 확인해주세요.");
        });
    }

    let toastTimeout;
    function showToast(message) {
        els.toast.textContent = message;
        els.toast.classList.add('show');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            els.toast.classList.remove('show');
        }, 2500);
    }

    // === 시작 ===
    init();
});
