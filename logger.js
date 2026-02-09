// 日志模块
class Logger {
	static formatTime() {
		const now = new Date();
		return now.toLocaleTimeString('zh-CN', { 
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}
	
	static log(message, type = 'info') {
		const time = this.formatTime();
		const typePrefix = {
			info: '[INFO]',
			word: '[WORD]',
			wallpaper: '[WALL]',
			error: '[ERROR]',
			success: '[SUCCESS]',
			system: '[SYSTEM]'
		}[type] || '[INFO]';
		
		const styles = {
			info: 'color: #666;',
			word: 'color: #00AEEF; font-weight: bold;',
			wallpaper: 'color: #4CAF50;',
			error: 'color: #f44336;',
			success: 'color: #4CAF50;',
			system: 'color: #9C27B0;'
		}[type] || 'color: #666;';
		
		console.log(`%c${time} ${typePrefix} ${message}`, styles);
	}
	
	static logWord(word, meaning) {
		this.log(`${word} - ${meaning}`, 'word');
	}
	
	static logWallpaper(url) {
		const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
		this.log(displayUrl, 'wallpaper');
	}
	
	static logError(message) {
		this.log(message, 'error');
	}
	
	static logSuccess(message) {
		this.log(message, 'success');
	}
	
	static logSystem(message) {
		this.log(message, 'system');
	}
	
	static logDebug(message) {
		this.log(message, 'info');
	}
}