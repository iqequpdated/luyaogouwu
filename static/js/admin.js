// admin.js - 璐瑶购物后台管理系统 JavaScript 逻辑

// 全局配置
const AdminConfig = {
    apiBaseUrl: '/api/admin',
    pageSize: 20,
    autoRefreshInterval: 30000, // 30秒自动刷新
    enableRealTimeUpdates: true,
    debugMode: false
};

// 工具函数
const AdminUtils = {
    // 格式化日期
    formatDate: (date, format = 'YYYY-MM-DD HH:mm:ss') => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    // 格式化文件大小
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 数字格式化
    formatNumber: (num) => {
        return new Intl.NumberFormat('zh-CN').format(num);
    },

    // 货币格式化
    formatCurrency: (amount) => {
        return '¥' + new Intl.NumberFormat('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    // 防抖函数
    debounce: (func, wait) => {
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
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 显示通知
    showNotification: (message, type = 'info', duration = 3000) => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;

        // 添加样式
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    padding: 15px 20px;
                    min-width: 300px;
                    z-index: 10000;
                    border-left: 4px solid #3498db;
                    animation: slideInRight 0.3s ease;
                }
                .notification-success { border-left-color: #2ecc71; }
                .notification-error { border-left-color: #e74c3c; }
                .notification-warning { border-left-color: #f39c12; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // 自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    },

    // 确认对话框
    confirm: (message, title = '确认操作') => {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <div class="modal-title">${title}</div>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="confirm-cancel">取消</button>
                        <button class="btn btn-danger" id="confirm-ok">确认</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const closeModal = () => {
                modal.remove();
                document.removeEventListener('keydown', handleKeydown);
            };

            const handleKeydown = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    resolve(false);
                }
            };

            document.getElementById('confirm-cancel').onclick = () => {
                closeModal();
                resolve(false);
            };

            document.getElementById('confirm-ok').onclick = () => {
                closeModal();
                resolve(true);
            };

            modal.querySelector('.close-modal').onclick = () => {
                closeModal();
                resolve(false);
            };

            modal.onclick = (e) => {
                if (e.target === modal) {
                    closeModal();
                    resolve(false);
                }
            };

            document.addEventListener('keydown', handleKeydown);
        });
    },

    // 加载动画
    showLoading: (container) => {
        const loader = document.createElement('div');
        loader.className = 'loading';
        loader.innerHTML = '<div class="loading-spinner"></div>';
        container.appendChild(loader);
        return loader;
    },

    hideLoading: (loader) => {
        if (loader && loader.parentNode) {
            loader.remove();
        }
    }
};

// API 服务
const AdminAPI = {
    // 通用请求方法
    request: async (endpoint, options = {}) => {
        const url = `${AdminConfig.apiBaseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include',
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (AdminConfig.debugMode) {
                console.log(`API ${endpoint}:`, data);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            AdminUtils.showNotification('网络请求失败，请检查网络连接', 'error');
            throw error;
        }
    },

    // 仪表板数据
    getDashboardData: async () => {
        return await AdminAPI.request('/dashboard');
    },

    // 商品管理
    getProducts: async (page = 1, filters = {}) => {
        const query = new URLSearchParams({ page, ...filters });
        return await AdminAPI.request(`/products?${query}`);
    },

    createProduct: async (productData) => {
        return await AdminAPI.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },

    updateProduct: async (id, productData) => {
        return await AdminAPI.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    },

    deleteProduct: async (id) => {
        return await AdminAPI.request(`/products/${id}`, {
            method: 'DELETE'
        });
    },

    // 订单管理
    getOrders: async (page = 1, filters = {}) => {
        const query = new URLSearchParams({ page, ...filters });
        return await AdminAPI.request(`/orders?${query}`);
    },

    updateOrderStatus: async (id, status) => {
        return await AdminAPI.request(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    },

    // 用户管理
    getUsers: async (page = 1, filters = {}) => {
        const query = new URLSearchParams({ page, ...filters });
        return await AdminAPI.request(`/users?${query}`);
    },

    createUser: async (userData) => {
        return await AdminAPI.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    updateUser: async (id, userData) => {
        return await AdminAPI.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    deleteUser: async (id) => {
        return await AdminAPI.request(`/users/${id}`, {
            method: 'DELETE'
        });
    },

    // 备份管理
    getBackups: async () => {
        return await AdminAPI.request('/backups');
    },

    createBackup: async (backupData) => {
        return await AdminAPI.request('/backups', {
            method: 'POST',
            body: JSON.stringify(backupData)
        });
    },

    restoreBackup: async (id) => {
        return await AdminAPI.request(`/backups/${id}/restore`, {
            method: 'POST'
        });
    },

    deleteBackup: async (id) => {
        return await AdminAPI.request(`/backups/${id}`, {
            method: 'DELETE'
        });
    },

    // 系统设置
    getSettings: async () => {
        return await AdminAPI.request('/settings');
    },

    updateSettings: async (settings) => {
        return await AdminAPI.request('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }
};

// 仪表板管理
const DashboardManager = {
    init: function() {
        if (!document.querySelector('.dashboard-container')) return;

        this.loadDashboardData();
        this.setupEventListeners();
        this.startAutoRefresh();
    },

    loadDashboardData: async function() {
        try {
            const data = await AdminAPI.getDashboardData();
            this.updateDashboard(data);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    },

    updateDashboard: function(data) {
        // 更新统计卡片
        if (data.stats) {
            this.updateStatsCards(data.stats);
        }

        // 更新最近订单
        if (data.recentOrders) {
            this.updateRecentOrders(data.recentOrders);
        }

        // 更新系统活动
        if (data.activities) {
            this.updateActivities(data.activities);
        }
    },

    updateStatsCards: function(stats) {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const statType = card.classList[1]; // primary, success, etc.
            const valueElement = card.querySelector('.stat-value');
            const trendElement = card.querySelector('.stat-trend');

            if (statType === 'primary' && stats.totalOrders !== undefined) {
                valueElement.textContent = AdminUtils.formatNumber(stats.totalOrders);
            } else if (statType === 'success' && stats.totalRevenue !== undefined) {
                valueElement.textContent = AdminUtils.formatCurrency(stats.totalRevenue);
            } else if (statType === 'warning' && stats.newUsers !== undefined) {
                valueElement.textContent = AdminUtils.formatNumber(stats.newUsers);
            } else if (statType === 'danger' && stats.lowStockProducts !== undefined) {
                valueElement.textContent = AdminUtils.formatNumber(stats.lowStockProducts);
            }

            // 更新趋势（这里使用模拟数据）
            if (trendElement) {
                const trend = Math.random() > 0.5 ? 'up' : 'down';
                const percentage = (Math.random() * 15).toFixed(1);
                trendElement.className = `stat-trend trend-${trend}`;
                trendElement.innerHTML = `
                    <i class="fas fa-arrow-${trend}"></i>
                    ${percentage}% 较昨日
                `;
            }
        });
    },

    updateRecentOrders: function(orders) {
        const tbody = document.querySelector('.table tbody');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.orderNumber}</td>
                <td>${order.customerName}</td>
                <td>${AdminUtils.formatDate(order.createdAt)}</td>
                <td>${AdminUtils.formatCurrency(order.totalAmount)}</td>
                <td><span class="status status-${order.status}">${this.getStatusText(order.status)}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="DashboardManager.viewOrder('${order.id}')">
                        查看
                    </button>
                </td>
            </tr>
        `).join('');
    },

    updateActivities: function(activities) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        activityList.innerHTML = activities.map(activity => `
            <li class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${AdminUtils.formatDate(activity.timestamp, 'MM-DD HH:mm')}</div>
                </div>
            </li>
        `).join('');
    },

    getStatusText: function(status) {
        const statusMap = {
            'pending': '待付款',
            'processing': '处理中',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    },

    getActivityIcon: function(type) {
        const iconMap = {
            'order': 'shopping-cart',
            'user': 'user-plus',
            'payment': 'credit-card',
            'system': 'cog'
        };
        return iconMap[type] || 'info';
    },

    viewOrder: function(orderId) {
        AdminUtils.showNotification(`查看订单 ${orderId}`, 'info');
        // 实际应用中这里会跳转到订单详情页
    },

    setupEventListeners: function() {
        // 日期选择器
        const dateButtons = document.querySelectorAll('.date-btn');
        dateButtons.forEach(button => {
            button.addEventListener('click', () => {
                dateButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.loadDashboardData();
            });
        });

        // 刷新按钮
        const refreshBtn = document.querySelector('.btn-outline');
        if (refreshBtn && refreshBtn.textContent.includes('刷新')) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboardData();
                AdminUtils.showNotification('数据已刷新', 'success');
            });
        }
    },

    startAutoRefresh: function() {
        if (AdminConfig.enableRealTimeUpdates) {
            setInterval(() => {
                this.loadDashboardData();
            }, AdminConfig.autoRefreshInterval);
        }
    }
};

// 商品管理
const ProductManager = {
    currentPage: 1,
    currentFilters: {},

    init: function() {
        if (!document.querySelector('.products-container')) return;

        this.loadProducts();
        this.setupEventListeners();
        this.setupSearch();
    },

    loadProducts: async function(page = 1, filters = {}) {
        this.currentPage = page;
        this.currentFilters = filters;

        const container = document.querySelector('.table-container');
        const loader = AdminUtils.showLoading(container);

        try {
            const data = await AdminAPI.getProducts(page, filters);
            this.renderProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            AdminUtils.hideLoading(loader);
        }
    },

    renderProducts: function(data) {
        const tbody = document.querySelector('.table tbody');
        if (!tbody) return;

        if (!data.products || data.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-box-open"></i>
                            <p>暂无商品数据</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.products.map(product => `
            <tr>
                <td>
                    <input type="checkbox" class="product-checkbox" value="${product.id}">
                </td>
                <td>${product.id}</td>
                <td>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-sku">SKU: ${product.sku}</div>
                    </div>
                </td>
                <td>${this.getCategoryText(product.category)}</td>
                <td>${AdminUtils.formatCurrency(product.price)}</td>
                <td>
                    <span class="stock-level ${product.stock < 10 ? 'text-danger' : ''}">
                        ${product.stock}
                    </span>
                </td>
                <td><span class="status status-${product.status}">${this.getStatusText(product.status)}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="ProductManager.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="ProductManager.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        this.updatePagination(data);
    },

    getCategoryText: function(category) {
        const categoryMap = {
            'digital': '数码产品',
            'clothing': '服装',
            'home': '家居用品',
            'beauty': '美妆护肤'
        };
        return categoryMap[category] || category;
    },

    getStatusText: function(status) {
        const statusMap = {
            'active': '上架',
            'inactive': '下架',
            'draft': '草稿'
        };
        return statusMap[status] || status;
    },

    updatePagination: function(data) {
        const pagination = document.querySelector('.pagination');
        if (!pagination || !data.pagination) return;

        const { currentPage, totalPages, totalCount } = data.pagination;
        
        let paginationHTML = '';
        
        // 上一页
        if (currentPage > 1) {
            paginationHTML += `
                <button class="pagination-btn" onclick="ProductManager.loadProducts(${currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }

        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                            onclick="ProductManager.loadProducts(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += '<span class="pagination-info">...</span>';
            }
        }

        // 下一页
        if (currentPage < totalPages) {
            paginationHTML += `
                <button class="pagination-btn" onclick="ProductManager.loadProducts(${currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        paginationHTML += `<span class="pagination-info">共 ${totalCount} 条记录</span>`;
        pagination.innerHTML = paginationHTML;
    },

    setupEventListeners: function() {
        // 添加商品按钮
        const addBtn = document.getElementById('add-product-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showProductModal());
        }

        // 批量操作
        const selectAll = document.getElementById('select-all');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.product-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
            });
        }

        // 筛选器
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', () => this.applyFilters());
        });
    },

    setupSearch: function() {
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            const debouncedSearch = AdminUtils.debounce((value) => {
                this.loadProducts(1, { search: value });
            }, 500);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    },

    applyFilters: function() {
        const filters = {};
        const filterSelects = document.querySelectorAll('.filter-select');
        
        filterSelects.forEach(select => {
            if (select.value) {
                filters[select.name || select.id] = select.value;
            }
        });

        this.loadProducts(1, filters);
    },

    showProductModal: function(product = null) {
        const isEdit = !!product;
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">${isEdit ? '编辑商品' : '添加商品'}</div>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="product-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="product-name">商品名称</label>
                                <input type="text" id="product-name" class="form-control" 
                                       value="${product?.name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="product-sku">SKU</label>
                                <input type="text" id="product-sku" class="form-control" 
                                       value="${product?.sku || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="product-category">分类</label>
                                <select id="product-category" class="form-control" required>
                                    <option value="">选择分类</option>
                                    <option value="digital" ${product?.category === 'digital' ? 'selected' : ''}>数码产品</option>
                                    <option value="clothing" ${product?.category === 'clothing' ? 'selected' : ''}>服装</option>
                                    <option value="home" ${product?.category === 'home' ? 'selected' : ''}>家居用品</option>
                                    <option value="beauty" ${product?.category === 'beauty' ? 'selected' : ''}>美妆护肤</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="product-price">价格</label>
                                <input type="number" id="product-price" class="form-control" 
                                       value="${product?.price || ''}" step="0.01" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="product-stock">库存</label>
                                <input type="number" id="product-stock" class="form-control" 
                                       value="${product?.stock || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="product-status">状态</label>
                                <select id="product-status" class="form-control" required>
                                    <option value="active" ${product?.status === 'active' ? 'selected' : ''}>上架</option>
                                    <option value="inactive" ${product?.status === 'inactive' ? 'selected' : ''}>下架</option>
                                    <option value="draft" ${product?.status === 'draft' ? 'selected' : ''}>草稿</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="product-description">描述</label>
                            <textarea id="product-description" class="form-control" rows="4">${product?.description || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()">取消</button>
                    <button class="btn btn-primary" onclick="ProductManager.${isEdit ? 'update' : 'create'}Product()">
                        ${isEdit ? '更新' : '创建'}商品
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModalEvents(modal);
    },

    setupModalEvents: function(modal) {
        modal.querySelector('.close-modal').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    },

    createProduct: async function() {
        const form = document.getElementById('product-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const productData = {
            name: document.getElementById('product-name').value,
            sku: document.getElementById('product-sku').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value),
            status: document.getElementById('product-status').value,
            description: document.getElementById('product-description').value
        };

        try {
            await AdminAPI.createProduct(productData);
            AdminUtils.showNotification('商品创建成功', 'success');
            document.querySelector('.modal').remove();
            this.loadProducts(this.currentPage, this.currentFilters);
        } catch (error) {
            console.error('Failed to create product:', error);
        }
    },

    editProduct: async function(id) {
        try {
            // 这里应该调用获取单个商品的API
            const product = { id, name: '示例商品', sku: 'SKU001', category: 'digital', price: 999, stock: 50, status: 'active', description: '示例描述' };
            this.showProductModal(product);
        } catch (error) {
            console.error('Failed to load product:', error);
        }
    },

    updateProduct: async function() {
        // 实现更新商品的逻辑
        AdminUtils.showNotification('商品更新功能开发中', 'info');
    },

    deleteProduct: async function(id) {
        const confirmed = await AdminUtils.confirm('确定要删除这个商品吗？此操作不可恢复。', '删除商品');
        if (!confirmed) return;

        try {
            await AdminAPI.deleteProduct(id);
            AdminUtils.showNotification('商品删除成功', 'success');
            this.loadProducts(this.currentPage, this.currentFilters);
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    }
};

// 用户管理
const UserManager = {
    init: function() {
        if (!document.querySelector('.users-container')) return;
        this.setupEventListeners();
    }
};

// 备份管理
const BackupManager = {
    init: function() {
        if (!document.querySelector('.backup-container')) return;
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        // 创建备份
        const createBtn = document.getElementById('create-backup-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateBackupModal());
        }

        // 恢复备份
        const restoreBtn = document.getElementById('restore-backup-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => this.showRestoreBackupModal());
        }

        // 备份计划
        const scheduleBtn = document.getElementById('schedule-backup-btn');
        if (scheduleBtn) {
            scheduleBtn.addEventListener('click', () => this.showScheduleBackupModal());
        }
    },

    showCreateBackupModal: function() {
        AdminUtils.showNotification('备份创建功能开发中', 'info');
    },

    showRestoreBackupModal: function() {
        AdminUtils.showNotification('备份恢复功能开发中', 'info');
    },

    showScheduleBackupModal: function() {
        AdminUtils.showNotification('备份计划功能开发中', 'info');
    }
};

// 主初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有管理器
    DashboardManager.init();
    ProductManager.init();
    UserManager.init();
    BackupManager.init();

    // 全局事件监听
    setupGlobalEvents();

    // 开发模式日志
    if (AdminConfig.debugMode) {
        console.log('Admin system initialized');
    }
});

// 全局事件设置
function setupGlobalEvents() {
    // 模态框关闭事件
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-modal') || e.target.classList.contains('modal')) {
            e.target.closest('.modal').remove();
        }
    });

    // 键盘事件
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => modal.remove());
        }
    });

    // 表单提交阻止默认行为
    document.addEventListener('submit', function(e) {
        if (e.target.tagName === 'FORM') {
            e.preventDefault();
        }
    });
}

// 多假几倍///
// 获取所有用户
const users = UserManager.getAllUsers();

// 搜索用户
const searchResults = UserManager.searchUsers('张');

// 更新产品状态
ProductManager.toggleProductStatus('prod_1');

// 获取订单统计
const stats = OrderManager.getOrderStats();

// 导出到全局作用域
window.AdminUtils = AdminUtils;
window.AdminAPI = AdminAPI;
window.DashboardManager = DashboardManager;
window.ProductManager = ProductManager;
window.UserManager = UserManager;
window.BackupManager = BackupManager;