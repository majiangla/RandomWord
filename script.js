// 主应用程序
class VocabularyApp {
	constructor() {
		// 初始化模块
		this.wordManager = new WordManager();
		this.wallpaperManager = new WallpaperManager();
		this.settingsManager = new SettingsManager(this.wordManager, this.wallpaperManager);
		
		// 全局状态
		this.isInitialized = false;
	}
	
	// 初始化应用程序
	async init() {
		if (this.isInitialized) return;
		
		// 显示启动信息
		this.showWelcomeMessage();
		
		// 初始化UI
		this.settingsManager.initUIElements();
		
		// 尝试自动加载词书
		const hasWords = await this.wordManager.tryAutoLoad();
		
		// 显示随机单词
		this.showRandomWord();
		
		// 设置壁纸
		this.wallpaperManager.setRandomBingBackground();
		
		// 设置全局事件监听
		this.setupGlobalEventListeners();
		
		this.isInitialized = true;
		Logger.log('应用程序初始化完成');
	}
	
	// 显示欢迎信息
	showWelcomeMessage() {
		console.log('====================================');
		console.log('MaJiang - 英语单词随机展示系统');
		console.log('作者: MaJiangla (Bilibili: 1431497051)');
		console.log('功能说明:');
		console.log('  • 点击页面任意位置切换单词');
		console.log('  • 每 ' + this.settingsManager.settings.bgInterval + ' 个单词切换一次壁纸');
		console.log('  • 支持导入CSV格式单词表');
		console.log('  • 支持自动模式');
		console.log('  • 支持词书选择');
		console.log('====================================');
	}
	
	// 设置全局事件监听器
	setupGlobalEventListeners() {
		// 点击页面切换单词
		document.body.addEventListener('click', (e) => {
			if (!this.settingsManager.elements.settingsMenu.contains(e.target) && 
				!this.settingsManager.elements.settingsBtn.contains(e.target)) {
				this.showRandomWord();
			}
		});
	}
	
	// 显示随机单词
	showRandomWord() {
		const entry = this.wordManager.showRandom();
		
		// 更新显示
		this.settingsManager.updateDisplay(entry.word, entry.meaning);
		
		// 记录日志
		Logger.logWord(entry.word, entry.meaning ? entry.meaning.replace(/\n/g, ' ') : '（无释义）');
		
		// 增加点击计数
		this.settingsManager.incrementClickCount();
	}
}

// 创建全局实例
let app;

// 将showRandomWord暴露为全局函数（提前定义，避免空闲检测时未定义）
window.showRandomWord = () => {
    if (app && typeof app.showRandomWord === 'function') {
        app.showRandomWord();
    }
};

// 页面加载完成后初始化
window.onload = async function() {
    app = new VocabularyApp();
    await app.init();
};