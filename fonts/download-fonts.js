// fonts/download-fonts.js - 字体文件下载助手

const FONT_CONFIGS = {
    'Inter': {
        urls: {
            'Inter-Regular': 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
            'Inter-Medium': 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
            'Inter-SemiBold': 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
            'Inter-Bold': 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
        },
        directory: 'inter'
    },
    'Material Icons': {
        urls: {
            'material-icons': 'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
        },
        directory: 'material-icons'
    }
};

class FontDownloader {
    static async downloadFonts() {
        console.log('开始下载字体文件...');
        
        for (const [fontName, config] of Object.entries(FONT_CONFIGS)) {
            console.log(`下载 ${fontName} 字体...`);
            
            for (const [variant, url] of Object.entries(config.urls)) {
                try {
                    await this.downloadFile(url, `./${config.directory}/${variant}.woff2`);
                    console.log(`✓ 下载完成: ${variant}`);
                } catch (error) {
                    console.error(`✗ 下载失败: ${variant}`, error);
                }
            }
        }
        
        console.log('字体下载完成！');
    }
    
    static async downloadFile(url, filename) {
        // 这里需要实际的下载逻辑
        // 在实际项目中，您可能需要使用 Node.js 的 fs 模块
        // 或者使用浏览器下载 API
        console.log(`模拟下载: ${url} -> ${filename}`);
        
        // 模拟下载延迟
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return true;
    }
}

// 如果是在 Node.js 环境中运行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FontDownloader;
}

// 浏览器环境使用
if (typeof window !== 'undefined') {
    window.FontDownloader = FontDownloader;
}