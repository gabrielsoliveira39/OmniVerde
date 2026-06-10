const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');

console.log('--- Iniciando Teste de Validação do index.html ---');

// 1. Verificar se o arquivo existe
if (!fs.existsSync(filePath)) {
    console.error(`ERRO: O arquivo ${filePath} não foi encontrado.`);
    process.exit(1);
}
console.log('✔ Arquivo index.html encontrado.');

const htmlContent = fs.readFileSync(filePath, 'utf8');

// 2. Verificar bibliotecas CDNs críticas
const cdns = [
    'three.min.js',
    'OrbitControls.js',
    'tween.umd.js'
];

cdns.forEach(cdn => {
    if (htmlContent.includes(cdn)) {
        console.log(`✔ CDN encontrada: ${cdn}`);
    } else {
        console.error(`ERRO: CDN crítica ausente: ${cdn}`);
        process.exit(1);
    }
});

// 3. Verificar elementos HTML estruturais da especificação
const requiredElements = [
    'id="webgl-container"',
    'class="logo-img"',
    'src="logo.png"',
    'id="info-card"',
    'id="info-tag"',
    'id="info-header"',
    'id="info-desc"',
    'id="reset-camera-btn"'
];

requiredElements.forEach(elem => {
    if (htmlContent.includes(elem)) {
        console.log(`✔ Elemento HTML verificado: ${elem}`);
    } else {
        console.error(`ERRO: Elemento HTML obrigatório ausente: ${elem}`);
        process.exit(1);
    }
});

// 4. Extrair e validar a sintaxe do bloco de script JS interno
console.log('\n--- Validando Sintaxe do JavaScript Interno ---');
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let scripts = [];
while ((match = scriptRegex.exec(htmlContent)) !== null) {
    // Pegar apenas scripts que contêm lógica de inicialização do Three.js (geralmente o maior bloco)
    const scriptBody = match[1];
    if (scriptBody.includes('THREE.Scene')) {
        scripts.push(scriptBody);
    }
}

if (scripts.length === 0) {
    console.error('ERRO: Nenhum script Three.js encontrado dentro das tags <script>.');
    process.exit(1);
}

// Grava o script temporariamente em um arquivo js e valida a sintaxe via node
const tempJsPath = path.join(__dirname, 'temp_app.js');
fs.writeFileSync(tempJsPath, scripts[0], 'utf8');

const { execSync } = require('child_process');
try {
    // Executa node --check para verificar erros de sintaxe (como parênteses não fechados, etc.)
    execSync(`node --check "${tempJsPath}"`);
    console.log('✔ Lógica JavaScript interna sem erros de sintaxe compile-time.');
} catch (err) {
    console.error('ERRO de sintaxe no código JavaScript interno:');
    console.error(err.message);
    fs.unlinkSync(tempJsPath);
    process.exit(1);
}

fs.unlinkSync(tempJsPath);

// 5. Verificar instanciamento dos componentes 3D obrigatórios no código
const required3DComponents = [
    'THREE.PlaneGeometry',
    'THREE.BoxGeometry',
    'THREE.CylinderGeometry',
    'THREE.SphereGeometry',
    'THREE.DirectionalLight',
    'THREE.AmbientLight',
    'THREE.Raycaster',
    'THREE.OrbitControls',
    'TWEEN.Tween'
];

console.log('\n--- Validando Presença de Módulos e Componentes 3D ---');
required3DComponents.forEach(comp => {
    if (htmlContent.includes(comp)) {
        console.log(`✔ Classe/Instância Three.js encontrada: ${comp}`);
    } else {
        console.warn(`AVISO: Componente 3D não explicitado diretamente: ${comp}`);
    }
});

console.log('\n✔ TESTE DO SISTEMA CONCLUÍDO COM SUCESSO! O arquivo index.html está estruturalmente íntegro.');
process.exit(0);
