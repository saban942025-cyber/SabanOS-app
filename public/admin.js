const CONFIG = {
    owner: 'saban942025-cyber',
    repo: 'chat-bot',
    path: 'public/chatbot'
};

const UI = {
    tokenInput: document.getElementById('gh-token'),
    kbEditor: document.getElementById('json-kb'),
    productsEditor: document.getElementById('json-products'),
    status: document.getElementById('status-msg')
};

// שמירת SHA של הקבצים כדי לאפשר עדכון (GitHub דורש את זה)
let fileSHAs = {
    'knowledge_base.json': null,
    'products.json': null
};

window.adminApp = {
    async loadData() {
        const token = UI.tokenInput.value.trim();
        if (!token) {
            alert('חובה להזין טוקן!');
            return;
        }

        UI.status.textContent = "טוען נתונים...";
        UI.status.className = "text-center text-yellow-400 mt-4";

        try {
            await Promise.all([
                fetchFileContent('knowledge_base.json', token),
                fetchFileContent('products.json', token)
            ]);
            UI.status.textContent = "הנתונים נטענו בהצלחה!";
            UI.status.className = "text-center text-green-400 mt-4";
        } catch (error) {
            console.error(error);
            UI.status.textContent = "שגיאה בטעינה: " + error.message;
            UI.status.className = "text-center text-red-400 mt-4";
        }
    },

    async saveFile(filename) {
        const token = UI.tokenInput.value.trim();
        if (!token) return alert('חסר טוקן');

        const editor = filename === 'knowledge_base.json' ? UI.kbEditor : UI.productsEditor;
        const content = editor.value;

        // וידוא שה-JSON תקין
        try {
            JSON.parse(content);
        } catch (e) {
            alert('שגיאת תחביר ב-JSON. לא ניתן לשמור.');
            return;
        }

        UI.status.textContent = `שומר את ${filename}...`;
        
        try {
            await updateGitHubFile(filename, content, token, fileSHAs[filename]);
            UI.status.textContent = `קובץ ${filename} נשמר בהצלחה!`;
            // רענון ה-SHA לאחר שמירה
            await fetchFileContent(filename, token); 
        } catch (error) {
            UI.status.textContent = "שגיאה בשמירה: " + error.message;
        }
    }
};

// --- GitHub API Helpers ---

async function fetchFileContent(filename, token) {
    const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.path}/${filename}`;
    
    const res = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    
    const data = await res.json();
    fileSHAs[filename] = data.sha; // שמירת ה-SHA

    // פענוח Base64 (תומך בעברית)
    const decodedContent = decodeURIComponent(escape(atob(data.content)));
    
    if (filename === 'knowledge_base.json') {
        UI.kbEditor.value = JSON.stringify(JSON.parse(decodedContent), null, 2);
    } else {
        UI.productsEditor.value = JSON.stringify(JSON.parse(decodedContent), null, 2);
    }
}

async function updateGitHubFile(filename, content, token, sha) {
    const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.path}/${filename}`;
    
    // קידוד ל-Base64 (תומך בעברית)
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    const body = {
        message: `Admin update: ${filename}`,
        content: encodedContent,
        sha: sha // חובה כדי לעדכן קובץ קיים
    };

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Update failed');
    }
}