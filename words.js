// 单词管理模块
class WordManager {
	constructor() {
		this.entries = [];
		this.currentIndex = -1;
		this.currentBook = '';
		this.importedBooks = [];
		this.importedBookContents = {};
		this.loadFromStorage();
	}
	
	// 从存储加载
	loadFromStorage() {
		this.entries = Utils.getStorage(CONSTANTS.STORAGE_KEYS.WORD_ENTRIES, []);
		this.currentIndex = Utils.getStorage(CONSTANTS.STORAGE_KEYS.CURRENT_INDEX, -1);
		this.currentBook = Utils.getStorage(CONSTANTS.STORAGE_KEYS.CURRENT_BOOK, '');
		this.importedBooks = Utils.getStorage(CONSTANTS.STORAGE_KEYS.IMPORTED_BOOKS, []);
		this.importedBookContents = Utils.getStorage(CONSTANTS.STORAGE_KEYS.IMPORTED_BOOK_CONTENTS, {});
	}
	
	// 保存到存储
	saveToStorage() {
		Utils.setStorage(CONSTANTS.STORAGE_KEYS.WORD_ENTRIES, this.entries);
		Utils.setStorage(CONSTANTS.STORAGE_KEYS.CURRENT_INDEX, this.currentIndex);
		Utils.setStorage(CONSTANTS.STORAGE_KEYS.CURRENT_BOOK, this.currentBook);
		Utils.setStorage(CONSTANTS.STORAGE_KEYS.IMPORTED_BOOKS, this.importedBooks);
		Utils.setStorage(CONSTANTS.STORAGE_KEYS.IMPORTED_BOOK_CONTENTS, this.importedBookContents);
	}
	
	// 处理文件选择
	async handleFileSelect(file, fileName) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			
			reader.readAsText(file, 'UTF-8');
			
			reader.onload = (e) => {
				try {
					const content = e.target.result;
					const newEntries = Utils.parseCSV(content);
					
					if (newEntries.length > 0) {
						this.entries = newEntries;
						this.currentIndex = -1;
						
						// 添加到导入的词书记录
						if (fileName) {
							if (!this.importedBooks.includes(fileName)) {
								this.importedBooks.push(fileName);
							}
							// 保存导入词书的内容，便于切换
							this.importedBookContents[fileName] = newEntries;
							this.saveToStorage();
						}
						
						Logger.logSuccess(`成功导入 ${this.entries.length} 个单词`);
						resolve(true);
					} else {
						Logger.logError('CSV文件格式不正确，未找到有效单词');
						resolve(false);
					}
				} catch (error) {
					console.error('文件解析错误:', error);
					Logger.logError('文件解析失败，请检查文件格式');
					reject(error);
				}
			};
			
			reader.onerror = () => {
				Logger.logError('文件读取失败');
				reject(new Error('文件读取失败'));
			};
		});
	}
	
	// 尝试自动加载预定义词书
	async tryAutoLoad() {
		const availableBooks = [];
		
		// 检查预定义词书
		for (const bookName of CONSTANTS.PREDEFINED_BOOKS) {
			try {
				const exists = await Utils.checkFileExists(bookName);
				if (exists) {
					availableBooks.push(bookName);
				}
			} catch (err) {
				// 忽略错误，继续检查下一个
			}
		}
		
		// 如果有可用的词书，加载第一个
		if (availableBooks.length > 0) {
			await this.loadBookFromUrl(availableBooks[0]);
			return true;
		}
		
		// 如果没有预定义词书，检查本地存储中的词书
		if (this.entries.length > 0) {
			Logger.log(`已加载本地存储中的词书，共 ${this.entries.length} 个单词`);
			return true;
		}
		
		return false;
	}
	
	// 从URL加载词书
	async loadBookFromUrl(url) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			
			const buf = await res.arrayBuffer();
			const text = Utils.tryDecode(buf);
			this.entries = Utils.parseCSV(text);
			this.currentIndex = -1;
			
			Logger.logSuccess(`已加载 ${url}，共 ${this.entries.length} 条记录`);
			return true;
		} catch (err) {
			Logger.logError(`加载词书 ${url} 失败: ${err.message}`);
			return false;
		}
	}

	// 从已导入的本地词书加载（保存在 localStorage 中）
	async loadImportedBook(name) {
		if (this.importedBookContents && this.importedBookContents[name]) {
			this.entries = this.importedBookContents[name];
			this.currentIndex = -1;
			this.saveToStorage();
			Logger.logSuccess(`已加载本地导入词书 ${name}，共 ${this.entries.length} 条记录`);
			return true;
		} else {
			Logger.logError(`未找到已导入的词书: ${name}`);
			return false;
		}
	}
	
	// 显示随机单词
	showRandom() {
		if (!this.entries.length) {
			return {
				word: '无单词',
				meaning: '请导入 CSV 文件'
			};
		}
		
		let i = Math.floor(Math.random() * this.entries.length);
		this.currentIndex = i;
		const entry = this.entries[i];
		
		return {
			word: entry.word,
			meaning: entry.meaning
		};
	}
	
	// 获取词书列表
	getBookList() {
		const books = [];
		
		// 添加预定义词书（需要前端检查）
		CONSTANTS.PREDEFINED_BOOKS.forEach(book => {
			books.push({
				name: book,
				type: 'predefined'
			});
		});
		
		// 添加上传的词书
		this.importedBooks.forEach(book => {
			books.push({
				name: book,
				type: 'imported'
			});
		});
		
		return books;
	}
	
	// 清空单词
	clearWords() {
		this.entries = [];
		this.currentIndex = -1;
		this.currentBook = '';
		this.saveToStorage();
	}
}