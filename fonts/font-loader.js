// fonts/font-loader.js - 字体加载优化

class FontLoader {
    constructor() {
        this.loadedFonts = new Set();
        this.observers = [];
    }

    // 预加载关键字体
    async preloadCriticalFonts() {
        const criticalFonts = [
            {
                name: 'Inter',
                url: './fonts/inter/Inter-Regular.woff2',
                descriptors: { weight: '400' }
            },
            {
                name: 'Inter',
                url: './fonts/inter/Inter-Medium.woff2',
                descriptors: { weight: '500' }
            }
        ];

        try {
            for (const font of criticalFonts) {
                await this.loadFont(font);
            }
            console.log('Critical fonts loaded successfully');
        } catch (error) {
            console.warn('Failed to load critical fonts:', error);
        }
    }

    // 加载单个字体
    async loadFont(fontConfig) {
        const fontFace = new FontFace(
            fontConfig.name,
            `url(${fontConfig.url})`,
            fontConfig.descriptors
        );

        try {
            const loadedFont = await fontFace.load();
            document.fonts.add(loadedFont);
            this.loadedFonts.add(fontConfig.name);
            this.notifyObservers(fontConfig.name);
            return loadedFont;
        } catch (error) {
            console.error(`Failed to load font: ${fontConfig.name}`, error);
            throw error;
        }
    }

    // 批量加载字体
    async loadFonts(fonts) {
        const loadPromises = fonts.map(font => this.loadFont(font));
        return Promise.allSettled(loadPromises);
    }

    // 检查字体是否已加载
    isFontLoaded(fontName) {
        return this.loadedFonts.has(fontName);
    }

    // 添加字体加载监听器
    addObserver(callback) {
        this.observers.push(callback);
    }

    // 通知观察者
    notifyObservers(fontName) {
        this.observers.forEach(callback => callback(fontName));
    }

    // 获取字体加载状态
    getFontStatus() {
        return {
            loaded: Array.from(this.loadedFonts),
            total: this.loadedFonts.size
        };
    }

    // 字体回退策略
    static getFontStack(primaryFont, fallbacks = []) {
        const fallbackStack = fallbacks.join(', ');
        return `"${primaryFont}", ${fallbackStack}, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    }

    // 性能监控
    static monitorFontPerformance() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.saveData) {
                return 'data-saver';
            }
            
            const effectiveType = connection.effectiveType;
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                return 'slow-connection';
            }
        }
        return 'normal';
    }
}

// 创建全局字体加载器实例
window.fontLoader = new FontLoader();

// 自动初始化字体加载
document.addEventListener('DOMContentLoaded', async () => {
    const perfStatus = FontLoader.monitorFontPerformance();
    
    if (perfStatus === 'normal') {
        // 正常网络：预加载所有字体
        await window.fontLoader.preloadCriticalFonts();
    } else if (perfStatus === 'slow-connection') {
        // 慢速网络：只加载系统字体
        console.log('Slow connection detected, using system fonts');
    } else {
        // 数据节省模式：使用系统字体
        console.log('Data saver enabled, using system fonts');
    }
});

// 导出供其他模块使用
export default FontLoader;