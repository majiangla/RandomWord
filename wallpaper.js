// 壁纸管理模块
class WallpaperManager {
	constructor() {
		this.currentWallpaperUrl = '';
		this.currentThemeColor = CONSTANTS.DEFAULT_THEME_COLOR;
		this.isChangingBg = false;
		this.wallPaperSources = JSON.parse(JSON.stringify(CONSTANTS.WALLPAPER_SOURCES));
	}
	
	// 获取图片平均颜色
	getImageAverageColor(img) {
		try {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = 50;
			canvas.height = 50;
			
			ctx.drawImage(img, 0, 0, 50, 50);
			
			const imageData = ctx.getImageData(0, 0, 50, 50);
			const data = imageData.data;
			
			let r = 0, g = 0, b = 0;
			const pixelCount = 50 * 50;
			
			for (let i = 0; i < data.length; i += 4) {
				r += data[i];
				g += data[i + 1];
				b += data[i + 2];
			}
			
			r = Math.floor(r / pixelCount);
			g = Math.floor(g / pixelCount);
			b = Math.floor(b / pixelCount);
			
			Logger.log(`提取平均颜色: RGB(${r}, ${g}, ${b})`);
			return { r, g, b };
		} catch (error) {
			Logger.logError(`获取平均颜色失败: ${error.message}`);
			return null;
		}
	}
	
	// 应用主题颜色到所有元素
	applyThemeColor(color) {
		if (!color) {
			Logger.log('保持当前主题颜色不变');
			return;
		}
		
		const adjustedColor = Utils.ensureContrastWithWhite(color.r, color.g, color.b);
		this.currentThemeColor = adjustedColor;
		
		const textColor = Utils.getTextColorBasedOnBackground(adjustedColor.r, adjustedColor.g, adjustedColor.b);
		const primaryColor = `rgb(${adjustedColor.r}, ${adjustedColor.g}, ${adjustedColor.b})`;
		const secondaryColor = `rgba(${adjustedColor.r}, ${adjustedColor.g}, ${adjustedColor.b}, 0.8)`;
		const thirdColor = `rgba(${adjustedColor.r}, ${adjustedColor.g}, ${adjustedColor.b}, 0.4)`;
		
		document.documentElement.style.setProperty('--primary-color', primaryColor);
		document.documentElement.style.setProperty('--secondary-color', secondaryColor);
		document.documentElement.style.setProperty('--third-color', thirdColor);
		document.documentElement.style.setProperty('--text-color', textColor);
		
		const whiteContrast = Utils.getContrastRatio(adjustedColor.r, adjustedColor.g, adjustedColor.b, 255, 255, 255);
		Logger.log(`应用主题颜色: RGB(${adjustedColor.r}, ${adjustedColor.g}, ${adjustedColor.b}), 文字颜色: ${textColor}, 与白色对比度: ${whiteContrast.toFixed(2)}`);
	}
	
	// 更新壁纸源选择
	updateWallpaperSources(internationalChecked, chineseChecked) {
		this.wallPaperSources.international.enabled = internationalChecked;
		this.wallPaperSources.chinese.enabled = chineseChecked;
		
		if (!internationalChecked && !chineseChecked) {
			this.wallPaperSources.chinese.enabled = true;
			Logger.log('已自动选择中国版壁纸（必须至少选择一个）');
			return true; // 表示需要更新UI
		}
		return false;
	}
	
	// 解析壁纸数据
	parseMarkdownForWallpapers(markdown) {
		const wallpapers = [];
		const regex = /!\[.*?\]\((.*?)\)(\d{4}-\d{2}-\d{2}) \[download 4k\]\((.*?)\)/g;
		let match;
		
		while ((match = regex.exec(markdown)) !== null) {
			const fullUrl = match[3];
			if (fullUrl && fullUrl.startsWith('http')) {
				wallpapers.push({ url: fullUrl });
			}
		}
		
		return wallpapers;
	}
	
	// 获取随机壁纸
	async setRandomBingBackground() {
		if (this.isChangingBg) return;
		
		this.isChangingBg = true;
		
		try {
			Logger.log('正在获取壁纸...');
			
			const enabledSources = [];
			if (this.wallPaperSources.international.enabled) enabledSources.push('international');
			if (this.wallPaperSources.chinese.enabled) enabledSources.push('chinese');
			
			if (enabledSources.length === 0) {
				Logger.logError('未选择壁纸源');
				this.isChangingBg = false;
				return;
			}
			
			const randomSource = enabledSources[Math.floor(Math.random() * enabledSources.length)];
			const source = this.wallPaperSources[randomSource];
			const isChinese = randomSource === 'chinese';
			
			let githubUrl = '';
			const now = new Date();
			const currentYear = now.getFullYear();
			const currentMonth = now.getMonth() + 1;
			
			if (isChinese) {
				let randomYear, randomMonth;
				if (currentYear === source.startYear) {
					randomMonth = Math.floor(Math.random() * (currentMonth - source.startMonth + 1)) + source.startMonth;
					randomYear = currentYear;
				} else {
					const totalMonths = (currentYear - source.startYear) * 12 + currentMonth - source.startMonth;
					const randomOffset = Math.floor(Math.random() * (totalMonths + 1));
					randomYear = source.startYear + Math.floor(randomOffset / 12);
					randomMonth = source.startMonth + (randomOffset % 12);
					
					if (randomYear === currentYear && randomMonth > currentMonth) {
						randomMonth = currentMonth;
					}
				}
				
				githubUrl = `https://raw.githubusercontent.com/niumoo/bing-wallpaper/refs/heads/main/zh-cn/picture/${randomYear}-${String(randomMonth).padStart(2, '0')}/README.md`;
			} else {
				const randomYear = Math.floor(Math.random() * (currentYear - source.startYear + 1)) + source.startYear;
				let randomMonth;
				if (randomYear === source.startYear) {
					randomMonth = Math.floor(Math.random() * (12 - source.startMonth + 1)) + source.startMonth;
				} else if (randomYear === currentYear) {
					randomMonth = Math.floor(Math.random() * currentMonth) + 1;
				} else {
					randomMonth = Math.floor(Math.random() * 12) + 1;
				}
				
				githubUrl = `https://raw.githubusercontent.com/niumoo/bing-wallpaper/refs/heads/main/picture/${randomYear}-${String(randomMonth).padStart(2, '0')}/README.md`;
			}
			
			Logger.log(`请求壁纸数据: ${githubUrl}`);
			const response = await fetch(githubUrl, { cache: 'no-cache' });
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			
			const markdownContent = await response.text();
			const wallpapers = this.parseMarkdownForWallpapers(markdownContent);
			
			if (wallpapers.length > 0) {
				const randomIndex = Math.floor(Math.random() * wallpapers.length);
				const selectedWallpaper = wallpapers[randomIndex];
				this.currentWallpaperUrl = selectedWallpaper.url;
				
				const img = new Image();
				img.crossOrigin = "anonymous";
				
				img.onload = () => {
					try {
						const avgColor = this.getImageAverageColor(img);
						if (avgColor) {
							this.applyThemeColor(avgColor);
						} else {
							Logger.logError('无法获取平均颜色，保持当前主题');
						}
					} catch (e) {
						Logger.logError(`更新主题颜色失败: ${e.message}`);
					}
					
					this.applyWallpaperTransition(selectedWallpaper.url);
				};
				
				img.onerror = () => {
					Logger.logError('壁纸加载失败，保持当前背景和主题');
					this.isChangingBg = false;
				};
				
				img.src = selectedWallpaper.url;
			} else {
				Logger.logError('未找到壁纸数据，保持当前背景和主题');
				this.isChangingBg = false;
			}
			
		} catch (error) {
			Logger.logError(`设置随机壁纸失败: ${error.message}`);
			this.isChangingBg = false;
		}
	}
	
	// 应用壁纸过渡
	applyWallpaperTransition(url) {
		const currentBg = document.getElementById('current-bg');
		const newBg = document.getElementById('new-bg');
		
		newBg.style.backgroundImage = `url('${url}')`;
		newBg.classList.remove('fade-in');
		void newBg.offsetWidth;
		newBg.classList.add('fade-in');
		newBg.style.opacity = '1';
		
		setTimeout(() => {
			currentBg.style.backgroundImage = newBg.style.backgroundImage;
			
			setTimeout(() => {
				newBg.style.opacity = '0';
				newBg.style.backgroundImage = '';
				Logger.logWallpaper(this.currentWallpaperUrl);
				this.isChangingBg = false;
			}, 100);
		}, 200);
	}
	
	// 下载当前壁纸
	async downloadCurrentWallpaper() {
		if (!this.currentWallpaperUrl) {
			Logger.logError('无当前壁纸可下载');
			return;
		}
		
		try {
			Logger.log('开始下载当前壁纸...');
			const response = await fetch(this.currentWallpaperUrl);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `bing-wallpaper-${new Date().toISOString().slice(0,10)}.jpg`;
			
			document.body.appendChild(a);
			a.click();
			
			setTimeout(() => {
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			}, 100);
			
			Logger.logSuccess('壁纸下载完成');
		} catch (error) {
			Logger.logError(`壁纸下载失败: ${error.message}`);
		}
	}
}