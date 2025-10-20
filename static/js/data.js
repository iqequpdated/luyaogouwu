// 共享数据存储
window.mockData = {
    products: [
        { id: 1, name: "iPhone 14 Pro", category: "digital", price: 8999, image: "https://via.placeholder.com/150" },
        { id: 2, name: "MacBook Pro", category: "digital", price: 12999, image: "https://via.placeholder.com/150" },
        { id: 3, name: "夏季连衣裙", category: "clothing", price: 299, image: "https://via.placeholder.com/150" },
        { id: 4, name: "男士衬衫", category: "clothing", price: 199, image: "https://via.placeholder.com/150" },
        { id: 5, name: "汽车轮胎", category: "car", price: 599, image: "https://via.placeholder.com/150" },
        { id: 6, name: "无线耳机", category: "digital", price: 399, image: "https://via.placeholder.com/150" }
    ],
    notifications: [
        { id: 1, title: "系统通知", content: "您的订单 #ORD001 已发货，请注意查收", time: "2小时前", read: false },
        { id: 2, title: "促销活动", content: "新用户专享优惠券已发放至您的账户", time: "5小时前", read: false },
        { id: 3, title: "账户安全", content: "您的账户在异地登录，如非本人操作请及时修改密码", time: "1天前", read: true },
        { id: 4, title: "新品上架", content: "iPhone 14 Pro 新品已上架，立即抢购", time: "2天前", read: true }
    ],
    orders: [
        { id: "ORD001", status: "shipped", total: 8999, date: "2024-01-15" },
        { id: "ORD002", status: "processing", total: 12999, date: "2024-01-14" }
    ],
    adminApplications: []
};

// 数据操作函数
window.dataManager = {
    // 获取所有产品
    getProducts: function() {
        return JSON.parse(localStorage.getItem('products')) || this.products;
    },
    
    // 保存产品
    saveProducts: function(products) {
        localStorage.setItem('products', JSON.stringify(products));
    },
    
    // 添加新产品
    addProduct: function(product) {
        const products = this.getProducts();
        product.id = Date.now(); // 简单ID生成
        products.push(product);
        this.saveProducts(products);
        return product;
    },
    
    // 更新产品
    updateProduct: function(id, updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct };
            this.saveProducts(products);
            return true;
        }
        return false;
    },
    
    // 删除产品
    deleteProduct: function(id) {
        const products = this.getProducts();
        const filteredProducts = products.filter(p => p.id != id);
        this.saveProducts(filteredProducts);
        return filteredProducts.length !== products.length;
    },
    
    // 获取订单
    getOrders: function() {
        return JSON.parse(localStorage.getItem('orders')) || this.orders;
    },
    
    // 保存订单
    saveOrders: function(orders) {
        localStorage.setItem('orders', JSON.stringify(orders));
    },
    
    // 获取管理员申请
    getAdminApplications: function() {
        return JSON.parse(localStorage.getItem('adminApplications')) || this.adminApplications;
    },
    
    // 保存管理员申请
    saveAdminApplications: function(applications) {
        localStorage.setItem('adminApplications', JSON.stringify(applications));
    },
    
    // 添加管理员申请
    addAdminApplication: function(application) {
        const applications = this.getAdminApplications();
        application.id = 'APP' + Date.now().toString().slice(-6);
        application.status = 'pending';
        application.createdAt = new Date().toISOString();
        applications.push(application);
        this.saveAdminApplications(applications);
        return application;
    },
    
    // 更新申请状态
    updateApplicationStatus: function(id, status) {
        const applications = this.getAdminApplications();
        const application = applications.find(app => app.id === id);
        if (application) {
            application.status = status;
            application.updatedAt = new Date().toISOString();
            this.saveAdminApplications(applications);
            return true;
        }
        return false;
    }
};

// 初始化默认数据
document.addEventListener('DOMContentLoaded', function() {
    // 如果本地存储中没有数据，则初始化默认数据
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(window.mockData.products));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify(window.mockData.orders));
    }
    if (!localStorage.getItem('adminApplications')) {
        localStorage.setItem('adminApplications', JSON.stringify(window.mockData.adminApplications));
    }
});
//多加代码//
// static/data.js - 璐瑶购物系统数据管理

// 全局数据存储和管理
window.AppData = {
    // 当前用户信息
    currentUser: null,
    
    // 系统配置
    config: {
        currency: '¥',
        language: 'zh-CN',
        autoSave: true,
        adminApprovalRequired: true
    },

    // 初始化函数
    init: function() {
        this.loadFromLocalStorage();
        this.setupAutoSave();
        this.setupDemoData();
        console.log('璐瑶购物数据系统初始化完成');
    },

    // 从本地存储加载数据
    loadFromLocalStorage: function() {
        try {
            const savedProducts = localStorage.getItem('luyao_products');
            const savedUsers = localStorage.getItem('luyao_users');
            const savedOrders = localStorage.getItem('luyao_orders');
            const savedAdmins = localStorage.getItem('luyao_admin_applications');
            const savedSettings = localStorage.getItem('luyao_settings');

            if (savedProducts) this.products = JSON.parse(savedProducts);
            if (savedUsers) this.users = JSON.parse(savedUsers);
            if (savedOrders) this.orders = JSON.parse(savedOrders);
            if (savedAdmins) this.adminApplications = JSON.parse(savedAdmins);
            if (savedSettings) this.settings = JSON.parse(savedSettings);

            // 加载当前用户
            const currentUser = localStorage.getItem('luyao_current_user');
            if (currentUser) this.currentUser = JSON.parse(currentUser);

        } catch (error) {
            console.error('加载本地数据失败:', error);
            this.initializeDefaultData();
        }
    },

    // 自动保存
    setupAutoSave: function() {
        if (this.config.autoSave) {
            setInterval(() => {
                this.saveToLocalStorage();
            }, 30000); // 每30秒自动保存
        }
    },

    // 保存到本地存储
    saveToLocalStorage: function() {
        try {
            localStorage.setItem('luyao_products', JSON.stringify(this.products));
            localStorage.setItem('luyao_users', JSON.stringify(this.users));
            localStorage.setItem('luyao_orders', JSON.stringify(this.orders));
            localStorage.setItem('luyao_admin_applications', JSON.stringify(this.adminApplications));
            localStorage.setItem('luyao_settings', JSON.stringify(this.settings));
            
            if (this.currentUser) {
                localStorage.setItem('luyao_current_user', JSON.stringify(this.currentUser));
            }
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    },

    // 初始化默认数据
    initializeDefaultData: function() {
        this.products = this.getDefaultProducts();
        this.users = this.getDefaultUsers();
        this.orders = this.getDefaultOrders();
        this.adminApplications = [];
        this.settings = this.getDefaultSettings();
        this.saveToLocalStorage();
    },

    // 设置演示数据
    setupDemoData: function() {
        if (!this.products || this.products.length === 0) {
            this.products = this.getDefaultProducts();
        }
        if (!this.users || this.users.length === 0) {
            this.users = this.getDefaultUsers();
        }
        if (!this.orders || this.orders.length === 0) {
            this.orders = this.getDefaultOrders();
        }
        if (!this.settings) {
            this.settings = this.getDefaultSettings();
        }
        this.saveToLocalStorage();
    }
};

// 产品数据管理
window.ProductManager = {
    // 获取所有产品
    getAllProducts: function() {
        return AppData.products || [];
    },

    // 获取上架产品
    getActiveProducts: function() {
        return (AppData.products || []).filter(product => product.status === 'active');
    },

    // 根据分类获取产品
    getProductsByCategory: function(category) {
        const products = AppData.products || [];
        if (category === 'all') return products;
        return products.filter(product => product.category === category);
    },

    // 根据ID获取产品
    getProductById: function(id) {
        return (AppData.products || []).find(product => product.id == id);
    },

    // 搜索产品
    searchProducts: function(keyword) {
        const products = AppData.products || [];
        return products.filter(product => 
            product.name.toLowerCase().includes(keyword.toLowerCase()) ||
            product.description.toLowerCase().includes(keyword.toLowerCase()) ||
            product.category.toLowerCase().includes(keyword.toLowerCase())
        );
    },

    // 添加新产品
    addProduct: function(productData) {
        const newProduct = {
            id: this.generateId(),
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: productData.status || 'active',
            salesCount: 0,
            rating: 0,
            reviewCount: 0
        };

        if (!AppData.products) AppData.products = [];
        AppData.products.push(newProduct);
        AppData.saveToLocalStorage();
        
        this.dispatchEvent('productsUpdated', { action: 'add', product: newProduct });
        return newProduct;
    },

    // 更新产品
    updateProduct: function(id, updates) {
        const productIndex = AppData.products.findIndex(p => p.id == id);
        if (productIndex === -1) return null;

        AppData.products[productIndex] = {
            ...AppData.products[productIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        AppData.saveToLocalStorage();
        this.dispatchEvent('productsUpdated', { action: 'update', product: AppData.products[productIndex] });
        return AppData.products[productIndex];
    },

    // 删除产品
    deleteProduct: function(id) {
        const productIndex = AppData.products.findIndex(p => p.id == id);
        if (productIndex === -1) return false;

        const deletedProduct = AppData.products.splice(productIndex, 1)[0];
        AppData.saveToLocalStorage();
        
        this.dispatchEvent('productsUpdated', { action: 'delete', product: deletedProduct });
        return true;
    },

    // 上架/下架产品
    toggleProductStatus: function(id) {
        const product = this.getProductById(id);
        if (!product) return null;

        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        return this.updateProduct(id, { status: newStatus });
    },

    // 更新产品库存
    updateProductStock: function(id, newStock) {
        return this.updateProduct(id, { stock: newStock });
    },

    // 记录产品销售
    recordProductSale: function(id, quantity = 1) {
        const product = this.getProductById(id);
        if (!product) return null;

        const newSalesCount = (product.salesCount || 0) + quantity;
        const newStock = product.stock - quantity;
        
        return this.updateProduct(id, {
            salesCount: newSalesCount,
            stock: newStock
        });
    },

    // 生成产品ID
    generateId: function() {
        return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // 事件分发
    dispatchEvent: function(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
};

// 用户数据管理
window.UserManager = {
    // 获取所有用户
    getAllUsers: function() {
        return AppData.users || [];
    },

    // 根据ID获取用户
    getUserById: function(id) {
        return (AppData.users || []).find(user => user.id == id);
    },

    // 根据邮箱获取用户
    getUserByEmail: function(email) {
        return (AppData.users || []).find(user => user.email === email);
    },

    // 搜索用户
    searchUsers: function(keyword) {
        const users = AppData.users || [];
        return users.filter(user => 
            user.name.toLowerCase().includes(keyword.toLowerCase()) ||
            user.email.toLowerCase().includes(keyword.toLowerCase()) ||
            user.phone.includes(keyword)
        );
    },

    // 用户注册
    registerUser: function(userData) {
        // 检查邮箱是否已存在
        if (this.getUserByEmail(userData.email)) {
            throw new Error('该邮箱已被注册');
        }

        const newUser = {
            id: this.generateId(),
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            level: '普通会员',
            totalOrders: 0,
            totalSpent: 0,
            lastLogin: null,
            avatar: userData.avatar || this.generateAvatar(userData.name)
        };

        if (!AppData.users) AppData.users = [];
        AppData.users.push(newUser);
        AppData.saveToLocalStorage();

        this.dispatchEvent('usersUpdated', { action: 'add', user: newUser });
        return newUser;
    },

    // 更新用户信息
    updateUser: function(id, updates) {
        const userIndex = AppData.users.findIndex(u => u.id == id);
        if (userIndex === -1) return null;

        AppData.users[userIndex] = {
            ...AppData.users[userIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        AppData.saveToLocalStorage();
        this.dispatchEvent('usersUpdated', { action: 'update', user: AppData.users[userIndex] });
        return AppData.users[userIndex];
    },

    // 删除用户
    deleteUser: function(id) {
        const userIndex = AppData.users.findIndex(u => u.id == id);
        if (userIndex === -1) return false;

        const deletedUser = AppData.users.splice(userIndex, 1)[0];
        AppData.saveToLocalStorage();
        
        this.dispatchEvent('usersUpdated', { action: 'delete', user: deletedUser });
        return true;
    },

    // 用户登录
    login: function(email, password) {
        const user = this.getUserByEmail(email);
        if (!user || user.password !== password) {
            throw new Error('邮箱或密码错误');
        }

        if (user.status !== 'active') {
            throw new Error('账户已被禁用，请联系管理员');
        }

        // 更新最后登录时间
        this.updateUser(user.id, { lastLogin: new Date().toISOString() });

        // 设置当前用户
        AppData.currentUser = user;
        AppData.saveToLocalStorage();

        this.dispatchEvent('userLoggedIn', { user });
        return user;
    },

    // 用户登出
    logout: function() {
        AppData.currentUser = null;
        localStorage.removeItem('luyao_current_user');
        this.dispatchEvent('userLoggedOut');
    },

    // 获取当前用户
    getCurrentUser: function() {
        return AppData.currentUser;
    },

    // 更新用户等级
    updateUserLevel: function(id, level) {
        return this.updateUser(id, { level });
    },

    // 更新用户统计
    updateUserStats: function(id, orderAmount) {
        const user = this.getUserById(id);
        if (!user) return null;

        const totalOrders = (user.totalOrders || 0) + 1;
        const totalSpent = (user.totalSpent || 0) + orderAmount;

        // 根据消费金额更新等级
        let level = '普通会员';
        if (totalSpent >= 10000) level = '钻石会员';
        else if (totalSpent >= 5000) level = '黄金会员';
        else if (totalSpent >= 1000) level = '白银会员';

        return this.updateUser(id, {
            totalOrders,
            totalSpent,
            level
        });
    },

    // 生成用户ID
    generateId: function() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // 生成头像
    generateAvatar: function(name) {
        const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const initials = name.charAt(0).toUpperCase();
        
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${color}"/><text x="50" y="60" font-family="Arial" font-size="40" fill="white" text-anchor="middle">${initials}</text></svg>`;
    },

    // 事件分发
    dispatchEvent: function(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
};

// 订单数据管理
window.OrderManager = {
    // 获取所有订单
    getAllOrders: function() {
        return AppData.orders || [];
    },

    // 根据ID获取订单
    getOrderById: function(id) {
        return (AppData.orders || []).find(order => order.id == id);
    },

    // 获取用户订单
    getUserOrders: function(userId) {
        return (AppData.orders || []).filter(order => order.userId == userId);
    },

    // 创建订单
    createOrder: function(orderData) {
        const orderItems = orderData.items || [];
        const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = {
            id: this.generateOrderId(),
            ...orderData,
            totalAmount,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            paymentStatus: 'unpaid',
            shippingAddress: orderData.shippingAddress || {},
            paymentMethod: orderData.paymentMethod || 'alipay'
        };

        if (!AppData.orders) AppData.orders = [];
        AppData.orders.push(newOrder);
        AppData.saveToLocalStorage();

        // 更新用户统计
        if (orderData.userId) {
            UserManager.updateUserStats(orderData.userId, totalAmount);
        }

        this.dispatchEvent('orderCreated', { order: newOrder });
        return newOrder;
    },

    // 更新订单状态
    updateOrderStatus: function(id, status) {
        const order = this.getOrderById(id);
        if (!order) return null;

        const updates = { status, updatedAt: new Date().toISOString() };

        // 如果是完成状态，更新产品销售统计
        if (status === 'completed' && order.status !== 'completed') {
            order.items.forEach(item => {
                ProductManager.recordProductSale(item.productId, item.quantity);
            });
        }

        return this.updateOrder(id, updates);
    },

    // 更新订单
    updateOrder: function(id, updates) {
        const orderIndex = AppData.orders.findIndex(o => o.id == id);
        if (orderIndex === -1) return null;

        AppData.orders[orderIndex] = {
            ...AppData.orders[orderIndex],
            ...updates
        };

        AppData.saveToLocalStorage();
        this.dispatchEvent('orderUpdated', { order: AppData.orders[orderIndex] });
        return AppData.orders[orderIndex];
    },

    // 处理支付
    processPayment: function(orderId, paymentData) {
        const order = this.getOrderById(orderId);
        if (!order) throw new Error('订单不存在');

        if (order.paymentStatus === 'paid') {
            throw new Error('订单已支付');
        }

        const updatedOrder = this.updateOrder(orderId, {
            paymentStatus: 'paid',
            paidAt: new Date().toISOString(),
            paymentData: paymentData,
            status: 'processing' // 支付后进入处理中状态
        });

        this.dispatchEvent('paymentProcessed', { order: updatedOrder });
        return updatedOrder;
    },

    // 取消订单
    cancelOrder: function(orderId, reason) {
        const order = this.getOrderById(orderId);
        if (!order) throw new Error('订单不存在');

        if (order.status === 'completed' || order.status === 'shipped') {
            throw new Error('订单无法取消，已发货或完成');
        }

        return this.updateOrderStatus(orderId, 'cancelled');
    },

    // 获取订单统计
    getOrderStats: function() {
        const orders = AppData.orders || [];
        const today = new Date().toDateString();
        
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'processing').length,
            completed: orders.filter(o => o.status === 'completed').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
            today: orders.filter(o => new Date(o.createdAt).toDateString() === today).length,
            totalRevenue: orders
                .filter(o => o.status === 'completed')
                .reduce((sum, order) => sum + order.totalAmount, 0)
        };
    },

    // 生成订单ID
    generateOrderId: function() {
        const timestamp = new Date().getTime();
        const random = Math.random().toString(36).substr(2, 9).toUpperCase();
        return `ORD${timestamp}${random}`;
    },

    // 事件分发
    dispatchEvent: function(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
};

// 管理员申请管理
window.AdminApplicationManager = {
    // 获取所有申请
    getAllApplications: function() {
        return AppData.adminApplications || [];
    },

    // 提交管理员申请
    submitApplication: function(applicationData) {
        const newApplication = {
            id: this.generateId(),
            ...applicationData,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            reviewedAt: null,
            reviewedBy: null,
            feedback: ''
        };

        if (!AppData.adminApplications) AppData.adminApplications = [];
        AppData.adminApplications.push(newApplication);
        AppData.saveToLocalStorage();

        this.dispatchEvent('applicationSubmitted', { application: newApplication });
        return newApplication;
    },

    // 审核申请
    reviewApplication: function(applicationId, decision, reviewedBy, feedback = '') {
        const application = this.getApplicationById(applicationId);
        if (!application) throw new Error('申请不存在');

        const updatedApplication = {
            ...application,
            status: decision ? 'approved' : 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewedBy: reviewedBy,
            feedback: feedback
        };

        const appIndex = AppData.adminApplications.findIndex(a => a.id == applicationId);
        AppData.adminApplications[appIndex] = updatedApplication;
        AppData.saveToLocalStorage();

        // 如果批准，将用户升级为管理员
        if (decision) {
            const user = UserManager.getUserById(application.userId);
            if (user) {
                UserManager.updateUser(user.id, { role: 'admin' });
            }
        }

        this.dispatchEvent('applicationReviewed', { application: updatedApplication });
        return updatedApplication;
    },

    // 根据ID获取申请
    getApplicationById: function(id) {
        return (AppData.adminApplications || []).find(app => app.id == id);
    },

    // 获取用户申请
    getUserApplications: function(userId) {
        return (AppData.adminApplications || []).filter(app => app.userId == userId);
    },

    // 生成申请ID
    generateId: function() {
        return 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // 事件分发
    dispatchEvent: function(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
};

// 默认数据生成器
window.DefaultDataGenerator = {
    // 默认产品数据
    getDefaultProducts: function() {
        return [
            {
                id: 'prod_1',
                name: 'iPhone 14 Pro',
                category: 'digital',
                price: 8999,
                originalPrice: 9999,
                stock: 50,
                status: 'active',
                description: '新一代iPhone，强大的A16芯片，4800万像素主摄像头',
                images: ['https://via.placeholder.com/400x400?text=iPhone+14+Pro'],
                features: ['A16芯片', '4800万像素', '灵动岛', '5G网络'],
                salesCount: 156,
                rating: 4.8,
                reviewCount: 89,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 'prod_2',
                name: 'MacBook Pro',
                category: 'digital',
                price: 12999,
                originalPrice: 14999,
                stock: 30,
                status: 'active',
                description: '专业级笔记本电脑，M2芯片，超强性能',
                images: ['https://via.placeholder.com/400x400?text=MacBook+Pro'],
                features: ['M2芯片', '16GB内存', '512GB存储', 'Retina显示屏'],
                salesCount: 89,
                rating: 4.9,
                reviewCount: 45,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 'prod_3',
                name: '夏季连衣裙',
                category: 'clothing',
                price: 299,
                originalPrice: 399,
                stock: 100,
                status: 'active',
                description: '时尚夏季连衣裙，舒适面料，多种颜色可选',
                images: ['https://via.placeholder.com/400x400?text=夏季连衣裙'],
                features: ['纯棉面料', '多色可选', '透气舒适', '机洗不变形'],
                salesCount: 245,
                rating: 4.5,
                reviewCount: 120,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 'prod_4',
                name: '男士衬衫',
                category: 'clothing',
                price: 199,
                originalPrice: 299,
                stock: 80,
                status: 'active',
                description: '商务休闲男士衬衫，经典款式',
                images: ['https://via.placeholder.com/400x400?text=男士衬衫'],
                features: ['免烫面料', '多尺寸', '商务休闲', '易打理'],
                salesCount: 132,
                rating: 4.3,
                reviewCount: 67,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 'prod_5',
                name: '无线耳机',
                category: 'digital',
                price: 399,
                originalPrice: 599,
                stock: 25,
                status: 'active',
                description: '高品质无线蓝牙耳机，降噪功能',
                images: ['https://via.placeholder.com/400x400?text=无线耳机'],
                features: ['主动降噪', '30小时续航', '蓝牙5.2', '防水防汗'],
                salesCount: 187,
                rating: 4.6,
                reviewCount: 93,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 'prod_6',
                name: '运动鞋',
                category: 'sports',
                price: 459,
                originalPrice: 599,
                stock: 60,
                status: 'inactive',
                description: '专业运动鞋，缓震舒适',
                images: ['https://via.placeholder.com/400x400?text=运动鞋'],
                features: ['气垫缓震', '防滑鞋底', '透气网面', '多尺码'],
                salesCount: 78,
                rating: 4.4,
                reviewCount: 34,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-15T10:30:00Z'
            }
        ];
    },

    // 默认用户数据
    getDefaultUsers: function() {
        return [
            {
                id: 'user_1',
                name: '张小明',
                email: 'zhang@example.com',
                password: '123456',
                phone: '13800138001',
                avatar: UserManager.generateAvatar('张小明'),
                status: 'active',
                level: '黄金会员',
                totalOrders: 5,
                totalSpent: 3899,
                lastLogin: '2024-01-15T14:30:00Z',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-15T14:30:00Z',
                role: 'user'
            },
            {
                id: 'user_2',
                name: '李小红',
                email: 'li@example.com',
                password: '123456',
                phone: '13900139001',
                avatar: UserManager.generateAvatar('李小红'),
                status: 'active',
                level: '白银会员',
                totalOrders: 3,
                totalSpent: 1299,
                lastLogin: '2024-01-14T16:20:00Z',
                createdAt: '2024-01-05T00:00:00Z',
                updatedAt: '2024-01-14T16:20:00Z',
                role: 'user'
            },
            {
                id: 'user_3',
                name: '王刚',
                email: 'wang@example.com',
                password: '123456',
                phone: '13700137001',
                avatar: UserManager.generateAvatar('王刚'),
                status: 'active',
                level: '普通会员',
                totalOrders: 1,
                totalSpent: 599,
                lastLogin: '2024-01-13T10:15:00Z',
                createdAt: '2024-01-08T00:00:00Z',
                updatedAt: '2024-01-13T10:15:00Z',
                role: 'user'
            },
            {
                id: 'user_4',
                name: '管理员',
                email: 'admin@luyao.com',
                password: 'admin123',
                phone: '13600136001',
                avatar: UserManager.generateAvatar('管理员'),
                status: 'active',
                level: '管理员',
                totalOrders: 0,
                totalSpent: 0,
                lastLogin: '2024-01-15T15:45:00Z',
                createdAt: '2023-12-01T00:00:00Z',
                updatedAt: '2024-01-15T15:45:00Z',
                role: 'admin'
            }
        ];
    },

    // 默认订单数据
    getDefaultOrders: function() {
        return [
            {
                id: 'ORD202401150001',
                userId: 'user_1',
                items: [
                    { productId: 'prod_1', name: 'iPhone 14 Pro', price: 8999, quantity: 1, image: 'https://via.placeholder.com/100x100?text=iPhone' },
                    { productId: 'prod_5', name: '无线耳机', price: 399, quantity: 1, image: 'https://via.placeholder.com/100x100?text=耳机' }
                ],
                totalAmount: 9398,
                status: 'completed',
                paymentStatus: 'paid',
                paymentMethod: 'alipay',
                shippingAddress: {
                    name: '张小明',
                    phone: '13800138001',
                    address: '北京市朝阳区某某街道123号',
                    zipCode: '100000'
                },
                createdAt: '2024-01-15T10:30:00Z',
                paidAt: '2024-01-15T10:35:00Z',
                completedAt: '2024-01-16T14:20:00Z'
            },
            {
                id: 'ORD202401140001',
                userId: 'user_2',
                items: [
                    { productId: 'prod_3', name: '夏季连衣裙', price: 299, quantity: 2, image: 'https://via.placeholder.com/100x100?text=连衣裙' }
                ],
                totalAmount: 598,
                status: 'processing',
                paymentStatus: 'paid',
                paymentMethod: 'wechat',
                shippingAddress: {
                    name: '李小红',
                    phone: '13900139001',
                    address: '上海市浦东新区某某路456号',
                    zipCode: '200000'
                },
                createdAt: '2024-01-14T16:20:00Z',
                paidAt: '2024-01-14T16:25:00Z'
            },
            {
                id: 'ORD202401130001',
                userId: 'user_3',
                items: [
                    { productId: 'prod_5', name: '无线耳机', price: 399, quantity: 1, image: 'https://via.placeholder.com/100x100?text=耳机' },
                    { productId: 'prod_4', name: '男士衬衫', price: 199, quantity: 1, image: 'https://via.placeholder.com/100x100?text=衬衫' }
                ],
                totalAmount: 598,
                status: 'pending',
                paymentStatus: 'unpaid',
                paymentMethod: 'alipay',
                shippingAddress: {
                    name: '王刚',
                    phone: '13700137001',
                    address: '广州市天河区某某大道789号',
                    zipCode: '510000'
                },
                createdAt: '2024-01-13T10:15:00Z'
            }
        ];
    },

    // 默认设置
    getDefaultSettings: function() {
        return {
            siteName: '璐瑶购物',
            currency: '¥',
            language: 'zh-CN',
            contactPhone: '09-665596297',
            contactEmail: 'luy56913@gmail.com',
            telegram: '@ryh888c',
            address: '全国100+门店',
            businessHours: '09:00-18:00',
            autoBackup: true,
            lowStockAlert: 10,
            taxRate: 0.13
        };
    }
};

// 工具函数
window.DataUtils = {
    // 格式化货币
    formatCurrency: function(amount, currency = '¥') {
        return `${currency}${amount.toFixed(2)}`;
    },

    // 格式化日期
    formatDate: function(dateString, format = 'YYYY-MM-DD HH:mm') {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    },

    // 深拷贝对象
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // 生成随机ID
    generateRandomId: function(prefix = '') {
        return prefix + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // 验证邮箱格式
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // 验证手机号格式
    validatePhone: function(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    },

    // 防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 初始化数据系统
document.addEventListener('DOMContentLoaded', function() {
    // 设置默认数据生成器
    AppData.getDefaultProducts = DefaultDataGenerator.getDefaultProducts;
    AppData.getDefaultUsers = DefaultDataGenerator.getDefaultUsers;
    AppData.getDefaultOrders = DefaultDataGenerator.getDefaultOrders;
    AppData.getDefaultSettings = DefaultDataGenerator.getDefaultSettings;

    // 初始化应用数据
    AppData.init();

    console.log('璐瑶购物数据系统已启动');
});

// 导出供模块化使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppData,
        ProductManager,
        UserManager,
        OrderManager,
        AdminApplicationManager,
        DefaultDataGenerator,
        DataUtils
    };
}