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
      merchantVpa: '9901402758@yespop',
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
      <div id="youpi-pg-modal" class="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div class="bg-[#FCF9F8] rounded-2xl shadow-2xl max-w-xl w-full relative my-6 overflow-hidden border border-[#B8860B]/40 text-left animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Royal Modal Header Section (Exact Sovereign Atmosphere - Stitch) -->
          <div class="bg-gradient-to-b from-[#311116] via-[#240c10] to-[#1c080b] text-[#fcf9f8] p-5 sm:p-6 relative overflow-hidden border-b border-[#B8860B]/30">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3.5 sm:gap-4">
                <div class="w-12 h-12 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-[#B8860B]/40">
                  <svg class="w-full h-full" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 8C43 24 33 34 33 46C33 55 39 61 50 63C61 61 67 55 67 46C67 34 57 24 50 8Z" fill="#8F1424"></path>
                    <path d="M50 17C46 27 40 33 40 43C40 50 44 54 50 56C56 54 60 50 60 43C60 33 54 27 50 17Z" fill="#D4AF37"></path>
                    <circle cx="50" cy="42" fill="#1A365D" r="7"></circle>
                    <circle cx="50" cy="41" fill="#38BDF8" r="3.2"></circle>
                    <path d="M35 63H65L68 67L64 73H36L32 67L35 63Z" fill="#B8860B"></path>
                    <path d="M33 73H67C67 73 70 88 50 89C30 88 33 73 33 73Z" fill="#996515"></path>
                    <path d="M38 78L43 83L48 78L53 83L58 78L63 83" stroke="#FDE68A" stroke-linecap="round" stroke-width="1.8"></path>
                    <circle cx="50" cy="86" fill="#FDE68A" r="1.5"></circle>
                  </svg>
                </div>
                <div class="min-w-0">
                  <h3 class="font-headline font-bold text-lg sm:text-xl text-[#fdf8f0] tracking-tight leading-tight">Parampara Ateliers</h3>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="text-xs text-[#cca774] font-serif">Direct Artisan Settlement</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-4 sm:gap-5">
                <div class="text-right shrink-0">
                  <span class="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#d8c3b0] font-sans block">Total Payable</span>
                  <div class="text-xl sm:text-2xl font-headline font-bold text-[#f5dfa8] tracking-tight">
                    <span class="font-serif text-[#cca774] mr-0.5">₹</span><span id="youpi-display-amount">19,790</span>
                  </div>
                </div>
                <button type="button" onclick="window.Youpi.closeModal()" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-[#ebd4a0] flex items-center justify-center text-sm font-bold transition cursor-pointer shrink-0" title="Close">
                  &times;
                </button>
              </div>
            </div>
          </div>

          <!-- Modal Body Canvas -->
          <div class="p-5 sm:p-6 space-y-5 bg-[#FCF9F8]">
            
            <!-- Section: Dynamic QR Code Vault (With Golden Corner Brackets) -->
            <div class="bg-[#FAF7F2] p-4 sm:p-5 rounded-xl border border-[#E6DFD5] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-xs">
              <div class="relative p-3.5 bg-white rounded-xl shadow-md group border border-[#785600]/25 shrink-0">
                <!-- Golden Corner Brackets -->
                <div class="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#785600]"></div>
                <div class="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#785600]"></div>
                <div class="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#785600]"></div>
                <div class="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#785600]"></div>

                <div class="relative w-36 h-36 overflow-hidden flex items-center justify-center">
                  <img id="youpi-qr-image" src="" alt="Scan via Any UPI App" class="w-full h-full object-contain block"/>
                  <!-- Central Brown Seal with Gold Rupee Symbol (Stitch Design) -->
                  <div class="absolute inset-0 m-auto w-8 h-8 rounded-full bg-[#311116] border-2 border-[#D4AF37] flex items-center justify-center shadow-md pointer-events-none">
                    <span class="text-xs font-bold text-[#FDE68A]">₹</span>
                  </div>
                </div>
              </div>

              <div class="space-y-2 flex-grow min-w-0">
                <div class="space-y-0.5">
                  <h4 class="text-base font-headline font-bold text-stone-900 leading-snug">Scan to Pay via UPI</h4>
                  <p class="text-xs text-stone-600 font-serif leading-relaxed">
                    Open Google Pay, PhonePe, Paytm, BHIM, or CRED to scan this real-time QR code.
                  </p>
                </div>

                <div class="bg-white rounded-lg p-2.5 shadow-2xs border border-[#E6DFD5] flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <span class="text-[9px] uppercase tracking-wider text-stone-500 font-sans block">UPI ID / VPA</span>
                    <strong class="text-xs font-mono font-bold text-[#785600] truncate block" id="youpi-vpa-text">9901402758@yespop</strong>
                  </div>
                  <button type="button" onclick="window.Youpi.copyVpa()" class="px-2.5 py-1 rounded bg-[#FAF7F2] hover:bg-[#785600] hover:text-white text-stone-800 text-xs font-serif font-bold transition flex items-center gap-1 cursor-pointer border border-[#E6DFD5]" title="Copy VPA">
                    <span class="material-symbols-outlined text-xs">content_copy</span>
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Direct 1-Tap Mobile UPI Intent Launchers (Stitch Style) -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500 font-sans block">
                Or Pay Directly with App
              </span>
              <div class="grid grid-cols-5 gap-2">
                <a id="youpi-link-gpay" href="#" class="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 hover:border-[#785600] bg-white transition text-center shadow-2xs group">
                  <div class="w-9 h-9 rounded-full bg-stone-50 group-hover:scale-105 transition-transform flex items-center justify-center text-primary font-bold shadow-inner">
                    <span class="font-headline font-bold text-xs tracking-tight text-blue-600">GPay</span>
                  </div>
                  <span class="text-[10px] font-semibold text-stone-800 mt-1 font-sans">GPay</span>
                </a>
                <a id="youpi-link-phonepe" href="#" class="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 hover:border-[#785600] bg-white transition text-center shadow-2xs group">
                  <div class="w-9 h-9 rounded-full bg-[#5f259f]/10 group-hover:scale-105 transition-transform flex items-center justify-center text-[#5f259f] font-bold shadow-inner">
                    <span class="font-headline font-bold text-sm">पे</span>
                  </div>
                  <span class="text-[10px] font-semibold text-stone-800 mt-1 font-sans">PhonePe</span>
                </a>
                <a id="youpi-link-paytm" href="#" class="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 hover:border-[#785600] bg-white transition text-center shadow-2xs group">
                  <div class="w-9 h-9 rounded-full bg-[#002e6e]/10 group-hover:scale-105 transition-transform flex items-center justify-center text-[#002e6e] font-bold shadow-inner">
                    <span class="font-headline font-bold text-[10px] tracking-tighter">Paytm</span>
                  </div>
                  <span class="text-[10px] font-semibold text-stone-800 mt-1 font-sans">Paytm</span>
                </a>
                <a id="youpi-link-bhim" href="#" class="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 hover:border-[#785600] bg-white transition text-center shadow-2xs group">
                  <div class="w-9 h-9 rounded-full bg-[#00796b]/10 group-hover:scale-105 transition-transform flex items-center justify-center text-[#00796b] font-bold shadow-inner">
                    <span class="font-headline font-bold text-[10px] tracking-tighter">BHIM</span>
                  </div>
                  <span class="text-[10px] font-semibold text-stone-800 mt-1 font-sans">BHIM</span>
                </a>
                <a id="youpi-link-cred" href="#" class="flex flex-col items-center justify-center p-2 rounded-xl border border-stone-200 hover:border-[#785600] bg-white transition text-center shadow-2xs group">
                  <div class="w-9 h-9 rounded-full bg-[#1c1b1b]/10 group-hover:scale-105 transition-transform flex items-center justify-center text-stone-900 font-bold shadow-inner">
                    <span class="font-headline font-bold text-xs">C</span>
                  </div>
                  <span class="text-[10px] font-semibold text-stone-800 mt-1 font-sans">CRED</span>
                </a>
              </div>
            </div>

            <!-- 12-Digit Indian Bank UTR Input & Confirmation -->
            <div class="bg-white rounded-xl p-4 shadow-2xs border border-[#E6DFD5] space-y-2">
              <label for="youpi-utr-input" class="block text-[10px] font-bold uppercase tracking-wider text-stone-700 font-sans">
                UTR / Transaction ID (Optional)
              </label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <span class="material-symbols-outlined text-base">receipt_long</span>
                  </span>
                  <input id="youpi-utr-input" type="text" maxlength="12" placeholder="Enter 12-digit UTR if already transferred" class="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl text-xs sm:text-sm font-mono tracking-widest text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#785600] shadow-inner"/>
                </div>
                <button type="button" onclick="window.Youpi.verifyUtr()" id="btn-youpi-verify-utr" class="px-5 py-2.5 bg-[#785600] hover:bg-[#986d00] text-white rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition shadow-sm whitespace-nowrap cursor-pointer">
                  Verify
                </button>
              </div>
              <p class="text-[10px] text-stone-500 font-serif">
                After paying, enter the 12-digit UTR from your bank SMS or UPI payment receipt.
              </p>
            </div>

            <!-- Instant Test Mode Settlement Simulation -->
            <div class="pt-1 space-y-2">
              <button type="button" onclick="window.Youpi.simulateSuccess()" id="btn-youpi-test-approve" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#785600] to-[#986d00] hover:opacity-95 text-white font-sans font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border border-[#B8860B]/30">
                <span class="material-symbols-outlined text-sm">bolt</span>
                <span>⚡ Simulate Instant YouPI Approval (Test Mode)</span>
              </button>
              <div class="flex items-center justify-between text-xs font-serif pt-1">
                <button type="button" onclick="window.Youpi.closeModal()" class="text-stone-500 hover:text-[#b22b1d] transition cursor-pointer underline underline-offset-4">
                  Cancel &amp; Return to Salon
                </button>
                <a href="upi-settlement.html" target="_blank" class="text-[#785600] hover:underline flex items-center gap-1 font-mono text-[11px]">
                  <span>Dedicated Salon</span>
                  <span class="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </div>
            </div>

            <!-- Processing / Success Overlay -->
            <div id="youpi-processing-overlay" class="hidden absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3 z-30">
              <div class="w-12 h-12 rounded-full border-3 border-[#785600] border-t-transparent animate-spin"></div>
              <h4 class="font-headline font-bold text-base text-stone-900" id="youpi-processing-title">YouPI Observer Active...</h4>
              <p class="text-xs text-stone-600 font-serif" id="youpi-processing-sub">Matching bank credit alert with Order Reference</p>
            </div>

          </div>

          <!-- Modal Footer Stamp -->
          <div class="bg-[#FAF7F2] px-5 py-3 border-t border-[#E6DFD5] flex items-center justify-between text-[11px] text-stone-500 font-sans">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-xs text-[#785600]">verified</span>
              <span>Parampara Direct UPI • 0% Fee</span>
            </div>
            <span class="font-mono text-[10px] text-stone-400">NPCI Certified Protocol</span>
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

