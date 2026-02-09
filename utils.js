// 工具函数模块
class Utils {
	// 计算RGB颜色的相对亮度（WCAG公式）
	static getRelativeLuminance(r, g, b) {
		const sRGB = [r/255, g/255, b/255].map(c => {
			return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
	}
	
	// 计算两个颜色之间的对比度（WCAG 2.1公式）
	static getContrastRatio(r1, g1, b1, r2, g2, b2) {
		const L1 = this.getRelativeLuminance(r1, g1, b1);
		const L2 = this.getRelativeLuminance(r2, g2, b2);
		return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
	}
	
	// 确保颜色与白色有足够的对比度
	static ensureContrastWithWhite(r, g, b) {
		let currentR = r;
		let currentG = g;
		let currentB = b;
		
		const white = [255, 255, 255];
		let contrast = this.getContrastRatio(currentR, currentG, currentB, white[0], white[1], white[2]);
		
		let iterations = 0;
		
		while (contrast < CONSTANTS.MIN_CONTRAST_RATIO && iterations < CONSTANTS.MAX_COLOR_ITERATIONS) {
			currentR = Math.max(0, currentR - CONSTANTS.COLOR_DARKEN_STEP);
			currentG = Math.max(0, currentG - CONSTANTS.COLOR_DARKEN_STEP);
			currentB = Math.max(0, currentB - CONSTANTS.COLOR_DARKEN_STEP);
			
			contrast = this.getContrastRatio(currentR, currentG, currentB, white[0], white[1], white[2]);
			iterations++;
			
			Logger.log(`加深颜色迭代 ${iterations}: RGB(${currentR}, ${currentG}, ${currentB}), 对比度: ${contrast.toFixed(2)}`);
		}
		
		if (iterations > 0) {
			Logger.log(`颜色已加深，最终对比度: ${contrast.toFixed(2)}`);
		}
		
		return { r: currentR, g: currentG, b: currentB };
	}
	
	// 根据背景亮度计算文字颜色
	static getTextColorBasedOnBackground(r, g, b) {
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		return brightness > 180 ? '#333333' : '#ffffff';
	}
	
	// 解析CSV行字段
	static parseCSVLineFields(line) {
		const fields = [];
		let currentField = '';
		let inQuotes = false;
		let escapeNext = false;
		
		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			
			if (escapeNext) {
				currentField += char;
				escapeNext = false;
			} else if (char === '\\') {
				escapeNext = true;
			} else if (char === '"') {
				if (inQuotes && line[i + 1] === '"') {
					currentField += '"';
					i++;
				} else {
					inQuotes = !inQuotes;
				}
			} else if (char === ',' && !inQuotes) {
				fields.push(currentField);
				currentField = '';
			} else {
				currentField += char;
			}
		}
		
		fields.push(currentField);
		return fields;
	}
	
	// 处理CSV单行
	static processCSVLine(line, out) {
		line = line.trim();
		if (!line || /^(Unit|必修|选修)/i.test(line)) return;
		
		let fields = this.parseCSVLineFields(line);
		
		if (fields.length >= 2) {
			let word = fields[0].trim();
			let meaning = fields[1].trim();
			
			if (!word || /[\u4e00-\u9fff]/.test(word) || word.length > 60) return;
			
			if (meaning.startsWith('"') && meaning.endsWith('"')) {
				meaning = meaning.slice(1, -1);
				meaning = meaning.replace(/""/g, '"');
			}
			
			out.push({ word, meaning });
		}
	}
	
	// 解析完整的CSV
	static parseCSV(text) {
		const out = [];
		let lines = text.split(/\r?\n/);
		let currentLine = '';
		let inQuotes = false;
		
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			let quoteCount = (line.match(/"/g) || []).length;
			
			if (inQuotes || quoteCount % 2 === 1) {
				currentLine += (currentLine ? '\n' : '') + line;
				if (quoteCount % 2 === 1) {
					inQuotes = !inQuotes;
				}
			} else {
				if (currentLine) {
					this.processCSVLine(currentLine, out);
					currentLine = '';
				}
				currentLine = line;
			}
		}
		
		if (currentLine) {
			this.processCSVLine(currentLine, out);
		}
		
		return out;
	}
	
	// 尝试解码CSV
	static tryDecode(buffer) {
		const codecs = ['utf-8', 'gb2312', 'gbk'];
		for (const c of codecs) {
			try {
				const dec = new TextDecoder(c);
				const s = dec.decode(buffer);
				if (/[,A-Za-z]/.test(s)) return s;
			} catch (e) {
				// 继续尝试下一个编码
			}
		}
		try {
			return new TextDecoder('utf-8').decode(buffer);
		} catch (e) {
			return '';
		}
	}
	
	// 获取本地存储的数据
	static getStorage(key, defaultValue = null) {
		try {
			const data = localStorage.getItem(key);
			return data ? JSON.parse(data) : defaultValue;
		} catch (e) {
			Logger.logError(`读取存储失败: ${e.message}`);
			return defaultValue;
		}
	}
	
	// 设置本地存储的数据
	static setStorage(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (e) {
			Logger.logError(`保存存储失败: ${e.message}`);
		}
	}
	
	// 检查文件是否存在
	static async checkFileExists(url) {
		try {
			const response = await fetch(url, { method: 'HEAD' });
			return response.ok;
		} catch {
			return false;
		}
	}
}