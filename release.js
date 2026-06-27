import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log("🚀 Iniciando processo de atualização do Reduca...");

// 1. Lendo os arquivos
const versionFile = path.join(process.cwd(), 'public', 'version.json');
const gradleFile = path.join(process.cwd(), 'android', 'app', 'build.gradle');

let versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));

// 2. Incrementando as versões
versionData.build += 1;
const versionParts = versionData.version.split('.');
versionParts[2] = parseInt(versionParts[2]) + 1; // Incrementa o último número (ex: 1.0.1 -> 1.0.2)
versionData.version = versionParts.join('.');

console.log(`📦 Nova versão: ${versionData.version} (Build ${versionData.build})`);

// 3. Salvando o novo version.json
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

// 4. Atualizando o build.gradle do Android
let gradleContent = fs.readFileSync(gradleFile, 'utf8');
gradleContent = gradleContent.replace(/versionCode \d+/, `versionCode ${versionData.build}`);
gradleContent = gradleContent.replace(/versionName "[^"]+"/, `versionName "${versionData.version}"`);
fs.writeFileSync(gradleFile, gradleContent);

console.log("✅ Arquivos de versão atualizados!");

try {
  // 5. Build da Web
  console.log("🌐 Compilando a Web (React/Vite)...");
  execSync('npm run build', { stdio: 'inherit' });

  // 6. Sincronizando com o Capacitor
  console.log("🔄 Sincronizando arquivos nativos...");
  execSync('npx cap sync', { stdio: 'inherit' });

  // 7. Gerando o APK
  console.log("📱 Gerando o novo APK...");
  execSync('bash ~/.gemini/gerar_apk.sh', { stdio: 'inherit' });

  // 8. Movendo o APK para a pasta public temporariamente para o deploy
  console.log("📂 Movendo o APK para a pasta public...");
  execSync('cp reduca-debug.apk public/reduca-latest.apk', { stdio: 'inherit' });

  // 9. Fazendo o deploy para o GitHub Pages
  console.log("☁️ Fazendo o Deploy para o GitHub Pages...");
  execSync('npm run deploy', { stdio: 'inherit' });

  // 10. Limpando o APK da pasta public para não inchar o próximo build Android
  console.log("🧹 Limpando o APK temporário...");
  execSync('rm public/reduca-latest.apk', { stdio: 'inherit' });

  // 11. Comitando e subindo as alterações
  console.log("💾 Salvando o código no GitHub...");
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "chore: release version ${versionData.version}"`, { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });

  console.log("🎉 SUCESSO! A atualização está no ar e o aplicativo vai notificar os alunos sozinho!");
} catch (error) {
  console.error("❌ Ocorreu um erro durante o processo de release:", error.message);
  process.exit(1);
}
