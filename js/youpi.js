/**
 * YouPI-PG (Your UPI Payment Gateway - Zero Platform Fee Client Engine)
 * Open-Source Direct Peer-to-Merchant & Peer-to-Artisan UPI Infrastructure
 * Repository: https://github.com/youpi-pg/YouPI-PG
 *
 * Implements:
 * - Dynamic Vector QR Code generation with pre-encoded amount & order reference
 * - Deep links for instant 1-tap mobile UPI intent launch (GPay, PhonePe, Paytm, BHIM, CRED)
 * - 12-digit Indian Bank UTR (UPI Ref ID / RR No.) verification
 * - 5-minute single-slot deterministic FIFO reservation countdown clock
 * - 0% platform fee direct bank settlement with 70% master artisan allocation
 */

(function(window) {
  'use strict';

  let countdownInterval = null;

  const Youpi = {
    version: '1.2.0',
    config: {
      merchantVpa: 'parampara.ateliers@icici',
      merchantName: 'Parampara Royal Ateliers',
      themeColor: '#0f766e',
      feePercentage: 0
    },

    currentSession: null,

    /**
     * Launch YouPI-PG Checkout Modal
     * @param {Object} options
     * @param {string} options.order_id
     * @param {number} options.amount
     * @param {string} [options.currency='INR']
     * @param {string} [options.merchant_vpa]
     * @param {Object} [options.prefill]
     * @param {Function} options.handler
     * @param {Function} [options.onClose]
     */
    pay: function(options) {
      if (!options || typeof options.amount === 'undefined') {
        console.error('[YouPI-PG] Order amount is required to launch YouPI gateway.');
        return;
      }

      this.currentSession = {
        orderId: options.order_id || 'ORD-' + Date.now(),
        amount: Number(options.amount),
        currency: options.currency || 'INR',
        merchantVpa: options.merchant_vpa || this.config.merchantVpa,
        merchantName: options.merchant_name || this.config.merchantName,
        handler: options.handler || function() {},
        onClose: options.onClose || function() {},
        prefill: options.prefill || {}
      };

      this.ensureModalExists();
      this.populateModalData();
      this.startCountdown(300); // 5 minutes
      this.openModal();
    },

    /**
     * Formats number to Indian Rupee currency format
     */
    formatINR: function(amount) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    },

    /**
     * Ensures the YouPI-PG modal HTML is injected into the DOM
     */
    ensureModalExists: function() {
      let modal = document.getElementById('youpi-pg-modal');
      if (modal) return;

      const modalHtml = `
      <div id="youpi-pg-modal" class="fixed inset-0 z-[300] bg-black/75 backdrop-blur-md hidden flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full relative my-6 overflow-hidden border border-emerald-900/20 text-left animate-in fade-in zoom-in-95 duration-200">
          
          <!-- YouPI Gateway Emerald Header -->
          <div class="bg-gradient-to-r from-[#042f2e] via-[#0f766e] to-[#042f2e] text-white p-5 pt-6 relative border-b border-emerald-500/20">
            <!-- 0% Fee Ribbon -->
            <div class="absolute top-0 right-0 z-20">
              <span class="inline-flex items-center gap-1 bg-[#10b981] text-[#022c22] text-[9px] font-sans font-extrabold uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                <span>⚡ 0% Fee</span> • <span>Direct Bank</span>
              </span>
            </div>

            <button type="button" onclick="window.Youpi.closeModal()" class="absolute top-3.5 left-3.5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">
              &times;
            </button>

            <div class="flex items-center gap-3.5 pl-6">
              <div class="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-emerald-300/40">
                <img src="assets/parampara_logo_crest.webp" alt="Parampara" class="w-full h-full object-contain" onerror="this.src='assets/products/blue_pottery_vase.webp'"/>
              </div>
              <div class="min-w-0 pr-16">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-mono font-bold tracking-wider text-emerald-300">YOUPI-PG</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">Open Source</span>
                </div>
                <h3 class="font-headline font-bold text-base text-white truncate leading-tight">Parampara Royal Ateliers</h3>
                <p class="text-[11px] text-emerald-100/80 font-serif truncate">Peer-to-Merchant • 70% Direct Artisan Payout</p>
              </div>
            </div>
          </div>

          <!-- Session & Amount Strip -->
          <div class="bg-[#022c22] text-white px-5 py-3 flex items-center justify-between border-t border-emerald-900/60">
            <div>
              <span class="text-[10px] text-emerald-300 uppercase tracking-widest block font-mono">Net Sovereign Settlement</span>
              <span class="text-[10px] text-emerald-400 font-mono" id="youpi-customer-badge">Patron Verified</span>
            </div>
            <div class="text-right">
              <span class="font-sans font-bold text-xl text-emerald-300 tracking-tight" id="youpi-display-amount">₹19,790</span>
            </div>
          </div>

          <!-- Reservation Countdown Bar -->
          <div class="bg-emerald-50 px-5 py-2 flex items-center justify-between text-[11px] border-b border-emerald-100 font-mono text-emerald-800">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>FIFO Single-Slot Locked</span>
            </div>
            <div class="flex items-center gap-1 font-bold" id="youpi-countdown-timer">
              <span class="material-symbols-outlined text-xs animate-spin">schedule</span>
              <span>04:59 mins</span>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-5 space-y-4">
            
            <!-- Dynamic Vector QR Section -->
            <div class="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E6DFD5] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div class="relative w-36 h-36 bg-white p-2 rounded-xl border-2 border-emerald-700/50 shadow-md shrink-0 flex items-center justify-center">
                <img id="youpi-qr-image" src="" alt="Scan via Any UPI App" class="w-full h-full object-contain"/>
                <div class="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white p-1 shadow flex items-center justify-center border border-emerald-600">
                  <span class="text-xs font-bold text-emerald-800">₹</span>
                </div>
              </div>

              <div class="space-y-1.5 flex-grow min-w-0">
                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Scan via Any UPI App
                </span>
                <p class="text-xs text-stone-700 font-serif leading-relaxed">
                  Open Google Pay, PhonePe, Paytm, BHIM, or CRED on your phone and scan this real-time QR code.
                </p>
                <div class="pt-1 flex items-center justify-center sm:justify-start gap-1 text-[11px] font-mono text-stone-600">
                  <span>VPA:</span>
                  <strong class="text-stone-900" id="youpi-vpa-text">parampara.ateliers@icici</strong>
                  <button type="button" onclick="window.Youpi.copyVpa()" class="text-emerald-700 hover:text-emerald-900 ml-1 text-xs cursor-pointer" title="Copy VPA">
                    <span class="material-symbols-outlined text-sm align-middle">content_copy</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Direct 1-Tap Mobile UPI Intent Launchers -->
            <div class="space-y-1.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-sans block">
                Or Tap to Open UPI App on This Device
              </span>
              <div class="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                <a id="youpi-link-gpay" href="#" class="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50 hover:bg-white transition text-center shadow-2xs">
                  <span class="w-6 h-6 rounded-full bg-white shadow-2xs flex items-center justify-center text-xs font-bold text-blue-600 mb-0.5">G</span>
                  <span class="text-[10px] font-serif font-bold text-stone-800">GPay</span>
                </a>
                <a id="youpi-link-phonepe" href="#" class="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50 hover:bg-white transition text-center shadow-2xs">
                  <span class="w-6 h-6 rounded-full bg-purple-700 text-white shadow-2xs flex items-center justify-center text-xs font-bold mb-0.5">पे</span>
                  <span class="text-[10px] font-serif font-bold text-stone-800">PhonePe</span>
                </a>
                <a id="youpi-link-paytm" href="#" class="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50 hover:bg-white transition text-center shadow-2xs">
                  <span class="w-6 h-6 rounded-full bg-cyan-600 text-white shadow-2xs flex items-center justify-center text-[9px] font-bold mb-0.5">Pay</span>
                  <span class="text-[10px] font-serif font-bold text-stone-800">Paytm</span>
                </a>
                <a id="youpi-link-bhim" href="#" class="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50 hover:bg-white transition text-center shadow-2xs">
                  <span class="w-6 h-6 rounded-full bg-orange-600 text-white shadow-2xs flex items-center justify-center text-[8px] font-bold mb-0.5">BH</span>
                  <span class="text-[10px] font-serif font-bold text-stone-800">BHIM</span>
                </a>
                <a id="youpi-link-cred" href="#" class="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50 hover:bg-white transition text-center shadow-2xs">
                  <span class="w-6 h-6 rounded-full bg-black text-white shadow-2xs flex items-center justify-center text-xs font-bold mb-0.5">C</span>
                  <span class="text-[10px] font-serif font-bold text-stone-800">CRED</span>
                </a>
              </div>
            </div>

            <!-- 12-Digit Indian Bank UTR Input & Confirmation -->
            <div class="pt-2 border-t border-stone-200 space-y-2">
              <label for="youpi-utr-input" class="block text-[10px] font-bold uppercase tracking-wider text-stone-600 font-sans">
                Confirm Bank UTR (UPI Ref ID / RR No.) *
              </label>
              <div class="flex gap-2">
                <input id="youpi-utr-input" type="text" maxlength="12" placeholder="e.g. 430182910382" class="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl text-sm font-mono tracking-widest text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-inner"/>
                <button type="button" onclick="window.Youpi.verifyUtr()" id="btn-youpi-verify-utr" class="px-4 py-2.5 bg-[#0f766e] hover:bg-[#042f2e] text-white rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition shadow-sm whitespace-nowrap cursor-pointer">
                  Verify UTR
                </button>
              </div>
              <p class="text-[10px] text-stone-500 font-serif">
                After paying, enter the 12-digit UTR from your bank SMS or UPI payment receipt.
              </p>
            </div>

            <!-- Instant Test Mode Settlement Simulation -->
            <div class="pt-1 space-y-2">
              <button type="button" onclick="window.Youpi.simulateSuccess()" id="btn-youpi-test-approve" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-sans font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30">
                <span class="material-symbols-outlined text-sm">bolt</span>
                <span>⚡ Simulate Instant YouPI Approval (Test Mode)</span>
              </button>
              <button type="button" onclick="window.Youpi.closeModal()" class="w-full py-1.5 text-stone-400 hover:text-stone-700 text-xs font-serif transition text-center cursor-pointer">
                Cancel &amp; Return to Salon
              </button>
            </div>

            <!-- Processing / Success Overlay -->
            <div id="youpi-processing-overlay" class="hidden absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3 z-30">
              <div class="w-12 h-12 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin"></div>
              <h4 class="font-headline font-bold text-base text-stone-900" id="youpi-processing-title">YouPI Observer Active...</h4>
              <p class="text-xs text-stone-600 font-serif" id="youpi-processing-sub">Matching bank credit alert with Order Reference</p>
            </div>

          </div>

          <!-- Modal Footer Stamp -->
          <div class="bg-stone-50 px-5 py-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500 font-sans">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-xs text-emerald-600">verified</span>
              <span>YouPI Gateway • 0% Fee</span>
            </div>
            <a href="https://github.com/youpi-pg/YouPI-PG" target="_blank" rel="noopener noreferrer" class="text-emerald-700 hover:underline font-mono text-[10px]">
              github.com/youpi-pg/YouPI-PG
            </a>
          </div>

        </div>
      </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);

      // Auto-filter numeric input on UTR field
      const utrInput = document.getElementById('youpi-utr-input');
      if (utrInput) {
        utrInput.addEventListener('input', function() {
          this.value = this.value.replace(/\D/g, '').slice(0, 12);
        });
      }
    },

    /**
     * Populates modal with active order data, dynamic QR, and deep links
     */
    populateModalData: function() {
      const session = this.currentSession;
      if (!session) return;

      const amtEl = document.getElementById('youpi-display-amount');
      if (amtEl) amtEl.textContent = this.formatINR(session.amount);

      const vpaEl = document.getElementById('youpi-vpa-text');
      if (vpaEl) vpaEl.textContent = session.merchantVpa;

      const badgeEl = document.getElementById('youpi-customer-badge');
      if (badgeEl && session.prefill && session.prefill.email) {
        badgeEl.textContent = `${session.prefill.email} • Order #${session.orderId.slice(-6)}`;
      }

      // Build official NPCI standard UPI URI
      const upiUri = `upi://pay?pa=${encodeURIComponent(session.merchantVpa)}&pn=${encodeURIComponent(session.merchantName)}&am=${session.amount}&cu=INR&tr=${encodeURIComponent(session.orderId)}&tn=${encodeURIComponent('GI Artisan Order #' + session.orderId)}`;

      // Update QR Code Image
      const qrImg = document.getElementById('youpi-qr-image');
      if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}`;
      }

      // Update Intent App Links
      const apps = ['gpay', 'phonepe', 'paytm', 'bhim', 'cred'];
      apps.forEach(app => {
        const linkEl = document.getElementById(`youpi-link-${app}`);
        if (linkEl) linkEl.href = upiUri;
      });

      // Clear previous UTR input
      const utrInput = document.getElementById('youpi-utr-input');
      if (utrInput) utrInput.value = '';

      // Reset overlay
      const overlay = document.getElementById('youpi-processing-overlay');
      if (overlay) overlay.classList.add('hidden');
    },

    /**
     * Starts 5-minute single-slot countdown timer
     */
    startCountdown: function(durationSeconds) {
      if (countdownInterval) clearInterval(countdownInterval);
      let secondsLeft = durationSeconds;
      const timerEl = document.getElementById('youpi-countdown-timer');
      if (!timerEl) return;

      function update() {
        const m = Math.floor(secondsLeft / 60);
        const s = secondsLeft % 60;
        timerEl.innerHTML = `<span class="material-symbols-outlined text-xs animate-spin">schedule</span> <span>${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} mins</span>`;
        if (secondsLeft <= 0) {
          clearInterval(countdownInterval);
          timerEl.innerHTML = '<span class="text-red-600 font-bold">Session Expired</span>';
        } else {
          secondsLeft--;
        }
      }
      update();
      countdownInterval = setInterval(update, 1000);
    },

    /**
     * Copy Merchant VPA helper
     */
    copyVpa: function() {
      const vpa = this.currentSession?.merchantVpa || this.config.merchantVpa;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(vpa).then(() => {
          if (typeof showToast === 'function') {
            showToast(`Copied VPA "${vpa}" to clipboard!`, 'info');
          }
        });
      }
    },

    openModal: function() {
      const modal = document.getElementById('youpi-pg-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    },

    closeModal: function() {
      const modal = document.getElementById('youpi-pg-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      if (countdownInterval) clearInterval(countdownInterval);
      if (this.currentSession && typeof this.currentSession.onClose === 'function') {
        this.currentSession.onClose();
      }
    },

    /**
     * Verify customer-submitted 12-digit Indian Bank UTR
     */
    verifyUtr: function() {
      const input = document.getElementById('youpi-utr-input');
      const utr = input ? input.value.trim() : '';

      if (!/^\d{12}$/.test(utr)) {
        if (input) {
          input.classList.add('border-red-500', 'bg-red-50');
          input.focus();
        }
        if (typeof showToast === 'function') {
          showToast('Please enter a valid 12-digit Indian Bank UTR reference.', 'error');
        }
        return;
      }
      if (input) input.classList.remove('border-red-500', 'bg-red-50');

      this.executeApproval(utr, 'Customer UTR Verified');
    },

    /**
     * Simulate instant incoming credit observation in Test Mode
     */
    simulateSuccess: function() {
      const testUtr = '4' + Math.floor(10000000000 + Math.random() * 90000000000);
      const input = document.getElementById('youpi-utr-input');
      if (input) input.value = testUtr;

      this.executeApproval(testUtr, 'YouPI Observer Auto-Matched');
    },

    executeApproval: function(utr, approvalSource) {
      const overlay = document.getElementById('youpi-processing-overlay');
      const title = document.getElementById('youpi-processing-title');
      const sub = document.getElementById('youpi-processing-sub');

      if (overlay) {
        overlay.classList.remove('hidden');
        if (title) title.textContent = 'Verifying Bank Credit via YouPI Observer...';
        if (sub) sub.textContent = `UTR: ${utr} • Checking direct peer-to-merchant credit...`;
      }

      setTimeout(() => {
        if (title) title.innerHTML = '<span class="text-emerald-700">Payment Verified! ✅</span>';
        if (sub) sub.textContent = 'Direct bank settlement credited with 0% platform fee.';

        setTimeout(() => {
          this.closeModal();
          const session = this.currentSession;
          if (session && typeof session.handler === 'function') {
            session.handler({
              success: true,
              gateway: 'YouPI-PG',
              utr,
              paymentId: `youpi_pay_${Date.now()}_${utr.slice(-4)}`,
              orderId: session.orderId,
              amount: session.amount,
              currency: session.currency,
              feePercentage: 0,
              approvalSource
            });
          }
        }, 600);
      }, 700);
    }
  };

  window.Youpi = Youpi;
})(window);

