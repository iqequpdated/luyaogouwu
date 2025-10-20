// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航
    initNavigation();
    
    // 初始化产品
    initProducts();
    
    // 初始化分类
    initCategories();
    
    // 初始化常见问题
    initFAQ();
    
    // 初始化聊天功能
    initChat();
    
    // 初始化支付功能
    initPayment();
    
    // 初始化通知功能
    initNotifications();
    
    // 初始化管理员认证
    initAdminAuth();
    
    // 初始化管理员申请
    initAdminApplication();
});

// 初始化导航
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            
            // 移除所有活动状态
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            document.getElementById(pageId).classList.add('active');
        });
    });
}

// 初始化产品
function initProducts() {
    loadProducts('product-list', window.mockData.products);
    loadProducts('shopping-product-list', window.mockData.products);
}

// 加载产品
function loadProducts(containerId, products) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="placeholder-image" style="display: none; width: 100%; height: 100%; background-color: #f8f9fa; align-items: center; justify-content: center; color: #777;">
                    <i class="fas fa-image"></i>
                </div>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price gold-amount">¥${product.price.toLocaleString()}</div>
                <div class="product-actions">
                    <button class="btn btn-outline">
                        <i class="far fa-heart"></i>
                        收藏
                    </button>
                    <button class="btn btn-primary buy-btn" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                        购买
                    </button>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });
    
    // 添加购买事件
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            showPaymentModal(productId);
        });
    });
}

// 初始化分类
function initCategories() {
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        category.addEventListener('click', function() {
            const categoryType = this.getAttribute('data-category');
            
            // 移除所有活动状态
            categories.forEach(cat => cat.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            
            // 筛选产品
            if (categoryType === 'all') {
                loadProducts('product-list', window.mockData.products);
            } else {
                const filteredProducts = window.mockData.products.filter(
                    product => product.category === categoryType
                );
                loadProducts('product-list', filteredProducts);
            }
        });
    });
}

// 初始化常见问题
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            item.classList.toggle('active');
        });
    });
}

// 初始化聊天功能
function initChat() {
    const chatToggle = document.getElementById('live-chat-btn');
    const closeChat = document.getElementById('close-chat');
    const chatBox = document.getElementById('chat-box');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    
    chatToggle.addEventListener('click', function() {
        chatBox.classList.add('active');
    });
    
    closeChat.addEventListener('click', function() {
        chatBox.classList.remove('active');
    });
    
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            // 添加用户消息
            addMessage(message, 'user');
            userInput.value = '';
            
            // 模拟机器人回复
            setTimeout(() => {
                let reply = "感谢您的咨询，我们的客服人员会尽快回复您。";
                if (message.includes('订单')) {
                    reply = "您可以在'我的-我的订单'中查看订单状态。";
                } else if (message.includes('退货')) {
                    reply = "退货流程：在'我的订单'中选择商品提交退货申请，审核通过后寄回商品。";
                } else if (message.includes('支付')) {
                    reply = "我们支持支付宝、微信支付和KBZ Pay三种支付方式。";
                }
                addMessage(reply, 'bot');
            }, 1000);
        }
    }
    
    function addMessage(text, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// 初始化支付功能
function initPayment() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const confirmBtn = document.getElementById('confirm-payment');
    let selectedPayment = null;
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除所有活动状态
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            document.querySelectorAll('.qr-code-section').forEach(section => section.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            selectedPayment = this.getAttribute('data-payment');
            
            // 显示对应的二维码
const qrElement = document.getElementById(`${selectedPayment}-qr`);
if (qrElement) {
  qrElement.classList.add('active');
} else {
  console.warn(`❌ 没有找到 ID = ${selectedPayment}-qr 的元素`);
}

            // 启用确认按钮
            confirmBtn.disabled = false;
        });
    });
    
    confirmBtn.addEventListener('click', function() {
        alert('支付成功！订单已提交，我们会尽快处理。');
        document.getElementById('payment-modal').classList.remove('active');
    });
    
    // 关闭模态框
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
}

// 显示支付模态框
function showPaymentModal(productId) {
    document.getElementById('payment-modal').classList.add('active');
}

// 初始化通知功能
function initNotifications() {
    const notificationIcon = document.getElementById('notification-icon');
    const notificationsList = document.getElementById('notifications-list');
    const notificationBadge = document.getElementById('notification-badge');
    
    // 更新未读通知数量
    const unreadCount = window.mockData.notifications.filter(n => !n.read).length;
    notificationBadge.textContent = unreadCount;
    if (unreadCount === 0) {
        notificationBadge.style.display = 'none';
    }
    
    notificationIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        notificationsList.classList.toggle('active');
    });
    
    // 点击通知项标记为已读
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            if (this.classList.contains('unread')) {
                this.classList.remove('unread');
                // 更新未读计数
                const newUnreadCount = document.querySelectorAll('.notification-item.unread').length;
                notificationBadge.textContent = newUnreadCount;
                if (newUnreadCount === 0) {
                    notificationBadge.style.display = 'none';
                }
            }
        });
    });
    
    // 点击页面其他区域关闭通知列表
    document.addEventListener('click', function() {
        notificationsList.classList.remove('active');
    });
}

// 初始化管理员认证
function initAdminAuth() {
    const adminLink = document.getElementById('admin-link');
    const adminMenuItem = document.getElementById('admin-menu-item');
    const authModal = document.getElementById('auth-modal');
    const cancelAuth = document.getElementById('cancel-auth');
    const submitAuth = document.getElementById('submit-auth');
    
    // 管理员认证处理
    function handleAdminAccess(e) {
        e.preventDefault();
        authModal.classList.add('active');
    }
    
    adminLink.addEventListener('click', handleAdminAccess);
    adminMenuItem.addEventListener('click', handleAdminAccess);
    
    cancelAuth.addEventListener('click', function() {
        authModal.classList.remove('active');
    });
    
    submitAuth.addEventListener('click', function() {
        const username = document.getElementById('auth-username').value;
        const password = document.getElementById('auth-password').value;
        
        // 简单的认证逻辑
        if (username === 'admin' && password === 'admin123') {
            alert('认证成功！正在跳转到后台管理页面...');
            window.location.href = 'admin/dashboard.html';
        } else {
            alert('账号或密码错误，请重试！');
        }
    });
}

// 初始化管理员申请
function initAdminApplication() {
    const submitApplication = document.getElementById('submit-application');
    const verifyEmailBtn = document.getElementById('verify-email-btn');
    const resendCode = document.getElementById('resend-code');
    const backToHome = document.getElementById('back-to-home');
    
    submitApplication.addEventListener('click', function() {
        const username = document.getElementById('apply-username').value;
        const email = document.getElementById('apply-email').value;
        const password = document.getElementById('apply-password').value;
        const reason = document.getElementById('apply-reason').value;
        
        if (!username || !email || !password || !reason) {
            alert('请填写所有必填字段！');
            return;
        }
        
        // 切换到步骤2
        document.getElementById('step-1').classList.remove('active');
        document.getElementById('step-2').classList.add('active');
        document.querySelector('.step[data-step="1"]').classList.remove('active');
        document.querySelector('.step[data-step="2"]').classList.add('active');
        
        // 显示邮箱
        document.getElementById('verify-email').textContent = email;
        
        // 模拟发送验证码
        alert('验证码已发送到您的邮箱：' + email);
    });
    
    verifyEmailBtn.addEventListener('click', function() {
        const code = document.getElementById('verify-code').value;
        
        if (!code || code.length !== 6) {
            alert('请输入6位验证码！');
            return;
        }
        
        // 切换到步骤3
        document.getElementById('step-2').classList.remove('active');
        document.getElementById('step-3').classList.add('active');
        document.querySelector('.step[data-step="2"]').classList.remove('active');
        document.querySelector('.step[data-step="3"]').classList.add('active');
        
        // 生成申请ID
        const applicationId = 'APP' + Date.now().toString().slice(-6);
        document.getElementById('application-id').textContent = applicationId;
    });
    
    resendCode.addEventListener('click', function() {
        alert('验证码已重新发送！');
    });
    
    backToHome.addEventListener('click', function() {
        // 切换到首页
        document.querySelector('.nav-item[data-page="home"]').click();
        
        // 重置申请表单
        document.getElementById('apply-username').value = '';
        document.getElementById('apply-email').value = '';
        document.getElementById('apply-password').value = '';
        document.getElementById('apply-reason').value = '';
        document.getElementById('verify-code').value = '';
        
        // 重置步骤
        document.getElementById('step-1').classList.add('active');
        document.getElementById('step-2').classList.remove('active');
        document.getElementById('step-3').classList.remove('active');
        document.querySelector('.step[data-step="1"]').classList.add('active');
        document.querySelector('.step[data-step="2"]').classList.remove('active');
        document.querySelector('.step[data-step="3"]').classList.remove('active');
    });
}

// 电话和邮件功能
function makePhoneCall() {
    if (confirm('是否拨打客服电话 09-665596297？')) {
        window.location.href = 'tel:09665596297';
    }
}

function sendEmail() {
    window.location.href = 'mailto:luy56913@gmail.com?subject=璐瑶购物咨询&body=您好，我有以下问题需要咨询：';
}

//上传//////
// 获取所有上架产品
const products = ProductManager.getActiveProducts();

// 用户注册
try {
    const user = UserManager.registerUser({
        name: '新用户',
        email: 'new@example.com',
        password: '123456',
        phone: '13800138000'
    });
} catch (error) {
    console.error(error.message);
}

// 创建订单
const order = OrderManager.createOrder({
    userId: 'user_1',
    items: [
        { productId: 'prod_1', name: 'iPhone 14 Pro', price: 8999, quantity: 1 }
    ],
    shippingAddress: {
        name: '收货人',
        phone: '13800138000',
        address: '收货地址'
    }
});