import { Recipe } from '../types';
import { getYouTubeEmbedUrl } from './videoHelpers';

export function formatRecipeText(recipe: Recipe, currentServings?: number): string {
  const servings = currentServings || recipe.servings || 4;
  const originalServings = recipe.servings || 4;
  const ratio = servings / originalServings;

  const totalTime = recipe.totalTimeMinutes || (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  let text = `🍳 *${recipe.title.toUpperCase()}*\n`;
  if (recipe.description) {
    text += `_${recipe.description}_\n\n`;
  } else {
    text += `\n`;
  }

  text += `⏱️ *Tiempo:* ${totalTime ? `${totalTime} min` : 'Aprox. 30 min'}`;
  if (recipe.prepTimeMinutes && recipe.cookTimeMinutes) {
    text += ` (Prep: ${recipe.prepTimeMinutes}m | Cocción: ${recipe.cookTimeMinutes}m)`;
  }
  text += `\n👥 *Raciones:* ${servings} personas\n`;
  if (recipe.difficulty) {
    text += `📊 *Dificultad:* ${recipe.difficulty}\n`;
  }

  const videoOrSource = recipe.videoUrl || recipe.sourceUrl;
  if (videoOrSource) {
    text += `🎥 *Video / Enlace:* ${videoOrSource}\n`;
  }

  text += `\n🛒 *INGREDIENTES:*\n`;
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach((ing) => {
      let qtyStr = '';
      if (ing.amount !== undefined && ing.amount !== null) {
        const scaled = ing.amount * ratio;
        qtyStr = Number.isInteger(scaled) ? `${scaled} ` : `${scaled.toFixed(1).replace(/\.0$/, '')} `;
      }
      const unitStr = ing.unit ? `${ing.unit} ` : '';
      const notesStr = ing.notes ? ` (${ing.notes})` : '';
      text += `• ${qtyStr}${unitStr}${ing.item}${notesStr}\n`.trim() + '\n';
    });
  } else {
    text += `• Según preparación\n`;
  }

  text += `\n👩‍🍳 *PREPARACIÓN PASO A PASO:*\n`;
  if (recipe.instructions && recipe.instructions.length > 0) {
    recipe.instructions.forEach((step, idx) => {
      text += `${step.stepNumber || idx + 1}. ${step.instruction}\n`;
      if (step.tip) {
        text += `   💡 _Consejo del Chef:_ ${step.tip}\n`;
      }
    });
  } else {
    text += `1. Seguir indicaciones del video o fuente original.\n`;
  }

  text += `\n✨ _Compartido desde Recetario Culinario con IA_`;

  return text;
}

export function getWhatsAppShareUrl(recipe: Recipe, currentServings?: number): string {
  const text = formatRecipeText(recipe, currentServings);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function getEmailShareUrl(recipe: Recipe, currentServings?: number): string {
  const subject = `Receta: ${recipe.title}`;
  const body = formatRecipeText(recipe, currentServings);
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function generateInteractiveHtml(recipe: Recipe, currentServings?: number): string {
  const servings = currentServings || recipe.servings || 4;
  const youtubeEmbed = getYouTubeEmbedUrl(recipe.videoUrl || recipe.sourceUrl);
  const videoUrl = recipe.videoUrl || recipe.sourceUrl || '';
  const totalTime = recipe.totalTimeMinutes || (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) || 30;

  const ingredientsJson = JSON.stringify(
    recipe.ingredients.map((ing) => ({
      item: ing.item,
      baseAmount: ing.amount ?? null,
      unit: ing.unit || '',
      notes: ing.notes || ''
    }))
  );

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(recipe.title)} - Receta Interactiva</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #f59e0b;
      --primary-hover: #d97706;
      --primary-light: #fef3c7;
      --stone-900: #1c1917;
      --stone-800: #292524;
      --stone-700: #44403c;
      --stone-600: #57534e;
      --stone-500: #78716c;
      --stone-200: #e7e5e4;
      --stone-100: #f5f5f4;
      --stone-50: #fafaf9;
      --emerald-600: #059669;
      --emerald-50: #ecfdf5;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #fbfbfa;
      color: var(--stone-800);
      line-height: 1.6;
      padding: 1.5rem 1rem 3rem;
    }
    .container {
      max-width: 880px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 4px 25px rgba(0,0,0,0.06);
      border: 1px solid var(--stone-200);
      overflow: hidden;
    }
    .header {
      padding: 2.2rem 2rem 1.8rem;
      background: linear-gradient(180deg, #fffbf2 0%, #ffffff 100%);
      border-bottom: 1px solid var(--stone-200);
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    .badge {
      padding: 0.3rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .badge-primary { background: var(--primary); color: #000; }
    .badge-outline { background: #fff; border: 1px solid var(--stone-200); color: var(--stone-700); }
    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2.2rem;
      color: var(--stone-900);
      line-height: 1.25;
      margin-bottom: 0.75rem;
    }
    .description {
      color: var(--stone-600);
      font-size: 1rem;
      margin-bottom: 1.25rem;
    }
    .meta-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--stone-200);
      font-size: 0.875rem;
      color: var(--stone-600);
    }
    .meta-item strong { color: var(--stone-900); }
    .media-section {
      padding: 1.5rem 2rem 0;
    }
    .video-container {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      border-radius: 14px;
      box-shadow: 0 3px 15px rgba(0,0,0,0.08);
      background: #000;
      margin-bottom: 1.5rem;
    }
    .video-container iframe, .video-container video {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      border: 0;
    }
    .cover-image {
      width: 100%;
      max-height: 380px;
      object-fit: cover;
      border-radius: 14px;
      margin-bottom: 1.5rem;
      border: 1px solid var(--stone-200);
    }
    .main-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      padding: 2rem;
    }
    @media (min-width: 768px) {
      .main-grid {
        grid-template-columns: 1fr 1.35fr;
      }
    }
    .panel {
      background: var(--stone-50);
      border: 1px solid var(--stone-200);
      border-radius: 16px;
      padding: 1.4rem;
    }
    .panel-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--stone-900);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    /* Servings Scaler */
    .scaler-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      border: 1px solid var(--stone-200);
      margin-bottom: 1.25rem;
    }
    .scaler-controls {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .scaler-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--stone-200);
      background: #fff;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--stone-800);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .scaler-btn:hover {
      background: var(--stone-100);
      border-color: var(--stone-500);
    }
    .scaler-count {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--stone-900);
      min-width: 2.2rem;
      text-align: center;
    }
    /* Ingredients List */
    .ing-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .ing-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      background: #ffffff;
      border: 1px solid var(--stone-200);
      border-radius: 10px;
      cursor: pointer;
      user-select: none;
      transition: all 0.15s;
    }
    .ing-item:hover {
      border-color: var(--primary);
    }
    .ing-item.checked {
      background: #f5f5f4;
      opacity: 0.6;
      text-decoration: line-through;
    }
    .ing-checkbox {
      width: 18px;
      height: 18px;
      margin-top: 3px;
      accent-color: var(--emerald-600);
      cursor: pointer;
    }
    .ing-text {
      flex: 1;
      font-size: 0.9rem;
    }
    .ing-qty {
      font-weight: 700;
      color: #b45309;
      margin-right: 0.25rem;
    }
    /* Steps list */
    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .step-item {
      background: #ffffff;
      border: 1px solid var(--stone-200);
      border-radius: 12px;
      padding: 1.1rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .step-item:hover {
      border-color: var(--stone-500);
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .step-item.completed {
      background: var(--emerald-50);
      border-color: #a7f3d0;
    }
    .step-head {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .step-number {
      width: 26px;
      height: 26px;
      border-radius: 999px;
      background: var(--primary);
      color: #000;
      font-size: 0.8rem;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .step-item.completed .step-number {
      background: var(--emerald-600);
      color: #fff;
    }
    .step-text {
      font-size: 0.95rem;
      color: var(--stone-800);
      line-height: 1.6;
    }
    .step-tip {
      margin-top: 0.75rem;
      padding: 0.6rem 0.8rem;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      font-size: 0.825rem;
      color: #92400e;
    }
    .progress-bar-wrap {
      background: var(--stone-200);
      height: 6px;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 1.25rem;
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--emerald-600);
      width: 0%;
      transition: width 0.3s ease;
    }
    .footer {
      padding: 1.5rem 2rem;
      background: var(--stone-50);
      border-top: 1px solid var(--stone-200);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.85rem;
      color: var(--stone-500);
    }
    .btn-print {
      background: #fff;
      border: 1px solid var(--stone-200);
      color: var(--stone-800);
      padding: 0.5rem 1.1rem;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.825rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-print:hover {
      background: var(--stone-100);
    }
    @media print {
      body { background: #fff; padding: 0; }
      .container { box-shadow: none; border: none; }
      .scaler-btn, .btn-print, .video-container { display: none !important; }
      .ing-item.checked { text-decoration: none; opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="badges">
        <span class="badge badge-primary">${escapeHtml(recipe.category || 'Receta')}</span>
        ${recipe.difficulty ? `<span class="badge badge-outline">Dificultad: ${escapeHtml(recipe.difficulty)}</span>` : ''}
        ${recipe.sourcePlatform ? `<span class="badge badge-outline">${escapeHtml(recipe.sourcePlatform.toUpperCase())}</span>` : ''}
      </div>
      <h1>${escapeHtml(recipe.title)}</h1>
      ${recipe.description ? `<p class="description">${escapeHtml(recipe.description)}</p>` : ''}
      <div class="meta-bar">
        <div class="meta-item">⏱️ Tiempo total: <strong>${totalTime} min</strong></div>
        ${recipe.author ? `<div class="meta-item">👨‍🍳 Autor: <strong>${escapeHtml(recipe.author)}</strong></div>` : ''}
        ${videoUrl ? `<div class="meta-item">🔗 <a href="${escapeHtml(videoUrl)}" target="_blank" style="color:#b45309;text-decoration:underline;">Ver fuente original</a></div>` : ''}
      </div>
    </header>

    ${
      youtubeEmbed
        ? `<div class="media-section">
             <div class="video-container">
               <iframe src="${escapeHtml(youtubeEmbed)}" title="${escapeHtml(recipe.title)}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
             </div>
           </div>`
        : recipe.imageUrl
        ? `<div class="media-section">
             <img src="${escapeHtml(recipe.imageUrl)}" alt="${escapeHtml(recipe.title)}" class="cover-image" />
           </div>`
        : ''
    }

    <main class="main-grid">
      <!-- Ingredients Panel -->
      <section class="panel">
        <div class="panel-title">
          <span>Ingredientes</span>
          <small style="font-size:0.75rem;font-weight:600;color:var(--stone-500);">(Toca para tachar)</small>
        </div>

        <div class="scaler-box">
          <div>
            <div style="font-size:0.75rem;color:var(--stone-500);font-weight:600;">Porciones</div>
            <div style="font-size:0.85rem;color:var(--stone-700);">Ajustar cantidades</div>
          </div>
          <div class="scaler-controls">
            <button class="scaler-btn" id="btn-minus">−</button>
            <span class="scaler-count" id="servings-display">${servings}</span>
            <button class="scaler-btn" id="btn-plus">+</button>
          </div>
        </div>

        <ul class="ing-list" id="ingredients-list"></ul>
      </section>

      <!-- Preparation Steps -->
      <section class="panel">
        <div class="panel-title">
          <span>Instrucciones</span>
          <span id="steps-counter" style="font-size:0.8rem;color:var(--stone-600);font-weight:600;">0 de ${recipe.instructions?.length || 0}</span>
        </div>

        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" id="progress-bar"></div>
        </div>

        <div class="steps-list" id="steps-list">
          ${(recipe.instructions || [])
            .map(
              (step, i) => `
            <div class="step-item" onclick="toggleStep(this)">
              <div class="step-head">
                <div class="step-number">${step.stepNumber || i + 1}</div>
                <div style="font-weight:700;font-size:0.85rem;color:var(--stone-700);">Paso ${step.stepNumber || i + 1}</div>
              </div>
              <p class="step-text">${escapeHtml(step.instruction)}</p>
              ${step.tip ? `<div class="step-tip">💡 <strong>Consejo:</strong> ${escapeHtml(step.tip)}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    </main>

    <footer class="footer">
      <div>🍳 Recetario Culinario Interactivo</div>
      <button class="btn-print" onclick="window.print()">🖨️ Imprimir Receta</button>
    </footer>
  </div>

  <script>
    const baseServings = ${recipe.servings || 4};
    let currentServings = ${servings};
    const rawIngredients = ${ingredientsJson};

    function renderIngredients() {
      const list = document.getElementById('ingredients-list');
      const ratio = currentServings / baseServings;
      list.innerHTML = rawIngredients.map((ing, idx) => {
        let amountText = '';
        if (ing.baseAmount !== null && ing.baseAmount !== undefined) {
          const scaled = ing.baseAmount * ratio;
          amountText = Number.isInteger(scaled) ? scaled : scaled.toFixed(1).replace(/\\.0$/, '');
        }
        return \`
          <li class="ing-item" onclick="toggleIng(this, \${idx})">
            <input type="checkbox" class="ing-checkbox" onclick="event.stopPropagation(); toggleIng(this.parentElement, \${idx})" />
            <div class="ing-text">
              \${amountText ? \`<span class="ing-qty">\${amountText} \${ing.unit}</span>\` : (ing.unit ? \`<span class="ing-qty">\${ing.unit}</span>\` : '')}
              <strong>\${ing.item}</strong>
              \${ing.notes ? \`<span style="color:#78716c;font-size:0.8rem;display:block;">(\${ing.notes})</span>\` : ''}
            </div>
          </li>
        \`;
      }).join('');
    }

    function toggleIng(el, idx) {
      el.classList.toggle('checked');
      const cb = el.querySelector('.ing-checkbox');
      if (cb) cb.checked = el.classList.contains('checked');
    }

    function toggleStep(el) {
      el.classList.toggle('completed');
      updateProgress();
    }

    function updateProgress() {
      const total = document.querySelectorAll('.step-item').length;
      const completed = document.querySelectorAll('.step-item.completed').length;
      document.getElementById('steps-counter').innerText = completed + ' de ' + total;
      const pct = total > 0 ? (completed / total) * 100 : 0;
      document.getElementById('progress-bar').style.width = pct + '%';
    }

    document.getElementById('btn-minus').addEventListener('click', () => {
      if (currentServings > 1) {
        currentServings--;
        document.getElementById('servings-display').innerText = currentServings;
        renderIngredients();
      }
    });

    document.getElementById('btn-plus').addEventListener('click', () => {
      if (currentServings < 30) {
        currentServings++;
        document.getElementById('servings-display').innerText = currentServings;
        renderIngredients();
      }
    });

    renderIngredients();
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function downloadInteractiveHtmlFile(recipe: Recipe, currentServings?: number) {
  const html = generateInteractiveHtml(recipe, currentServings);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const slug = (recipe.title || 'receta')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  link.href = url;
  link.download = `${slug}-interactiva.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
