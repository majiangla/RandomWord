import json
import csv

def extract_word_and_definition(data):
    """从单个单词数据中提取单词和释义"""
    try:
        word = data.get("headWord", "")
        
        # 提取所有释义
        definitions = []
        
        # 尝试获取 trans 数据
        trans_path = ["content", "word", "content", "trans"]
        trans_data = data
        for key in trans_path:
            if isinstance(trans_data, dict) and key in trans_data:
                trans_data = trans_data[key]
            else:
                # 尝试其他可能的路径
                if "content" in data and isinstance(data["content"], dict):
                    if "word" in data["content"]:
                        if "content" in data["content"]["word"]:
                            if "trans" in data["content"]["word"]["content"]:
                                trans_data = data["content"]["word"]["content"]["trans"]
                                break
                return word, ""  # 无法找到释义
        
        if not isinstance(trans_data, list):
            trans_data = [trans_data] if trans_data else []
        
        for trans in trans_data:
            if isinstance(trans, dict):
                pos = trans.get("pos", "").strip()
                tran_cn = trans.get("tranCn", "").strip()
                if pos and tran_cn:
                    definitions.append(f"{pos}.{tran_cn}")
        
        # 合并释义，用分号分隔
        definition_str = "；".join(definitions) if definitions else ""
        
        return word, definition_str
    except Exception as e:
        print(f"解析单词数据时出错: {e}")
        return "", ""

def process_words_to_csv(json_file, csv_file):
    """处理JSON文件并生成CSV"""
    word_count = 0
    
    with open(csv_file, 'w', encoding='utf-8', newline='') as csv_f:
        writer = csv.writer(csv_f)
        writer.writerow(['word', 'definition'])  # 写入标题
        
        try:
            # 尝试读取整个文件作为一个JSON数组
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # 检查是否是列表
            if isinstance(data, list):
                for item in data:
                    word, definition = extract_word_and_definition(item)
                    if word and definition:
                        writer.writerow([word, definition])
                        word_count += 1
            else:
                # 单个对象
                word, definition = extract_word_and_definition(data)
                if word and definition:
                    writer.writerow([word, definition])
                    word_count += 1
                    
        except json.JSONDecodeError as e:
            print(f"JSON解析失败: {e}")
            print("尝试逐行读取JSON对象...")
            
            # 逐行读取文件
            with open(json_file, 'r', encoding='utf-8') as f:
                line_number = 0
                for line in f:
                    line = line.strip()
                    if not line:  # 跳过空行
                        continue
                        
                    line_number += 1
                    try:
                        # 尝试解析每行作为独立的JSON对象
                        data = json.loads(line)
                        word, definition = extract_word_and_definition(data)
                        if word and definition:
                            writer.writerow([word, definition])
                            word_count += 1
                    except json.JSONDecodeError as line_error:
                        print(f"第 {line_number} 行 JSON 解析失败: {line_error}")
                        print(f"问题行内容: {line[:100]}...")  # 显示前100个字符
                    except Exception as line_error:
                        print(f"第 {line_number} 行处理失败: {line_error}")
    
    print(f"处理完成！成功提取 {word_count} 个单词到 {csv_file}")

# 使用示例
if __name__ == "__main__":
    process_words_to_csv('siji.json', 'words.csv')