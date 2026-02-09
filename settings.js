// 设置管理模块
class SettingsManager {
	constructor(wordManager, wallpaperManager) {
		this.wordManager = wordManager;
		this.wallpaperManager = wallpaperManager;
		
		// 设置状态
		this.settings = {
			showWord: true,
			showMeaning: true,
			cardAnimation: true,
			autoMode: CONSTANTS.DEFAULT_AUTO_MODE,
			autoInterval: CONSTANTS.DEFAULT_AUTO_INTERVAL,
			bgInterval: CONSTANTS.DEFAULT_BG_INTERVAL,
			internationalWallpaper: true,
			chineseWallpaper: true
		};
		
		// 自动模式相关
		this.autoModeTimer = null;
		this.clickCount = 0;
		
		this.loadFromStorage();
	}
	
	// 从存储加载设置
	loadFromStorage() {
		const savedSettings = Utils.getStorage(CONSTANTS.STORAGE_KEYS.SETTINGS, {});
		this.settings = { ...this.settings, ...savedSettings };
		this.clickCount = Utils.getStorage(CONSTANTS.STORAGE_KEYS.CLICK_COUNT, 0);
	}
	
	// 保存设置到存储
	saveSettings() {
		Utils.setStorage(CONSTANTS.STORAGE_KEYS.SETTINGS, this.settings);
		Utils.setStorage(CONSTANTS.STORAGE_KEYS.CLICK_COUNT, this.clickCount);
	}
	
	// 初始化UI元素
	initUIElements() {
		// 获取DOM元素
		this.elements = {
			wordEl: document.getElementById('word'),
			meaningEl: document.getElementById('meaning'),
			card: document.getElementById('card'),
			cardContainer: document.getElementById('card-container'),
			settingsBtn: document.getElementById('settings-btn'),
			settingsMenu: document.getElementById('settings-menu'),
			bookSelectDropdown: document.getElementById('book-select-dropdown'),
			fileInput: document.getElementById('fileInput'),
			uploadBtn: document.getElementById('upload-btn'),
			downloadBgBtn: document.getElementById('download-bg-btn')
		};
		
		// 初始化复选框和输入框
		this.initCheckboxes();
		this.initInputs();
		this.initEventListeners();
		this.populateBookSelect();
		
		// 初始化自动模式状态
		if (this.settings.autoMode) {
			this.startAutoMode();
		}
		
		// 更新当前加载的词书名称显示
		this.updateCurrentBookDisplay();
	}
	
	// 初始化复选框
	initCheckboxes() {
		const checkboxes = [
			{ id: 'show-word', prop: 'showWord' },
			{ id: 'show-meaning', prop: 'showMeaning' },
			{ id: 'card-animation', prop: 'cardAnimation' },
			{ id: 'auto-mode', prop: 'autoMode' },
			{ id: 'international-wallpaper', prop: 'internationalWallpaper' },
			{ id: 'chinese-wallpaper', prop: 'chineseWallpaper' }
		];
		
		checkboxes.forEach(({ id, prop }) => {
			const element = document.getElementById(id);
			if (element) {
				element.checked = this.settings[prop];
				element.addEventListener('change', (e) => {
					this.settings[prop] = e.target.checked;
					this.saveSettings();
					
					if (prop === 'autoMode') {
						this.toggleAutoMode(e.target.checked);
					}
					
					if (['internationalWallpaper', 'chineseWallpaper'].includes(prop)) {
						const needsUpdate = this.wallpaperManager.updateWallpaperSources(
							this.settings.internationalWallpaper,
							this.settings.chineseWallpaper
						);
						if (needsUpdate) {
							document.getElementById('chinese-wallpaper').checked = true;
						}
					}
					
					// 如果用户切换了显示相关的复选框，立即更新当前卡片显示
					if (['showWord', 'showMeaning', 'cardAnimation'].includes(prop)) {
						let currentWord = this.elements.wordEl ? this.elements.wordEl.textContent : '';
						let currentMeaning = '';
						const idx = this.wordManager.currentIndex;
						if (idx >= 0 && this.wordManager.entries[idx]) {
							currentWord = this.wordManager.entries[idx].word;
							currentMeaning = this.wordManager.entries[idx].meaning;
						} else if (this.elements.meaningEl) {
							currentMeaning = this.elements.meaningEl.innerHTML;
						}
						this.updateDisplay(currentWord, currentMeaning);
					}
				});
			}
		});
	}
	
	// 初始化输入框
	initInputs() {
		const inputs = [
			{ id: 'auto-interval', prop: 'autoInterval', min: 1, max: 300 },
			{ id: 'bg-interval', prop: 'bgInterval', min: 1, max: 100 }
		];
		
		inputs.forEach(({ id, prop, min, max }) => {
			const element = document.getElementById(id);
			if (element) {
				element.value = this.settings[prop];
				element.min = min;
				element.max = max;
				
				element.addEventListener('change', (e) => {
					let value = parseInt(e.target.value);
					value = Math.max(min, Math.min(max, value));
					this.settings[prop] = value;
					this.saveSettings();
					Logger.log(`${prop} 已更新为: ${value}`);
					
					if (prop === 'autoInterval' && this.settings.autoMode) {
						this.restartAutoMode();
					}
				});
			}
		});
	}
	
	// 初始化事件监听器
	initEventListeners() {
		// 设置按钮点击
		this.elements.settingsBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			this.elements.settingsMenu.classList.toggle('show');
		});
		
		// 上传按钮点击
		const uploadBtn = document.getElementById('upload-btn');
		if (uploadBtn) {
			uploadBtn.addEventListener('click', () => {
				this.elements.fileInput.click();
			});
		}
		
		// 文件导入
		this.elements.fileInput.addEventListener('change', async (e) => {
			const file = e.target.files[0];
			if (!file) return;
			
			const success = await this.wordManager.handleFileSelect(file, file.name);
			if (success) {
				this.wordManager.currentBook = file.name;
				this.wordManager.saveToStorage();
				this.populateBookSelect();
				this.updateCurrentBookDisplay();
				window.showRandomWord(); // 调用主模块的函数
			}
			
			e.target.value = ''; // 重置文件输入
		});
		
		// 词书选择下拉框点击
		this.elements.bookSelectDropdown.addEventListener('click', (e) => {
			e.stopPropagation();
			const menu = this.elements.bookSelectDropdown.querySelector('.dropdown-menu');
			menu.classList.toggle('show');
		});

		// 下拉框选项点击事件（修复：直接监听菜单内的点击）
		const dropdownMenu = this.elements.bookSelectDropdown.querySelector('.dropdown-menu');
		dropdownMenu.addEventListener('click', async (e) => {
			const optionEl = e.target.closest('.dropdown-option');
			if (!optionEl) return;
			
			e.stopPropagation();
			
			const bookName = optionEl.getAttribute('data-value');
			if (!bookName) return;
			
			let success = false;
			
			if (CONSTANTS.PREDEFINED_BOOKS.includes(bookName) || bookName.startsWith('http')) {
				success = await this.wordManager.loadBookFromUrl(bookName);
				if (success) {
					this.wordManager.currentBook = bookName;
				}
			} else if (this.wordManager.importedBookContents && this.wordManager.importedBookContents[bookName]) {
				success = await this.wordManager.loadImportedBook(bookName);
				if (success) {
					this.wordManager.currentBook = bookName;
				}
			}
			
			if (success) {
				this.wordManager.saveToStorage();
				this.updateCurrentBookDisplay();
				window.showRandomWord();
			}
			
			// 关闭下拉菜单
			dropdownMenu.classList.remove('show');
		});

		// 文档点击事件（只处理菜单关闭）
		document.addEventListener('click', (e) => {
			// 点击外部关闭菜单
			if (!this.elements.settingsMenu.contains(e.target) && 
				!this.elements.settingsBtn.contains(e.target)) {
				this.elements.settingsMenu.classList.remove('show');
			}
			
			const dropdownMenu = this.elements.bookSelectDropdown.querySelector('.dropdown-menu');
			if (!this.elements.bookSelectDropdown.contains(e.target)) {
				if (dropdownMenu) {
					dropdownMenu.classList.remove('show');
				}
			}
		});
		
		// 下载壁纸
		this.elements.downloadBgBtn.addEventListener('click', () => {
			this.wallpaperManager.downloadCurrentWallpaper();
		});
		
		// 恢复链接点击
		const resetLink = document.getElementById('reset-link');
		if (resetLink) {
			resetLink.addEventListener('click', (e) => {
				e.preventDefault();
				this.resetAll();
			});
		}
	}
	

	

	// 更新当前加载的词书名称显示
	updateCurrentBookDisplay() {
		const currentBook = this.wordManager.currentBook;
		const trigger = this.elements.bookSelectDropdown.querySelector('.dropdown-trigger');
		if (trigger) {
			trigger.textContent = currentBook || '请选择...';
		}
	}
	
	// 填充词书选择下拉框
	populateBookSelect() {
		const dropdown = this.elements.bookSelectDropdown;
		const menu = dropdown.querySelector('.dropdown-menu');
		menu.innerHTML = '';
		
		const books = this.wordManager.getBookList();
		
		// 添加导入的词书
		const importedBooks = books.filter(book => book.type === 'imported');
		if (importedBooks.length > 0) {
			importedBooks.forEach(book => {
				const option = document.createElement('div');
				option.className = 'dropdown-option';
				option.setAttribute('data-value', book.name);
				option.innerHTML = '<img src="./Book.png" alt="Book" class="option-icon"><span class="option-text">' + book.name + '</span>';
				menu.appendChild(option);
			});
		}
		
		// 添加预定义的词书
		const predefinedBooks = books.filter(book => book.type === 'predefined');
		if (predefinedBooks.length > 0) {
			// 如果有导入的词书，添加分割线
			if (importedBooks.length > 0) {
				const divider2 = document.createElement('div');
				divider2.className = 'dropdown-divider';
				menu.appendChild(divider2);
			}
			
			predefinedBooks.forEach(book => {
				const option = document.createElement('div');
				option.className = 'dropdown-option';
				option.setAttribute('data-value', book.name);
				option.innerHTML = '<img src="./Enchanted_Book.gif" alt="Book" class="option-icon"><span class="option-text">' + book.name + '</span>';
				menu.appendChild(option);
			});
		}
	}
	
	// 更新显示控制
	updateDisplay(word, meaning) {
		// 控制单词显示
		this.elements.wordEl.style.display = this.settings.showWord ? 'block' : 'none';
		this.elements.meaningEl.style.display = this.settings.showMeaning ? 'block' : 'none';
		
		// 更新内容
		this.elements.wordEl.textContent = word;
		
		if (meaning) {
			this.elements.meaningEl.innerHTML = meaning
				.replace(/\\n/g, '\n')
				.replace(/\n/g, '<br>')
				.replace(/<br><br>/g, '<br>');
		} else {
			this.elements.meaningEl.textContent = '（无释义）';
		}
		
		// 应用动画
		if (this.settings.showWord) {
			this.elements.wordEl.classList.remove('fade-in');
			void this.elements.wordEl.offsetWidth;
			this.elements.wordEl.classList.add('fade-in');
		}
		
		if (this.settings.showMeaning) {
			this.elements.meaningEl.classList.remove('fade-in');
			void this.elements.meaningEl.offsetWidth;
			this.elements.meaningEl.classList.add('fade-in');
		}
		
		if (this.settings.cardAnimation && (this.settings.showWord || this.settings.showMeaning)) {
			this.elements.card.classList.remove('card-fade-in');
			void this.elements.card.offsetWidth;
			this.elements.card.classList.add('card-fade-in');
		}
		
		// 如果两者都不显示，隐藏整个卡片容器
		if (!this.settings.showWord && !this.settings.showMeaning) {
			this.elements.cardContainer.style.display = 'none';
		} else {
			this.elements.cardContainer.style.display = 'flex';
		}
	}
	
	// 增加点击计数
	incrementClickCount() {
		this.clickCount++;
		this.saveSettings();
		
		if (this.clickCount % this.settings.bgInterval === 0) {
			this.wallpaperManager.setRandomBingBackground();
		}
	}
	
	// 切换自动模式
	toggleAutoMode(enabled) {
		if (enabled) {
			this.startAutoMode();
			Logger.logSystem('自动模式已启用');
		} else {
			this.stopAutoMode();
			Logger.logSystem('自动模式已禁用');
		}
		
		// 同步UI复选框状态
		const autoModeCheckbox = document.getElementById('auto-mode');
		if (autoModeCheckbox) {
			autoModeCheckbox.checked = enabled;
		}
		
		// 更新设置状态
		this.settings.autoMode = enabled;
		this.saveSettings();
	}
	
	// 开始自动模式
	startAutoMode() {
		this.stopAutoMode(); // 确保没有其他定时器运行
		
		this.autoModeTimer = setInterval(() => {
			if (typeof window.showRandomWord === 'function') {
				window.showRandomWord();
			}
		}, this.settings.autoInterval * 1000);
	}
	
	// 停止自动模式
	stopAutoMode() {
		if (this.autoModeTimer) {
			clearInterval(this.autoModeTimer);
			this.autoModeTimer = null;
		}
	}
	
	// 重启自动模式
	restartAutoMode() {
		if (this.settings.autoMode) {
			this.stopAutoMode();
			this.startAutoMode();
		}
	}
	
	// 恢复所有数据并刷新页面
	resetAll() {
		if (confirm('确定要恢复所有设置和清空所有记录吗？\n这将删除所有导入的词书和点击计数。')) {
			// 停止自动模式定时器
			this.stopAutoMode();
			
			// 清空所有本地存储数据
			localStorage.clear();
			
			Logger.logSystem('所有数据已清空，正在刷新页面...');
			
			// 刷新页面
			setTimeout(() => {
				location.reload();
			}, 500);
		}
	}
}