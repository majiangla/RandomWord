// 常量定义
const CONSTANTS = {
	// 默认壁纸切换间隔
	DEFAULT_BG_INTERVAL: 10,
	
	// 默认自动模式间隔（秒）
	DEFAULT_AUTO_INTERVAL: 20,
	
	// 默认自动模式状态
	DEFAULT_AUTO_MODE: true,
	
	// 默认卡片动画状态
	DEFAULT_CARD_ANIMATION: false,
	
	// 预定义的词书文件名
	PREDEFINED_BOOKS: [
		'高中.csv',
		'四级.csv'
	],
	
	// 壁纸源配置
	WALLPAPER_SOURCES: {
		international: {
			enabled: true,
			startYear: 2021,
			startMonth: 2,
			startDate: 1
		},
		chinese: {
			enabled: true,
			startYear: 2023,
			startMonth: 2,
			startDate: 4
		}
	},
	
	// 默认主题颜色
	DEFAULT_THEME_COLOR: { r: 0, g: 174, b: 239 },
	
	// 最小颜色对比度（WCAG标准）
	MIN_CONTRAST_RATIO: 5,
	
	// 颜色加深步长
	COLOR_DARKEN_STEP: 20,
	
	// 最大颜色加深迭代次数
	MAX_COLOR_ITERATIONS: 20,
	
	// 存储键名
	STORAGE_KEYS: {
		WORD_ENTRIES: 'majiang_word_entries',
		CURRENT_INDEX: 'majiang_current_index',
		CURRENT_BOOK: 'majiang_current_book',
		CLICK_COUNT: 'majiang_click_count',
		SETTINGS: 'majiang_settings',
		IMPORTED_BOOKS: 'majiang_imported_books',
		IMPORTED_BOOK_CONTENTS: 'majiang_imported_book_contents'
	}
};