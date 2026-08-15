const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf-8');

code = code.replace(
  `<title>Mail Factory - Trusted Gmail Exchange Platform</title>`, 
  `<title>Mail Factory - #1 Trusted Gmail Exchange Platform</title>
    <link rel="canonical" href="https://www.mailfectory.top/" />`
);

fs.writeFileSync('index.html', code);
