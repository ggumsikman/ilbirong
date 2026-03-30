document.addEventListener('DOMContentLoaded', () => {
    // === 상태 (State) ===
    let cart = []; // 장바구니 배열
    // 현재 선택 중인 상태
    let selectedCategoryId = "";
    let selectedOptionId = "";
    let quantity = 1;

    // === DOM 요소 참조 ===
    const els = {
        categorySelect: document.getElementById('categorySelect'),
        productSelect: document.getElementById('productSelect'),
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
        toast: document.getElementById('toast')
    };

    // === 초기화 로직 ===
    function init() {
        // 1. 카테고리 셀렉트옵션 채우기
        PRODUCT_DATA.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            els.categorySelect.appendChild(option);
        });

        // 2. 이벤트 리스너 등록
        els.categorySelect.addEventListener('change', handleCategoryChange);
        els.productSelect.addEventListener('change', handleProductChange);
        els.btnMinus.addEventListener('click', () => updateQuantity(-1));
        els.btnPlus.addEventListener('click', () => updateQuantity(1));
        els.btnAddCart.addEventListener('click', addToCart);
        els.btnCopyEstimate.addEventListener('click', copyEstimate);
    }

    // === 이벤트 핸들러 ===
    function handleCategoryChange(e) {
        selectedCategoryId = e.target.value;
        selectedOptionId = "";
        quantity = 1;

        els.productSelect.innerHTML = '<option value="">상세 상품 및 크기를 선택해주세요</option>';
        els.quantityInput.value = quantity;
        updateAddButtonState();

        if (selectedCategoryId) {
            const category = PRODUCT_DATA.find(c => c.id === selectedCategoryId);
            category.options.forEach(opt => {
                const optEl = document.createElement('option');
                optEl.value = opt.id;
                optEl.textContent = `${opt.name} (${opt.price.toLocaleString()}원)`;
                els.productSelect.appendChild(optEl);
            });
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
        const canAdd = selectedCategoryId !== "" && selectedOptionId !== "";
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
        const category = PRODUCT_DATA.find(c => c.id === selectedCategoryId);
        const option = category.options.find(o => o.id === selectedOptionId);

        if (!category || !option) return;

        const cartItem = {
            cartItemId: Date.now().toString(),
            categoryName: category.name,
            requiresShipping: category.requiresShipping,
            optionName: option.name,
            price: option.price,
            quantity: quantity,
            isCustom: option.isCustom || false
        };

        cart.push(cartItem);
        renderCart();
        
        // 추가 후 입력 폼 초기화
        els.categorySelect.value = "";
        handleCategoryChange({ target: { value: "" } });
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
            let customBadge = item.isCustom ? `<div class="badge-custom">* 비규격은 별도 문의 시 가격 합산 예정</div>` : '';

            li.innerHTML = `
                <div class="cart-item-header">
                    <div>
                        <div class="item-cat">${item.categoryName}</div>
                        <div class="item-name">${item.optionName}</div>
                        ${customBadge}
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
            if (item.isCustom) {
                text += `  * (비규격 맞춤제작건은 상담 후 최종 금액 안내)\n`;
            }
        });

        const shippingFee = cart.length > 0 && requiresShipping ? 3000 : 0;
        const grandTotal = itemsSum + shippingFee;

        text += `\n`;
        text += `상품 합계: ${itemsSum.toLocaleString()}원\n`;
        text += `배송비: ${shippingFee.toLocaleString()}원\n`;
        text += `--------------------------\n`;
        text += `총 예상 결제 금액: ${grandTotal.toLocaleString()}원\n\n`;
        text += `(위 내용을 카톡 방에 전송해주세요. 확인 후 친절하게 안내해 드릴게요! 💛)`;

        // 클립보드 복사 API 사용
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
