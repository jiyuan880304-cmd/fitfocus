
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeMeal(mealDescription: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析這頓餐點的營養成分: "${mealDescription}"。請預估卡路里、蛋白質、碳水化合物和脂肪。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "餐點名稱" },
            calories: { type: Type.NUMBER, description: "總卡路里" },
            protein: { type: Type.NUMBER, description: "蛋白質(g)" },
            carbs: { type: Type.NUMBER, description: "碳水化合物(g)" },
            fat: { type: Type.NUMBER, description: "脂肪(g)" }
          },
          required: ["name", "calories", "protein", "carbs", "fat"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
}

export async function getWeightLossAdvice(profile: any, todayLog: any) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `根據以下用戶資料提供一段簡短的今日減肥建議：
        用戶：${profile.name}, 性別：${profile.gender}, 體重：${profile.weight}kg, 目標：${profile.targetWeight}kg。
        今日攝取：${todayLog.meals.reduce((acc: number, m: any) => acc + m.calories, 0)}卡路里。
        今日喝水：${todayLog.waterIntake}ml。
        請用中文回答，語氣親切且專業。`,
      });
      return response.text;
    } catch (error) {
      return "保持動力，繼續加油！";
    }
}

export async function getMotivationMessage(profile: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `這是一位想要變瘦的使用者 ${profile.name}。
      目前體重：${profile.weight}kg，目標體重：${profile.targetWeight}kg。
      他上傳了一張曾經很瘦或他嚮往的形象照片。
      請以「AI 心靈導師」的身份，根據這個視覺對比，寫一段充滿詩意、強大、感性且極具激勵性的短文（約 100 字）。
      語氣要像是：看著這張照片，你值得找回那個閃閃發光的自己。`,
    });
    return response.text;
  } catch (error) {
    return "看著鏡頭前的那個你，那是你最真實的渴望。每一步的克制，都是在與未來的自己重逢。加油，那個閃耀的你，正在終點等你。";
  }
}

export async function getQuickCheer(profile: any) {
  try {
    const diff = (profile.weight - profile.targetWeight).toFixed(1);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `使用者：${profile.name}。距離目標體重還有 ${diff} 公斤。
      請給予一段「非常短促、親暱、像好朋友一樣」的讚美與鼓勵。
      必須包含「你真的很漂亮」或相似的讚美，並提到還差 ${diff} 公斤就達成目標。
      字數限制在 30 字以內，極具渲染力。`,
    });
    return response.text;
  } catch (error) {
    const diff = (profile.weight - profile.targetWeight).toFixed(1);
    return `你真的很漂亮！加油，離目標只差 ${diff} 公斤了，我看好你！`;
  }
}
