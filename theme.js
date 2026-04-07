import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace teal with violet for a whole new look!
    content = content.replace(/teal/g, 'violet');
    
    // In index.css, change font
    if (file.endsWith('index.css')) {
        content = content.replace(/font-family: 'Inter'/g, "font-family: 'Plus Jakarta Sans'");
        
        // Also update the root HSL variables to match violet/indigo (Hue approx 260)
        content = content.replace(/180 20% 99%/g, '260 20% 99%'); // background
        content = content.replace(/180 10% 15%/g, '260 10% 12%'); // foreground
        content = content.replace(/180 15% 90%/g, '260 15% 90%'); // border
        content = content.replace(/173 80% 32%/g, '262 80% 50%'); // primary
        content = content.replace(/180 100% 99%/g, '0 0% 100%'); // primary-foreground
        content = content.replace(/180 25% 94%/g, '260 25% 94%'); // secondary
        content = content.replace(/180 20% 94%/g, '260 20% 94%'); // muted
        content = content.replace(/180 15% 45%/g, '260 15% 45%'); // muted-foreground
    }

    fs.writeFileSync(file, content);
});
console.log('Swapped all teal to violet and updated index.css colors/fonts');
