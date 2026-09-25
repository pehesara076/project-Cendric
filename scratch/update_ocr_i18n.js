const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/dist/assets/cendric-enhancements.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Localize OCR upload errors in handleReceiptUpload
const oldUploadErrors = `        if (!res.ok || json.success === false) {
          const errMsg = json.message || json.error || \`Server returned error (\${res.status})\`;
          _appendMessage('assistant', \`⚠️ **Could not analyze receipt**: \${errMsg}\\n\\nYou can still add this transaction manually using the **Transactions** tab or the Bill Scanner.\`);
          return;
        }

        const extracted = (json.success && json.data) ? json.data : (json.data || json);
        if (!extracted) {
          _appendMessage('assistant', \`⚠️ Could not read financial details clearly from the receipt photo. Please try a clearer, well-lit image or enter manually.\`);
          return;
        }

        renderExtractedReceiptCard(extracted, dataUrl);
      } catch (err) {
        console.error('[Cendric Chat Receipt OCR Error]', err);
        _hideTyping();
        _appendMessage('assistant', \`⚠️ Could not analyze receipt: \${err.message || 'Network error'}. You can still log it manually in Transactions.\`);
      }`;

const newUploadErrors = `        if (!res.ok || json.success === false) {
          const errMsg = json.message || json.error || \`Server returned error (\${res.status})\`;
          const curLang = getCurrentLang();
          let errFormatted = \`⚠️ **Could not analyze receipt**: \${errMsg}\\n\\nYou can still add this transaction manually using the **Transactions** tab or the Bill Scanner.\`;
          if (curLang === 'si') {
            errFormatted = \`⚠️ **රිසිට්පත විශ්ලේෂණය කිරීමට නොහැකි විය**: \${errMsg}\\n\\nඔබට **ගනුදෙනු (Transactions)** පිටුව හෝ බිල් ස්කෑනරය මඟින් මෙම ගනුදෙනුව අතින් ඇතුළත් කළ හැකිය.\`;
          } else if (curLang === 'ta') {
            errFormatted = \`⚠️ **ரசீதை பகுப்பாய்வு செய்ய முடியவில்லை**: \${errMsg}\\n\\nநீங்கள் இந்த பரிவர்த்தனையை **பரிவர்த்தனைகள்** தாவல் அல்லது பில் ஸ்கேனர் மூலம் கைமுறையாக சேர்க்கலாம்.\`;
          }
          _appendMessage('assistant', errFormatted);
          return;
        }

        const extracted = (json.success && json.data) ? json.data : (json.data || json);
        if (!extracted) {
          const curLang = getCurrentLang();
          let unclearFormatted = \`⚠️ Could not read financial details clearly from the receipt photo. Please try a clearer, well-lit image or enter manually.\`;
          if (curLang === 'si') {
            unclearFormatted = \`⚠️ රිසිට්පත් ඡායාරූපයෙන් මූල්‍ය විස්තර පැහැදිලිව හඳුනා ගැනීමට නොහැකි විය. වඩාත් පැහැදිලි ඡායාරූපයක් ලබා දෙන්න හෝ අතින් ඇතුළත් කරන්න.\`;
          } else if (curLang === 'ta') {
            unclearFormatted = \`⚠️ ரசீது புகைப்படத்திலிருந்து நிதி விவரங்களை தெளிவாக படிக்க முடியவில்லை. தெளிவான புகைப்படத்தை முயற்சிக்கவும் அல்லது கைமுறையாக உள்ளிடவும்.\`;
          }
          _appendMessage('assistant', unclearFormatted);
          return;
        }

        renderExtractedReceiptCard(extracted, dataUrl);
      } catch (err) {
        console.error('[Cendric Chat Receipt OCR Error]', err);
        _hideTyping();
        const curLang = getCurrentLang();
        let netErr = \`⚠️ Could not analyze receipt: \${err.message || 'Network error'}. You can still log it manually in Transactions.\`;
        if (curLang === 'si') {
          netErr = \`⚠️ රිසිට්පත විශ්ලේෂණය කිරීමට නොහැකි විය: \${err.message || 'ජාල දෝෂයකි'}. ඔබට එය ගනුදෙනු පිටුවට අතින් ඇතුළත් කළ හැක.\`;
        } else if (curLang === 'ta') {
          netErr = \`⚠️ ரசீதை பகுப்பாய்வு செய்ய முடியவில்லை: \${err.message || 'பிணைய பிழை'}. நீங்கள் அதை பரிவர்த்தனைகளில் கைமுறையாக பதிவு செய்யலாம்.\`;
        }
        _appendMessage('assistant', netErr);
      }`;

if (code.includes(oldUploadErrors)) {
  code = code.replace(oldUploadErrors, newUploadErrors);
  console.log('Replaced oldUploadErrors');
} else {
  // Try CRLF matching
  const oldUploadErrorsCRLF = oldUploadErrors.replace(/\n/g, '\r\n');
  if (code.includes(oldUploadErrorsCRLF)) {
    code = code.replace(oldUploadErrorsCRLF, newUploadErrors.replace(/\n/g, '\r\n'));
    console.log('Replaced oldUploadErrors (CRLF)');
  } else {
    console.warn('Could not match oldUploadErrors');
  }
}

// 2. Localize renderExtractedReceiptCard template
const oldRenderCard = `  function renderExtractedReceiptCard(data, imageThumb) {
    const msgs = document.getElementById('cc-messages');
    if (!msgs) return;

    const curr = getCurrency();
    const currSym = getCurrencySymbol(curr);
    const hasAmount = data.amount !== null && data.amount !== undefined && !isNaN(Number(data.amount));
    const amount = hasAmount ? Number(data.amount) : null;
    const isIncome = (data.type || 'expense').toLowerCase() === 'income';
    const typeLabel = isIncome ? 'Income' : 'Expense';
    const typeColor = isIncome ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)';
    const typeSign = isIncome ? '+' : '-';
    const dateStr = data.date || 'Not detected on receipt';
    const vendor = (data.vendor || data.merchantName || data.description || 'Scanned Receipt').trim();
    const category = data.category || 'Others';

    const amountDisplay = hasAmount
      ? \`\${typeSign}\${currSym} \${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`
      : \`<span style="font-size: 16px; font-weight: 700; color: var(--text-muted, #888);">Manual review needed</span>\`;

    const cardId = 'receipt-card-' + Date.now();
    const cardDiv = document.createElement('div');
    cardDiv.className = 'cc-msg cc-msg-assistant cc-msg-new';
    cardDiv.id = cardId;
    cardDiv.innerHTML = \`
      <div class="cc-extracted-card" style="max-width: 420px; background: var(--card-bg, #ffffff); border: 1px solid var(--border, #e2dbce); border-radius: 18px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #6d5ae6 0%, #8b5cf6 100%); padding: 12px 16px; color: #fff;">
          <div style="font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>📄</span> <span>Receipt Extracted</span>
          </div>
          <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">Review details extracted by Gemini AI before saving</div>
        </div>
        <div style="padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div>
              <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Amount</div>
              <div style="font-size: 22px; font-weight: 800; color: \${typeColor};">
                \${amountDisplay}
              </div>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: \${typeColor}; background: \${isIncome ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'}; padding: 4px 10px; border-radius: 20px;">
              \${isIncome ? '↑' : '↓'} \${typeLabel}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: 13px; background: var(--glass-inner-bg, #f8fafc); padding: 10px 12px; border-radius: 12px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted); font-size: 12px;">Description:</span>
              <span style="font-weight: 600; color: var(--text-primary); text-align: right;">\${vendor.replace(/</g, '&lt;')}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted); font-size: 12px;">Category:</span>
              <span style="font-weight: 600; color: var(--text-primary);">\${category}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted); font-size: 12px;">Date:</span>
              <span style="font-weight: 600; color: var(--text-primary);">\${dateStr}</span>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="cc-card-btn-confirm" style="flex: 1; padding: 9px 12px; border-radius: 10px; background: var(--accent, #6d5ae6); color: #fff; border: none; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.2s;">
              <span>✓</span> <span>Confirm & Save</span>
            </button>
            <button class="cc-card-btn-edit" style="padding: 9px 14px; border-radius: 10px; background: var(--glass-inner-bg, #f1f5f9); border: 1.5px solid var(--border, #e2dbce); color: var(--text-primary); font-weight: 600; font-size: 13px; cursor: pointer;">
              Edit
            </button>
            <button class="cc-card-btn-dismiss" style="padding: 9px 12px; border-radius: 10px; background: transparent; border: 1.5px solid var(--border, #e2dbce); color: var(--text-muted); cursor: pointer;" title="Dismiss">
              ✕
            </button>
          </div>
        </div>
      </div>
    \`;`;

const newRenderCard = `  function renderExtractedReceiptCard(data, imageThumb) {
    const msgs = document.getElementById('cc-messages');
    if (!msgs) return;

    const curLang = getCurrentLang();
    const l = I18N[curLang] || I18N.en;

    const curr = getCurrency();
    const currSym = getCurrencySymbol(curr);
    const hasAmount = data.amount !== null && data.amount !== undefined && !isNaN(Number(data.amount));
    const amount = hasAmount ? Number(data.amount) : null;
    const isIncome = (data.type || 'expense').toLowerCase() === 'income';
    const typeLabel = isIncome ? (l.income || 'Income') : (l.expense || 'Expense');
    const typeColor = isIncome ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)';
    const typeSign = isIncome ? '+' : '-';
    const dateStr = data.date || (curLang === 'si' ? 'හඳුනාගෙන නැත' : curLang === 'ta' ? 'கண்டுபிடிக்கப்படவில்லை' : 'Not detected on receipt');
    const vendor = (data.vendor || data.merchantName || data.description || (curLang === 'si' ? 'ස්කෑන් කළ රිසිට්පත' : curLang === 'ta' ? 'ரசீது' : 'Scanned Receipt')).trim();
    const category = data.category || (curLang === 'si' ? 'වෙනත්' : curLang === 'ta' ? 'மற்றவை' : 'Others');

    const amountDisplay = hasAmount
      ? \`\${typeSign}\${currSym} \${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`
      : \`<span style="font-size: 16px; font-weight: 700; color: var(--text-muted, #888);">\${curLang === 'si' ? 'අතින් ඇතුළත් කරන්න' : curLang === 'ta' ? 'கைமுறை உள்ளீடு தேவை' : 'Manual review needed'}</span>\`;

    const cardId = 'receipt-card-' + Date.now();
    const cardDiv = document.createElement('div');
    cardDiv.className = 'cc-msg cc-msg-assistant cc-msg-new';
    cardDiv.id = cardId;
    cardDiv.innerHTML = \`
      <div class="cc-extracted-card" style="max-width: 420px; background: var(--card-bg, #ffffff); border: 1px solid var(--border, #e2dbce); border-radius: 18px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #6d5ae6 0%, #8b5cf6 100%); padding: 12px 16px; color: #fff;">
          <div style="font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>📄</span> <span>\${l.receiptExtracted || 'Receipt Extracted'}</span>
          </div>
          <div style="font-size: 11px; opacity: 0.85; margin-top: 2px;">\${l.receiptReview || 'Review details extracted by Gemini AI before saving'}</div>
        </div>
        <div style="padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div>
              <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">\${l.amountLabel || 'Amount'}</div>
              <div style="font-size: 22px; font-weight: 800; color: \${typeColor};">
                \${amountDisplay}
              </div>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: \${typeColor}; background: \${isIncome ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'}; padding: 4px 10px; border-radius: 20px;">
              \${isIncome ? '↑' : '↓'} \${typeLabel}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: 13px; background: var(--glass-inner-bg, #f8fafc); padding: 10px 12px; border-radius: 12px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted); font-size: 12px;">\${l.descLabel || 'Description'}:</span>
              <span style="font-weight: 600; color: var(--text-primary); text-align: right;">\${vendor.replace(/</g, '&lt;')}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted); font-size: 12px;">\${l.categoryLabel || 'Category'}:</span>
              <span style="font-weight: 600; color: var(--text-primary);">\${category}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted); font-size: 12px;">\${l.dateLabel || 'Date'}:</span>
              <span style="font-weight: 600; color: var(--text-primary);">\${dateStr}</span>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="cc-card-btn-confirm" id="confirm-receipt-btn" style="flex: 1; padding: 9px 12px; border-radius: 10px; background: var(--accent, #6d5ae6); color: #fff; border: none; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.2s;">
              <span>✓</span> <span>\${l.confirmAndSave || 'Confirm & Save'}</span>
            </button>
            <button class="cc-card-btn-edit" id="edit-receipt-btn" style="padding: 9px 14px; border-radius: 10px; background: var(--glass-inner-bg, #f1f5f9); border: 1.5px solid var(--border, #e2dbce); color: var(--text-primary); font-weight: 600; font-size: 13px; cursor: pointer;">
              \${l.edit || 'Edit'}
            </button>
            <button class="cc-card-btn-dismiss" style="padding: 9px 12px; border-radius: 10px; background: transparent; border: 1.5px solid var(--border, #e2dbce); color: var(--text-muted); cursor: pointer;" title="Dismiss">
              ✕
            </button>
          </div>
        </div>
      </div>
    \`;`;

if (code.includes(oldRenderCard)) {
  code = code.replace(oldRenderCard, newRenderCard);
  console.log('Replaced oldRenderCard');
} else {
  const oldRenderCardCRLF = oldRenderCard.replace(/\n/g, '\r\n');
  if (code.includes(oldRenderCardCRLF)) {
    code = code.replace(oldRenderCardCRLF, newRenderCard.replace(/\n/g, '\r\n'));
    console.log('Replaced oldRenderCard (CRLF)');
  } else {
    console.warn('Could not match oldRenderCard');
  }
}

// 3. Localize saved message in confirmBtn click handler
const oldSavedHtml = `        cardDiv.innerHTML = \`
          <div class="cc-bubble cc-bubble-assistant" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #065f46; font-size: 13.5px; line-height: 1.5;">
            ✅ Saved <strong>\${vendor}</strong> (\${category}) for <strong>\${currSym} \${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> on \${saveDate}. You can view it in the Transactions tab.
          </div>
        \`;
        showToast('Transaction saved successfully!', 'success');`;

const newSavedHtml = `        let savedText = \`✅ Saved <strong>\${vendor}</strong> (\${category}) for <strong>\${currSym} \${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> on \${saveDate}. You can view it in the Transactions tab.\`;
        if (curLang === 'si') {
          savedText = \`✅ සාර්ථකව සුරැකිණි! <strong>\${vendor}</strong> (\${category}) සඳහා <strong>\${currSym} \${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> (\${saveDate} දින). ඔබට මෙය ගනුදෙනු (Transactions) පිටුවෙන් දැක ගත හැක.\`;
        } else if (curLang === 'ta') {
          savedText = \`✅ சேமிக்கப்பட்டது! <strong>\${vendor}</strong> (\${category}) க்காக <strong>\${currSym} \${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> (\${saveDate} திகதி). இதை நீங்கள் பரிவர்த்தனைகள் தாவலில் பார்க்கலாம்.\`;
        }

        cardDiv.innerHTML = \`
          <div class="cc-bubble cc-bubble-assistant" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #065f46; font-size: 13.5px; line-height: 1.5;">
            \${savedText}
          </div>
        \`;
        showToast(curLang === 'si' ? 'ගනුදෙනුව සාර්ථකව සුරකින ලදී!' : curLang === 'ta' ? 'பரிவர்த்தனை வெற்றிகரமாக சேமிக்கப்பட்டது!' : 'Transaction saved successfully!', 'success');`;

if (code.includes(oldSavedHtml)) {
  code = code.replace(oldSavedHtml, newSavedHtml);
  console.log('Replaced oldSavedHtml');
} else {
  const oldSavedHtmlCRLF = oldSavedHtml.replace(/\n/g, '\r\n');
  if (code.includes(oldSavedHtmlCRLF)) {
    code = code.replace(oldSavedHtmlCRLF, newSavedHtml.replace(/\n/g, '\r\n'));
    console.log('Replaced oldSavedHtml (CRLF)');
  } else {
    console.warn('Could not match oldSavedHtml');
  }
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Saved updated cendric-enhancements.js');
