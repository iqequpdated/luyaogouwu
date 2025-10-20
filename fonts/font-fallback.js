// fonts/font-fallback.js - 字体加载和回退处理

class FontManager {
    constructor() {
        this.fontsLoaded = new Set();
        this.fallbackUsed = false;
        this.init();
    }

    init() {
        this.setupFontLoading();
        this.setupPerformanceMonitoring();
    }

    // 设置字体加载监听
    setupFontLoading() {
        if ('fonts' in document) {
            // 检查 MyCustomFont 是否加载成功
            document.fonts.ready.then(() => {
                this.checkFontStatus();
            });

            // 监听字体加载状态
            document.fonts.addEventListener('loading', (event) => {
                console.log('字体加载中:', event.fontface.family);
            });

            document.fonts.addEventListener('loadingdone', (event) => {
                event.fontfaces.forEach(fontface => {
                    if (fontface.family === 'MyCustomFont') {
                        this.fontsLoaded.add('MyCustomFont');
                        console.log('自定义字体加载成功');
                    }
                });
            });

            document.fonts.addEventListener('loadingerror', (event) => {
                console.warn('字体加载失败:', event.fontface.family);
                this.handleFontLoadError(event.fontface.family);
            });
        }
    }

    // 检查字体状态
    async checkFontStatus() {
        try {
            // 检查 MyCustomFont 是否可用
            await document.fonts.load('1rem MyCustomFont');
            this.fontsLoaded.add('MyCustomFont');
            console.log('MyCustomFont 可用');
        } catch (error) {
            console.warn('MyCustomFont 不可用，使用回退字体');
            this.activateFallbackMode();
        }
    }

    // 处理字体加载失败
    handleFontLoadError(fontFamily) {
        if (fontFamily === 'MyCustomFont') {
            this.activateFallbackMode();
        }
    }

    // 激活回退模式
    activateFallbackMode() {
        this.fallbackUsed = true;
        
        // 添加回退样式
        const style = document.createElement('style');
        style.id = 'font-fallback-styles';
        style.textContent = `
            .font-custom,
            .brand-font,
            .logo-type {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                           'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 
                           'Helvetica Neue', Helvetica, Arial, sans-serif;
            }
            
            /* 调整回退字体的字距和大小 */
            .brand-font {
                letter-spacing: -0.01em;
            }
            
            .logo-type {
                letter-spacing: 0.02em;
                font-weight: 700;
            }
        `;
        document.head.appendChild(style);

        // 发送分析事件
        this.trackFontFallback();
    }

    // 性能监控
    setupPerformanceMonitoring() {
        // 监控字体加载性能
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.name.includes('font')) {
                        console.log('字体加载性能:', entry);
                    }
                });
            });

            observer.observe({ entryTypes: ['resource'] });
        }
    }

    // 跟踪字体回退使用
    trackFontFallback() {
        // 可以发送到分析服务
        if (typeof gtag !== 'undefined') {
            gtag('event', 'font_fallback_used', {
                'event_category': 'performance',
                'event_label': 'MyCustomFont'
            });
        }
    }

    // 手动预加载字体
    async preloadFonts() {
        const fontUrls = [
            './fonts/MyCustomFont.woff2',
            './fonts/MyCustomFont.woff'
        ];

        for (const url of fontUrls) {
            try {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'font';
                link.href = url;
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            } catch (error) {
                console.warn('字体预加载失败:', url, error);
            }
        }
    }

    // 获取字体状态
    getStatus() {
        return {
            customFontLoaded: this.fontsLoaded.has('MyCustomFont'),
            usingFallback: this.fallbackUsed,
            supportedFormats: this.getSupportedFormats()
        };
    }

    // 检测支持的字体格式
    getSupportedFormats() {
        const formats = [];
        const testStrings = {
            woff2: 'url("data:font/woff2;base64,") format("woff2")',
            woff: 'url("data:font/woff;base64,") format("woff")',
            ttf: 'url("data:font/ttf;base64,") format("truetype")'
        };

        const style = document.createElement('style');
        document.head.appendChild(style);

        for (const [format, testString] of Object.entries(testStrings)) {
            try {
                const sheet = style.sheet;
                const rule = `@font-face { font-family: "TestFont"; src: ${testString}; }`;
                sheet.insertRule(rule, 0);
                formats.push(format);
                sheet.deleteRule(0);
            } catch (e) {
                // 格式不支持
            }
        }

        document.head.removeChild(style);
        return formats;
    }
}

// 初始化字体管理器
document.addEventListener('DOMContentLoaded', () => {
    window.fontManager = new FontManager();
    
    // 在慢速网络上预加载字体
    if (navigator.connection) {
        const connection = navigator.connection;
        if (connection.effectiveType !== 'slow-2g' && connection.effectiveType !== '2g') {
            window.fontManager.preloadFonts();
        }
    }
});

// 导出供模块化使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FontManager;
}