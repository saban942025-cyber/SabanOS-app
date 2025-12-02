/**
 * Bot Brain - GitHub Integration
 * Repo: saban942025-cyber/chat-bot
 */

const GITHUB_CONFIG = {
    user: 'saban942025-cyber',
    repo: 'chat-bot',
    branch: 'main',
    path: 'public/chatbot'
};

// Base URL for RAW content (Fast read, Cached)
const RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_CONFIG.user}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.path}/`;

// Global State
let knowledgeBase = [];
let products = [];

/**
 * טעינת נתונים ראשונית
 */
export async function initBotBrain() {
    try {
        const [kbData, prodData] = await Promise.all([
            fetchJSON('knowledge_base.json'),
            fetchJSON('products.json')
        ]);
        
        knowledgeBase = kbData || [];
        products = prodData || [];
        
        console.log(`✅ Bot Brain Loaded: ${knowledgeBase.length} KB items, ${products.length} Products`);
        return true;
    } catch (error) {
        console.error("❌ Failed to load bot brain:", error);
        return false;
    }
}

/**
 * Helper to fetch JSON from raw GitHub
 */
async function fetchJSON(filename) {
    try {
        // הוספת timestamp כדי למנוע קאשינג אגרסיבי מדי בדפדפן
        const url = `${RAW_BASE_URL}${filename}?t=${new Date().getTime()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        console.warn(`Could not load ${filename}`, e);
        return [];
    }
}

/**
 * עיבוד הודעת משתמש
 */
export async function processMessage(message) {
    if (!message) return "אנא כתוב משהו...";
    
    const lowerMsg = message.toLowerCase().trim();

    // 1. בדיקת מוצרים
    const productMatch = products.find(p => lowerMsg.includes(p.name.toLowerCase()));
    if (productMatch) {
        return {
            type: 'product',
            text: `מצאתי מוצר שעשוי לעניין אותך: <strong>${productMatch.name}</strong>`,
            data: productMatch
        };
    }

    // 2. בדיקת ידע כללי (Knowledge Base)
    // חיפוש פשוט לפי מילות מפתח
    const kbMatch = knowledgeBase.find(item => 
        item.keywords.some(k => lowerMsg.includes(k.toLowerCase()))
    );

    if (kbMatch) {
        return {
            type: 'text',
            text: kbMatch.answer
        };
    }

    // 3. ברירת מחדל - לא ידוע
    // כאן היינו רוצים לכתוב ל-unknown_queries.json
    // אך מכיוון שאסור לשים טוקן בקוד צד-לקוח, נדפיס לקונסול בלבד.
    console.warn("⚠️ Unknown Query Logged locally:", message);
    
    return {
        type: 'text',
        text: "סליחה, אני עדיין לומד ולא הבנתי את השאלה. נסה לנסח מחדש או לשאול על השירותים שלנו."
    };
}