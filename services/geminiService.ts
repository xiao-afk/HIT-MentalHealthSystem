import { Message } from "../types";

/**
 * 本地 AI 服务配置 (基于 Ollama)
 * 确保启动 Ollama 时设置了环境变量: OLLAMA_ORIGINS="*" 以允许浏览器跨域访问
 */
const OLLAMA_BASE_URL = "http://localhost:11434/api";
const TEXT_MODEL = "qwen2.5:7b"; // 替换为你本地运行的模型名称，如 qwen3
const VISION_MODEL = "qwen2-vl"; // 替换为你本地的多模态模型

/**
 * 通用本地请求函数
 */
async function callLocalAI(endpoint: string, body: any) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        stream: false, // 简化处理，关闭流式输出
      }),
    });
    
    if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Local AI Request Failed:", error);
    throw error;
  }
}

/**
 * 1. 生成抑郁症量表 (Qwen 文本)
 */
export const generateDepressionScaleQuestions = async () => {
  const prompt = `你是一位心理健康专家。请生成一个包含5个问题的简易抑郁筛查问卷。
依据PHQ-9标准，但语气要友好且富有同理心。
必须严格返回以下 JSON 数组格式，不要包含任何多余的文字：
[
  { "id": 1, "question": "问题内容", "options": ["选项1", "选项2", "选项3", "选项4"] }
]`;

  try {
    const data = await callLocalAI('generate', {
      model: TEXT_MODEL,
      prompt: prompt,
      format: "json"
    });
    return JSON.parse(data.response || "[]");
  } catch (error) {
    // 降级策略
    return [
      { id: 1, question: "最近两周，你是否感觉做事提不起劲？", options: ["完全没有", "有几天", "一半以上时间", "几乎每天"] },
      { id: 2, question: "你是否感到心情低落、抑郁或绝望？", options: ["完全没有", "有几天", "一半以上时间", "几乎每天"] },
    ];
  }
};

/**
 * 2. 分析房树人绘画 (Qwen 视觉)
 */
export const analyzeHTPImage = async (base64Image: string) => {
  try {
    // 去掉 base64 头部
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const data = await callLocalAI('chat', {
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: '分析这张“房树人”心理测试绘画。请从构图、线条、房屋细节、树木形态和人物形象五个维度给出专业且温柔的心理分析建议。',
          images: [cleanBase64]
        }
      ]
    });
    return data.message.content;
  } catch (error) {
    return "本地多模态模型分析失败，请检查模型是否支持视觉识别。";
  }
};

/**
 * 3. 访谈摘要 (Qwen 文本)
 */
export const summarizeInterview = async (messages: Message[]) => {
  if (messages.length === 0) return "暂无访谈数据。";

  const transcript = messages.map(m => `${m.sender}: ${m.content}`).join('\n');

  try {
    const data = await callLocalAI('generate', {
      model: TEXT_MODEL,
      prompt: `你是一位临床助手。请根据以下医患对话内容，总结患者的情绪状态、主要症状以及可能的心理风险点：\n\n${transcript}`
    });
    return data.response;
  } catch (error) {
    return "无法生成摘要。";
  }
};

/**
 * 4. 生成医生回复建议 (Qwen 文本)
 */
export const generateAIResponse = async (messages: Message[]) => {
  const transcript = messages.slice(-5).map(m => `${m.sender}: ${m.content}`).join('\n');
  
  try {
    const data = await callLocalAI('generate', {
      model: TEXT_MODEL,
      prompt: `你是一位共情能力极强的心理医生助理。基于以下对话片段，为医生起草一段简短、专业且充满人文关怀的回复话术：\n\n${transcript}`
    });
    return data.response;
  } catch (error) {
    return "我正在倾听，请继续分享你的感受。";
  }
};