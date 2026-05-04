const fs = require('fs');
const path = require('path');
const srcDir = 'e:/Sem6proj/Generative-ai-for-Personilised-Acadimic-Feedback-at-scale/FrontEnd/src/pages';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') && !file.includes('LoginPage.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('fetch(') && !content.includes('authFetch(')) {
        content = content.replace(/import \{ API_BASE \} from "@\/lib\/api";/g, 'import { API_BASE, authFetch } from "@/lib/api";');
        content = content.replace(/fetch\(/g, 'authFetch(');
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
});
