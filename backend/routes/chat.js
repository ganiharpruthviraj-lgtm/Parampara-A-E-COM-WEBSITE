const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    Parampara Mitra AI Shopping Concierge & Cultural Intelligence
 * @access  Public
 */
// Parampara Mitra Chatbot Endpoint (Connected to MongoDB Product, Order & Store Knowledge Base)
router.post('/', async (req, res) => {
  const { message, history, cart } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message query is required' });
  }

  const query = message.trim().toLowerCase();
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const mongoose = require('mongoose');
  const isDbConnected = mongoose.connection.readyState === 1;

  let reply = '';
  let suggestions = [];

  // ── Helper: Fast Levenshtein distance for fuzzy typo tolerance ──
  function getLevenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const d = [];
    for (let i = 0; i <= b.length; i++) d[i] = [i];
    for (let j = 0; j <= a.length; j++) d[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        d[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
          ? d[i - 1][j - 1]
          : Math.min(d[i - 1][j - 1] + 1, d[i][j - 1] + 1, d[i - 1][j] + 1);
      }
    }
    return d[b.length][a.length];
  }

  // ── Canonical State & Craft Aliases (Handling Common Indian Typos & Dialects) ──
  const stateAliases = {
    'karnataka': 'Karnataka', 'karnatka': 'Karnataka', 'karnatak': 'Karnataka', 'kanataka': 'Karnataka', 'bangalore': 'Karnataka', 'bengaluru': 'Karnataka', 'mysore': 'Karnataka', 'mysuru': 'Karnataka',
    'kashmir': 'Jammu and Kashmir', 'kasmir': 'Jammu and Kashmir', 'kashmeer': 'Jammu and Kashmir', 'jammu': 'Jammu and Kashmir', 'j&k': 'Jammu and Kashmir', 'jk': 'Jammu and Kashmir', 'srinagar': 'Jammu and Kashmir',
    'rajasthan': 'Rajasthan', 'rajsthan': 'Rajasthan', 'rajastan': 'Rajasthan', 'jaipur': 'Rajasthan', 'jodhpur': 'Rajasthan', 'udaipur': 'Rajasthan',
    'bengal': 'West Bengal', 'west bengal': 'West Bengal', 'kolkata': 'West Bengal', 'calcutta': 'West Bengal', 'darjeeling': 'West Bengal',
    'up': 'Uttar Pradesh', 'uttar pradesh': 'Uttar Pradesh', 'uttarpradesh': 'Uttar Pradesh', 'varanasi': 'Uttar Pradesh', 'banaras': 'Uttar Pradesh', 'kashi': 'Uttar Pradesh', 'lucknow': 'Uttar Pradesh',
    'mp': 'Madhya Pradesh', 'madhya pradesh': 'Madhya Pradesh', 'madhyapradesh': 'Madhya Pradesh', 'indore': 'Madhya Pradesh', 'bhopal': 'Madhya Pradesh',
    'tn': 'Tamil Nadu', 'tamil nadu': 'Tamil Nadu', 'tamilnadu': 'Tamil Nadu', 'chennai': 'Tamil Nadu', 'thanjavur': 'Tamil Nadu', 'tanjore': 'Tamil Nadu',
    'andhra': 'Andhra Pradesh', 'andhra pradesh': 'Andhra Pradesh', 'ap': 'Andhra Pradesh',
    'maharashtra': 'Maharashtra', 'maharastra': 'Maharashtra', 'mh': 'Maharashtra', 'mumbai': 'Maharashtra', 'bombay': 'Maharashtra', 'pune': 'Maharashtra', 'kolhapur': 'Maharashtra',
    'odisha': 'Odisha', 'orissa': 'Odisha', 'odisa': 'Odisha', 'bhubaneswar': 'Odisha', 'puri': 'Odisha',
    'gujarat': 'Gujarat', 'gujrat': 'Gujarat', 'gujarath': 'Gujarat', 'ahmedabad': 'Gujarat', 'surat': 'Gujarat', 'patan': 'Gujarat', 'kutch': 'Gujarat',
    'assam': 'Assam', 'asam': 'Assam', 'guwahati': 'Assam',
    'bihar': 'Bihar', 'patna': 'Bihar', 'madhubani': 'Bihar',
    'chhattisgarh': 'Chhattisgarh', 'chattisgarh': 'Chhattisgarh', 'bastar': 'Chhattisgarh',
    'himachal': 'Himachal Pradesh', 'himachal pradesh': 'Himachal Pradesh', 'kullu': 'Himachal Pradesh', 'shimla': 'Himachal Pradesh',
    'kerala': 'Kerala', 'cochin': 'Kerala', 'kochi': 'Kerala',
    'punjab': 'Punjab', 'amritsar': 'Punjab', 'phulkari': 'Punjab',
    'telangana': 'Telangana', 'hyderabad': 'Telangana', 'pochampally': 'Telangana'
  };

  const craftAliases = {
    'pashmina': 'Pashmina', 'pashmeena': 'Pashmina', 'pashminaa': 'Pashmina', 'cashmere': 'Pashmina',
    'bidri': 'Bidriware', 'bidriware': 'Bidriware', 'bidree': 'Bidriware',
    'channapatna': 'Channapatna', 'chanapatna': 'Channapatna', 'channapatana': 'Channapatna',
    'rosewood': 'Rosewood', 'sheesham': 'Rosewood', 'sandalwood': 'Wood', 'sandal': 'Wood', 'chandan': 'Wood',
    'banarasi': 'Banarasi', 'banaras': 'Banarasi', 'kashi': 'Banarasi',
    'blue pottery': 'Pottery', 'bluepottery': 'Pottery', 'quartz pottery': 'Quartz Pottery',
    'kantha': 'Kantha', 'kanta': 'Kantha',
    'madhubani': 'Madhubani', 'mithila': 'Madhubani',
    'chikankari': 'Chikankari', 'chikan': 'Chikankari',
    'kinhal': 'Kinhal', 'kinnal': 'Kinhal',
    'ganjifa': 'Ganjifa', 'ganjifa cards': 'Ganjifa',
    'navalgund': 'Navalgund', 'jamkhana': 'Navalgund',
    'kasuti': 'Kasuti', 'kasuthi': 'Kasuti',
    'lambani': 'Lambani', 'banjara': 'Lambani',
    'sanganeri': 'Sanganeri', 'sanganer': 'Sanganeri',
    'dokra': 'Lost-Wax', 'dhokra': 'Lost-Wax', 'lost wax': 'Lost-Wax', 'lost-wax': 'Lost-Wax',
    'phulkari': 'Phulkari',
    'thanjavur': 'Tanjore', 'tanjore': 'Tanjore',
    'muga': 'Muga', 'muga silk': 'Muga',
    'kanchipuram': 'Kanchipuram', 'kanjeevaram': 'Kanchipuram', 'kanchi': 'Kanchipuram',
    'paithani': 'Paithani', 'yeola': 'Paithani',
    'chanderi': 'Chanderi',
    'baluchari': 'Baluchari',
    'kosa': 'Kosa', 'tussar': 'Kosa',
    'papier mache': 'Papier', 'papier-mache': 'Papier', 'naqashi': 'Papier',
    'walnut': 'Walnut', 'walnut wood': 'Walnut',
    'kolhapuri': 'Kolhapuri', 'chappal': 'Kolhapuri', 'sandals': 'Kolhapuri',
    'pochampally': 'Pochampally', 'ikat': 'Ikat',
    'saffron': 'Saffron', 'kesar': 'Saffron',
    'tea': 'Tea', 'darjeeling': 'Tea', 'assam tea': 'Tea',
    'sitar': 'Sitar', 'tanpura': 'Tanpura', 'miraj': 'Miraj',
    'aranmula': 'Metal Mirror', 'kannadi': 'Metal Mirror',
    'kasavu': 'Kasavu',
    'solapur': 'Solapur', 'chaddar': 'Solapur',
    'warli': 'Warli'
  };

  // ── Helper: Extract recent conversation context & track shown products for pagination ──
  function getRecentContext() {
    let state = null;
    let craft = null;
    let category = null;
    let alreadyShownCount = 0;
    const shownIds = new Set();

    if (Array.isArray(history) && history.length > 0) {
      for (let i = history.length - 1; i >= 0; i--) {
        const h = history[i];
        const text = (h.content || '').toLowerCase();

        // 1. Extract already shown product card IDs from assistant turns
        if (h.role === 'assistant') {
          const cardMatches = text.matchAll(/\[action:product-card\|([^|]+)\|/g);
          for (const m of cardMatches) {
            shownIds.add(m[1]);
            alreadyShownCount++;
          }
        }

        // 2. Extract search criteria ONLY from user's explicit queries
        if (h.role === 'user') {
          if (!state) {
            for (const [alias, realState] of Object.entries(stateAliases)) {
              if (new RegExp('\\b' + alias + '\\b', 'i').test(text)) {
                state = realState;
                break;
              }
            }
          }
          if (!craft) {
            for (const [alias, realCraft] of Object.entries(craftAliases)) {
              if (new RegExp('\\b' + alias + '\\b', 'i').test(text)) {
                craft = realCraft;
                break;
              }
            }
          }
        }
      }
    }
    return { state, craft, category, alreadyShownCount, shownIds: Array.from(shownIds) };
  }

  // ── 1. Database Status Query ──
  if (query.includes('database') || query.includes('db connected') || query.includes('connection status') || query.includes('connected to database')) {
    if (isDbConnected) {
      try {
        const productCount = await Product.countDocuments();
        const host = mongoose.connection.host || 'MongoDB Atlas';
        reply = `🟢 **Database Connected!**\n\n• **Status:** Active & Online (State: Connected)\n• **Host:** ${host}\n• **Total Products Registered:** ${productCount} authentic heritage items across all 28 states of India\n• **Collections Connected:** Products, Users, Orders, GI Registry\n\nParampara Mitra has full real-time access to the live product catalog, order tracking, and pricing database.`;
        suggestions = ['Karnataka crafts', 'Kashmir Pashmina', 'Return policy', 'How to buy?'];
      } catch (err) {
        reply = `🟡 Database is connected, but query failed: ${err.message}`;
      }
    } else {
      reply = `🔴 **Database Offline:** MongoDB is currently in offline mode. Responses are using local GI knowledge base fallbacks.`;
    }
    return res.json({ reply, suggestions });
  }

  // ── 2. Live Order Tracking (Grounded in MongoDB Order Collection) ──
  const isOrderQuery = query.includes('track') || query.includes('order') || query.includes('where is my order')
    || query.includes('order status') || query.includes('mera order') || query.includes('order kab aayega');

  const orderIdMatch = message.match(/\b([a-f0-9]{24}|(?:PRM|PAR|ORD)[-_]?[0-9]+[a-z0-9_-]*|order_[a-z0-9_]+)\b/i);

  if (isOrderQuery && (orderIdMatch || query.includes('track order') || query.includes('where is my order') || query.includes('order status') || query.includes('mera order'))) {
    if (orderIdMatch) {
      const orderIdStr = (orderIdMatch[1] || orderIdMatch[0]).trim();
      let foundOrder = null;
      if (isDbConnected) {
        try {
          if (mongoose.Types.ObjectId.isValid(orderIdStr)) {
            foundOrder = await Order.findById(orderIdStr);
          }
          if (!foundOrder) {
            foundOrder = await Order.findOne({
              $or: [
                { _id: orderIdStr },
                { 'paymentResult.razorpayOrderId': orderIdStr },
                { 'paymentResult.id': orderIdStr }
              ]
            });
          }
        } catch (e) {}
      }

      if (foundOrder) {
        const statusEmoji = {
          'Processing': '⏳',
          'Handcrafted': '🏺',
          'Dispatched': '🚚',
          'Delivered': '✅'
        }[foundOrder.orderStatus] || '📦';

        const orderItemsSummary = (foundOrder.orderItems || []).map(i => `• **${i.name}** × ${i.qty || 1} — ₹${((i.price || 0) * (i.qty || 1)).toLocaleString('en-IN')}`).join('\n');
        const artisanContribution = foundOrder.artisanSupportContribution || Math.round((foundOrder.totalPrice || 0) * 0.7);
        const destination = foundOrder.shippingAddress ? `${foundOrder.shippingAddress.city}, ${foundOrder.shippingAddress.state}` : 'Registered Address';

        reply = `📦 **Live Order Tracking — Order #${foundOrder._id}:**\n\n• **Fulfillment Status:** ${statusEmoji} **${foundOrder.orderStatus || 'Processing'}**\n• **Payment:** ${foundOrder.isPaid ? 'Paid & Verified ✓' : 'Payment Pending'}\n• **Destination:** ${destination}\n• **Total Amount:** ₹${(foundOrder.totalPrice || 0).toLocaleString('en-IN')}\n• **70% Direct Artisan Payout:** ₹${artisanContribution.toLocaleString('en-IN')} (Directly credited to artisan cluster)\n\n**Items in this Order:**\n${orderItemsSummary || '• Authenticated Heritage Craft Piece'}\n\n📄 [Download Official GI Certificate & Tax Invoice (PDF)](/api/orders/${foundOrder._id}/invoice-pdf)`;
        suggestions = ['Shipping Policy', 'Return Policy', 'What is in my bag?', 'Browse Shop'];
        return res.json({ reply, suggestions });
      } else {
        reply = `🔍 **Order Tracking Lookup:**\n\nWe could not find an active order matching ID **"${orderIdStr}"** in our database.\n\nPlease verify the Order ID received in your checkout confirmation screen, SMS, or email (format: \`PAR-2026-XXXX\` or 24-character ID).\n\nIf you placed your order recently, standard museum-grade packing and artisan inspection takes **24–48 hours**, followed by **3–5 business days** insured doorstep delivery.`;
        suggestions = ['Shipping Policy', 'What is in my bag?', 'Return Policy', 'Browse Shop'];
        return res.json({ reply, suggestions });
      }
    } else {
      reply = `📦 **Track Your Authentic Heritage Order:**\n\nTo view real-time fulfillment status, artisan certificate verification, and delivery timeline, please reply with your **Order ID**.\n\n*(Example: "Track order 65f1234..." or "Where is order PAR-2026-9821")*\n\n• **Standard Insured Delivery:** 3 to 5 business days across India.\n• **Museum Packaging:** Insured against transit damage with sealed GI provenance holograms.`;
      suggestions = ['Shipping Policy', 'Return Policy', 'What is in my bag?', 'Browse Shop'];
      return res.json({ reply, suggestions });
    }
  }

  // ── 3. Conversational Add-to-Cart Intent ("Add [Craft/Product] to bag/cart") ──
  const isAddToCartIntent = (query.includes('add') || query.includes('daal') || query.includes('rakh'))
    && (query.includes('cart') || query.includes('bag') || query.includes('basket') || query.includes('bag me') || query.includes('cart me'));

  if (isAddToCartIntent && isDbConnected) {
    const rawTarget = query.replace(/add|to|my|the|cart|bag|basket|in|into|daal|do|rakh|me/gi, '').trim();
    if (rawTarget.length > 2) {
      try {
        const prodToAdd = await Product.findOne({
          $or: [
            { craft: new RegExp(rawTarget, 'i') },
            { name: new RegExp(rawTarget, 'i') },
            { state: new RegExp(rawTarget, 'i') }
          ]
        });
        if (prodToAdd) {
          const safeName = prodToAdd.name.replace(/\|/g, '-');
          reply = `🛍️ **Added to Your Shopping Bag!**\n\nI have added **${prodToAdd.name}** (₹${prodToAdd.price.toLocaleString('en-IN')}) from **${prodToAdd.state}** to your bag.\n\n• **70% Direct Artisan Share:** ₹${Math.round(prodToAdd.price * 0.7).toLocaleString('en-IN')}\n• **GI Certified Authenticity:** Verified ✓\n\n[action:add-to-cart|${prodToAdd._id}|${safeName}|${prodToAdd.price}]`;
          suggestions = ['What is in my bag?', 'Proceed to Checkout', `More from ${prodToAdd.state}`, 'Shipping Policy'];
          return res.json({ reply, suggestions });
        }
      } catch (e) {}
    }
  }

  // ── 4. Live Cart & Bag Inspection (Aware of user's active bag) ──
  const isCartQuery = query.includes('cart') || query.includes('bag') || query.includes('basket')
    || query.includes('mera bag') || query.includes('bag me kya') || query.includes('cart me kya') || query.includes('kitna hua');

  if (isCartQuery && !query.includes('add')) {
    if (query.includes('clear') || query.includes('empty') || query.includes('hata do') || query.includes('khali')) {
      reply = `🗑️ **Your shopping bag has been cleared.**\n\nWould you like recommendations for mastercraft pieces from Karnataka or Kashmir to begin a new collection?\n\n[action:clear-cart]`;
      suggestions = ['Karnataka crafts', 'Kashmir Pashmina', 'Browse Shop', 'Return Policy'];
      return res.json({ reply, suggestions });
    }

    const currentCart = Array.isArray(cart) ? cart : [];
    if (currentCart.length === 0) {
      reply = `🛍️ **Your Shopping Bag is Currently Empty:**\n\nYou haven't added any certified heritage crafts to your bag yet.\n\nWould you like me to recommend top GI-certified treasures from **Karnataka** (Bidriware, Rosewood), **Kashmir** (Pashmina), or **Rajasthan** (Blue Pottery)?`;
      suggestions = ['Karnataka crafts', 'Kashmir Pashmina', 'Browse Shop', 'Return Policy'];
      return res.json({ reply, suggestions });
    }

    let subtotal = 0;
    let itemCount = 0;
    const itemsList = currentCart.map((item, idx) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      const itemTotal = price * qty;
      subtotal += itemTotal;
      itemCount += qty;
      return `${idx + 1}. **${item.name}** × ${qty} — ₹${itemTotal.toLocaleString('en-IN')}`;
    }).join('\n');

    const isFreeShipping = subtotal >= 1999;
    const artisanShare = Math.round(subtotal * 0.7);

    reply = `🛍️ **Your Current Shopping Bag (${itemCount} ${itemCount === 1 ? 'item' : 'items'}):**\n\n${itemsList}\n\n• **Subtotal:** ₹${subtotal.toLocaleString('en-IN')}\n• **Shipping:** ${isFreeShipping ? 'FREE Insured Delivery ✓' : '₹99 (Free on orders > ₹1,999)'}\n• **70% Direct Artisan Payout:** ₹${artisanShare.toLocaleString('en-IN')}\n\n[action:cart-summary|${subtotal}]`;
    suggestions = ['Proceed to Checkout', 'Clear Bag', 'More Karnataka Crafts', 'Shipping Policy'];
    return res.json({ reply, suggestions });
  }

  // ── 5. Store Policies & FAQs (Handled BEFORE Product Search to prevent false matches) ──
  if (query.includes('return') || query.includes('refund') || query.includes('exchange') || query.includes('cancellation')
    || query === 'policy' || query.includes('return policy') || query.includes('wapas') || query.includes('badalna')) {
    reply = `🛡️ **Parampara Return & Refund Policy:**\n\n• **30-Day Heritage Guarantee:** If you receive a damaged or unauthentic item, you can request a 100% full refund or free replacement within 30 days of delivery.\n• **Free Insured Reverse Pickup:** Our logistics partner picks up the piece from your doorstep at zero cost.\n• **Artisan Protection:** Genuine handcrafted variations in weave or glaze are natural hallmarks of authentic handwork, not defects.\n\nNeed help with an order? Contact our support concierge or check your order status in [Your Bag](checkout.html).`;
    suggestions = ['Shipping Policy', 'GI Authenticity', 'Payment Methods', 'Browse Shop'];
    return res.json({ reply, suggestions });
  }

  if (query.includes('shipping') || query.includes('delivery') || query.includes('courier') || query.includes('dispatch')
    || query.includes('how long') || query.includes('kab tak') || query.includes('kitne din')) {
    reply = `📦 **Shipping & Delivery Details:**\n\n• **Delivery Timeline:** Standard insured delivery takes **3 to 5 business days** across India.\n• **Free Shipping:** Complimentary shipping on all orders above **₹1,999** (₹99 flat delivery for smaller orders).\n• **Tamper-Proof Heritage Packaging:** Every item is packed with museum-grade protective cushioning and a sealed GI provenance hologram.\n• **Tracking:** Real-time SMS and email tracking links are sent upon dispatch.`;
    suggestions = ['Return Policy', 'Payment Methods', 'How to buy?', 'Browse Shop'];
    return res.json({ reply, suggestions });
  }

  if (query.includes('payment') || query.includes('upi') || query.includes('cod') || query.includes('credit card') || query.includes('pay') || query.includes('paise')) {
    reply = `💳 **Payment Methods Accepted:**\n\n• **Instant UPI:** Google Pay, PhonePe, Paytm, BHIM.\n• **Cards & NetBanking:** Visa, MasterCard, RuPay, American Express, and all major Indian banks.\n• **Cash on Delivery (COD):** Available for orders up to ₹10,000.\n• **Direct Fair-Trade Payout:** 70% of your payment is credited directly into the master artisan's cluster bank account via automated payment splits.`;
    suggestions = ['70% Artisan Share', 'Shipping Info', 'Browse Shop', 'How to buy?'];
    return res.json({ reply, suggestions });
  }

  if (query.includes('70%') || query.includes('fair trade') || query.includes('artisan pay') || query.includes('artisan share') || query.includes('how artisans are paid') || query.includes('artisan ko')) {
    reply = `🏺 **Parampara 70% Direct Fair-Trade Model:**\n\nUnlike traditional commercial retail where middlemen take 60–80% of margins, Parampara operates on a transparent direct model:\n\n• **70% Direct to Artisan:** Credited immediately to the artisan cluster bank account.\n• **15% Raw Materials:** Dedicated to GI-grade pure natural dyes, mulberry silk, and metals.\n• **10% GI Provenance:** Covers physical certification testing, museum packaging & insurance.\n• **5% Apprentice Fund:** Invested in revival workshops for younger village weavers.`;
    suggestions = ['Browse Shop', 'GI Authenticity', 'Karnataka crafts', 'Kashmir Pashmina'];
    return res.json({ reply, suggestions });
  }

  if (query.includes('gi tag') || query.includes('authenticity') || query.includes('authentic') || query.includes('fake') || query.includes('certificate') || query.includes('asli') || query.includes('nakli') || query.includes('original')) {
    reply = `🏛️ **Official GI (Geographical Indication) Authenticity:**\n\n• **100% Certified Origin:** Every product is verified under the Geographical Indications of Goods Act 1999.\n• **Physical Provenance Certificate:** Every order includes an official numbered GI certificate stamped with the artisan cluster's registration.\n• **Counterfeit Protection:** We never sell powerloom copies or synthetic factory prints. A burn test, reverse weave inspection, and yarn audit guarantee 100% purity.`;
    suggestions = ['70% Artisan Share', 'Browse Shop', 'Return Policy', 'How to buy?'];
    return res.json({ reply, suggestions });
  }

  // ── 6. Specific Artisan Lookup: "who made [craft/product]?" ──
  if (query.includes('who made') || query.includes('artisan for') || query.includes('who makes') || query.includes('maker of') || query.includes('artisan of') || query.includes('kisne banaya')) {
    if (isDbConnected) {
      try {
        const craftKeywords = query.replace(/who|made|makes|artisan|for|the|of|this|piece|craft|kisne|banaya/gi, '').trim();
        if (craftKeywords.length > 2) {
          const product = await Product.findOne({
            $or: [
              { craft: new RegExp(craftKeywords, 'i') },
              { name: new RegExp(craftKeywords, 'i') },
              { state: new RegExp(craftKeywords, 'i') }
            ]
          });
          if (product && product.artisan) {
            const masterpieceUrl = `masterpiece.html?id=${product._id}`;
            const safeImg = product.imageUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80';
            reply = `🎨 **Master Artisan Profile:**\n\n• **Craft:** ${product.craft} (${product.state})\n• **Master Artisan:** **${product.artisan}**\n• **Signature Piece:** [${product.name}](${masterpieceUrl})\n• **Price:** ₹${product.price.toLocaleString('en-IN')}\n\nUnder Parampara's direct fair-trade model, 70% of the purchase goes straight into this master artisan's cluster bank account.\n\n[action:product-card|${product._id}|${product.name.replace(/\|/g, '-')}|${product.price}|${product.state}|${product.craft.replace(/\|/g, '-')}|${product.artisan.replace(/\|/g, '-')}|${product.giTagged ? '1' : '0'}|${safeImg}|${masterpieceUrl}]`;
            suggestions = [`View ${product.craft}`, '70% Artisan Share', 'GI Authenticity', 'Other Crafts'];
            return res.json({ reply, suggestions });
          }
        }
      } catch (e) {}
    }
  }

  // ── 7. Provenance & Heritage Inquiries ──
  if (query.includes('provenance') || query.includes('cultural lore') || query.includes('history of these') || query.includes('story behind') || query.includes('itihas')) {
    const ctx = getRecentContext();
    const stateCapitalized = ctx.state ? ctx.state : 'Indian Heritage';
    reply = `📜 **Cultural Provenance & Heritage of ${stateCapitalized}:**\n\nEach certified piece is anchored in centuries of living artisan tradition:\n\n• **Generational Lineage:** Handcrafted using methods passed down through families for over 400+ years.\n• **Protected Guilds:** Authenticated under the GI Act 1999 to shield indigenous artisans from industrial machine copies.\n• **Direct Fair-Trade Payout:** 70% of every sale goes directly into the artisan cluster bank account.\n\nWould you like to explore available pieces in the **[${stateCapitalized} Shop](state_categories.html?name=${encodeURIComponent(stateCapitalized)})**?`;
    suggestions = [`Browse ${stateCapitalized}`, '70% Artisan Share', 'Return Policy', 'Other States'];
    return res.json({ reply, suggestions });
  }

  // ── 8. How to Buy / Purchase Follow-up ──
  if (query.includes('how to buy') || query.includes('how to order') || query.includes('how do i buy') || query.includes('how can i buy') || query.includes('how to purchase') || query.includes('where to buy') || query.includes('kaise khareede') || query.includes('kaise order')) {
    const ctx = getRecentContext();
    const stateCapitalized = ctx.state || '';
    const stateMention = stateCapitalized ? ` for **${stateCapitalized}** crafts` : '';
    const stateUrl = ctx.state && ctx.state.toLowerCase() === 'karnataka' ? 'karnataka.html' : `state_categories.html?name=${encodeURIComponent(stateCapitalized || 'Karnataka')}`;
    reply = `🛍️ **How to Buy on Parampara${stateMention}:**\n\n1. **Direct from Chat:** Simply click the **➕ Add to Bag** button under any product card in this chat!\n2. **Explore Masterpiece Details:** Click any product title or card to view high-resolution photos, 360 viewer, and GI certificate details.\n3. **View Bag & Checkout:** Click the shopping bag icon in the top header or proceed directly to **[Checkout](checkout.html)**.\n\nEvery order includes an official physical GI Certificate and guarantees a 70% direct payment to the artisan!`;
    suggestions = ['View Shopping Bag', 'Payment Methods', 'Shipping Policy', 'Browse Shop'];
    return res.json({ reply, suggestions });
  }

  // ── 9. Pagination / "Show More" Intent Across Turns ──
  const isPaginationQuery = /^(show more|what else|more crafts|next|more items|show next|aur dikhao|aur batao|aur kya hai|other items|what other crafts)[\s.?!]*$/i.test(query)
    || query.includes('show more') || query.includes('what else') || query.includes('more crafts') || query.includes('aur dikhao') || query.includes('other crafts');

  // ── 10. Affirmative Follow-Ups ("yes", "sure", "show me", "take me there", "view them") ──
  const isAffirmative = /^(yes|yeah|yep|sure|ok|okay|show me|take me there|view them|view in shop|browse|tell me more|yes please|show|see more|haan|dikhao)[\s.?!]*$/i.test(query)
    || query.includes('show in shop') || query.includes('view in shop') || query.includes('take me to') || query.includes('view these');

  if (isAffirmative && !isPaginationQuery) {
    const ctx = getRecentContext();
    if (ctx.state) {
      const statePage = ctx.state.toLowerCase() === 'karnataka' ? 'karnataka.html' : `state_categories.html?name=${encodeURIComponent(ctx.state)}`;
      reply = `✨ **Exploring ${ctx.state} Crafts:**\n\nYou can view all certified masterpieces from ${ctx.state} directly in our shop:\n\n• 🛍️ **[Browse ${ctx.state} Collection](${statePage})**\n• 🔍 **[Search all ${ctx.state} Crafts](search.html?state=${encodeURIComponent(ctx.state)})**\n\nEach order comes with an official GI Authenticity Certificate and guarantees a 70% direct payment to the master artisan!`;
      suggestions = [`More from ${ctx.state}`, 'Shipping Policy', 'Return Policy', 'Other States'];
    } else {
      reply = `✨ You can explore our complete curated collection of authentic GI-tagged masterpieces:\n\n• 🛍️ **[Open Full Shop Catalog](search.html)**\n• 🗺️ **[Explore 28 States Interactive Map](states.html)**\n• 📜 **[Meet Our Master Artisans](artisans.html)**\n\nWould you like recommendations for a specific craft, state, or occasion (e.g., wedding gifts, home decor)?`;
      suggestions = ['Karnataka products', 'Banarasi Silk', 'Darjeeling Tea', 'How to buy?'];
    }
    return res.json({ reply, suggestions });
  }

  // ── 11. Intelligent Product Search in MongoDB Database with Typo Tolerance, Negation & Pagination ──
  if (isDbConnected) {
    try {
      const canonicalStates = [
        'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat',
        'Himachal Pradesh', 'Jammu and Kashmir', 'Karnataka', 'Kerala',
        'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
        'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
      ];

      // Step A: Typo & Alias Matching for State
      let matchedState = null;
      for (const [alias, realState] of Object.entries(stateAliases)) {
        if (new RegExp('\\b' + alias + '\\b', 'i').test(query)) {
          matchedState = realState;
          break;
        }
      }

      // Step B: Fuzzy Levenshtein Distance Fallback for State Typos (e.g. "karnatka" -> "Karnataka")
      if (!matchedState) {
        const queryWords = query.replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length >= 4);
        for (const w of queryWords) {
          for (const realState of canonicalStates) {
            const stateLower = realState.toLowerCase();
            const dist = getLevenshtein(w, stateLower);
            if (dist <= 2 || (w.length >= 6 && dist <= 3)) {
              matchedState = realState;
              break;
            }
          }
          if (matchedState) break;
        }
      }

      // If user asks "show more" or "what else", inherit state from previous conversation context
      const ctx = getRecentContext();
      if (!matchedState && isPaginationQuery && ctx.state) {
        matchedState = ctx.state;
      }

      // Step C: Typo & Alias Matching for Craft
      let matchedCraft = null;
      for (const [alias, realCraft] of Object.entries(craftAliases)) {
        if (new RegExp('\\b' + alias + '\\b', 'i').test(query)) {
          matchedCraft = realCraft;
          break;
        }
      }
      if (!matchedCraft && isPaginationQuery && ctx.craft) {
        matchedCraft = ctx.craft;
      }

      // Step D: Budget & Price Constraints Extraction
      let maxPrice = null;
      let minPrice = null;
      let sortCriteria = { _id: -1 };

      const underMatch = query.match(/(?:under|below|less than|within|cheaper than|upto|up to|sasta|max)\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)?)/i);
      if (underMatch) {
        maxPrice = parseInt(underMatch[1].replace(/,/g, ''), 10);
        sortCriteria = { price: 1 };
      }

      const aboveMatch = query.match(/(?:above|over|more than|expensive than|costlier than|min|mehenga)\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)?)/i);
      if (aboveMatch) {
        minPrice = parseInt(aboveMatch[1].replace(/,/g, ''), 10);
        sortCriteria = { price: -1 };
      }

      const betweenMatch = query.match(/(?:between|from)\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)?)\s*(?:and|to|-)\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)?)/i);
      if (betweenMatch) {
        minPrice = parseInt(betweenMatch[1].replace(/,/g, ''), 10);
        maxPrice = parseInt(betweenMatch[2].replace(/,/g, ''), 10);
        sortCriteria = { price: 1 };
      }

      if (query.includes('cheapest') || query.includes('lowest price') || query.includes('budget') || query.includes('sasta')) {
        sortCriteria = { price: 1 };
      } else if (query.includes('most expensive') || query.includes('luxury') || query.includes('premium') || query.includes('highest price') || query.includes('mehenga')) {
        sortCriteria = { price: -1 };
      }

      // Step E: Occasion / Category Keywords
      let categoryMatch = null;
      if (query.includes('wedding') || query.includes('shaadi') || query.includes('gift') || query.includes('tohfa')) {
        categoryMatch = ['Textiles & Weaves', 'Jewelry & Metalcraft', 'Home & Living'];
      } else if (query.includes('decor') || query.includes('home') || query.includes('living')) {
        categoryMatch = ['Home & Living', 'Woodcraft', 'Metalcraft', 'Pottery & Ceramics', 'Metal Art & Decor', 'Wooden Craft & Toys'];
      } else if (query.includes('saree') || query.includes('shawl') || query.includes('silk') || query.includes('textile') || query.includes('cloth') || query.includes('wear')) {
        categoryMatch = ['Textiles & Weaves', 'Handloom & Wearable Art', 'Textile Art & Home Decor'];
      } else if (query.includes('toy') || query.includes('doll') || query.includes('kid') || query.includes('bachhe')) {
        categoryMatch = ['Woodcraft', 'Toys & Dolls', 'Wooden Craft & Toys', 'Wooden Sculpture'];
      }

      // Step F: Negative Constraints Handling ("not silk", "without wood", "bina metal")
      const negationMatch = query.match(/(?:not|without|except|bina)\s+([a-z]+)/i);
      const excludedTerm = negationMatch ? negationMatch[1].toLowerCase() : null;

      const stopWords = new Set([
        'what', 'products', 'product', 'items', 'item', 'famous', 'best', 'tell', 'show', 'list',
        'about', 'some', 'give', 'good', 'crafts', 'craft', 'from', 'with', 'have', 'there', 'please',
        'where', 'when', 'which', 'made', 'make', 'makes', 'maker', 'who', 'how', 'much', 'cost', 'price',
        'buy', 'shop', 'order', 'want', 'need', 'looking', 'find', 'get', 'help', 'can', 'you', 'are',
        'policy', 'return', 'returns', 'refund', 'shipping', 'delivery', 'they', 'them', 'these', 'those',
        'work', 'works', 'does', 'the', 'a', 'an', 'and', 'for', 'in', 'on', 'at', 'to', 'is', 'it',
        'under', 'below', 'above', 'upto', 'within', 'dikhao', 'batao', 'chahiye', 'hoga', 'milega', 'aur', 'more'
      ]);

      const words = message.replace(/[?!.,]/g, '').trim().split(/\s+/).filter(w => w.length > 2);
      const meaningfulWords = words.filter(w => !stopWords.has(w.toLowerCase()) && !/^\d+$/.test(w) && w.toLowerCase() !== excludedTerm);

      // Build MongoDB Query
      const queryFilter = {};

      if (matchedState) {
        queryFilter.state = new RegExp(matchedState, 'i');
      }

      if (matchedCraft) {
        queryFilter.$or = [
          { craft: new RegExp(matchedCraft, 'i') },
          { name: new RegExp(matchedCraft, 'i') }
        ];
      }

      if (maxPrice !== null || minPrice !== null) {
        queryFilter.price = {};
        if (maxPrice !== null) queryFilter.price.$lte = maxPrice;
        if (minPrice !== null) queryFilter.price.$gte = minPrice;
      }

      if (categoryMatch && categoryMatch.length > 0) {
        queryFilter.category = { $in: categoryMatch.map(c => new RegExp(c, 'i')) };
      } else if (meaningfulWords.length > 0 && !matchedState && !matchedCraft) {
        queryFilter.$or = meaningfulWords.flatMap(w => [
          { craft: new RegExp(w, 'i') },
          { name: new RegExp(w, 'i') },
          { state: new RegExp(w, 'i') },
          { category: new RegExp(w, 'i') }
        ]);
      }

      // Apply Negation Filter
      if (excludedTerm) {
        queryFilter.name = { ...(queryFilter.name || {}), $not: new RegExp(excludedTerm, 'i') };
        queryFilter.craft = { ...(queryFilter.craft || {}), $not: new RegExp(excludedTerm, 'i') };
      }

      const hasCriteria = matchedState || matchedCraft || maxPrice !== null || minPrice !== null || categoryMatch || (meaningfulWords.length > 0 && queryFilter.$or) || isPaginationQuery;

      let dbProducts = [];
      let totalMatching = 0;
      const skipOffset = isPaginationQuery ? ctx.alreadyShownCount : 0;

      if (hasCriteria) {
        totalMatching = await Product.countDocuments(queryFilter);
        dbProducts = await Product.find(queryFilter)
          .sort(sortCriteria)
          .skip(skipOffset)
          .limit(4)
          .select('_id name state craft price artisan giTagged inStock imageUrl');
      }

      if (dbProducts && dbProducts.length > 0) {
        const stateName = matchedState || dbProducts[0].state;
        const productItemsText = dbProducts.map((p) => {
          const masterpieceUrl = `masterpiece.html?id=${p._id}`;
          const safeName = (p.name || '').replace(/\|/g, '-');
          const safeCraft = (p.craft || '').replace(/\|/g, '-');
          const safeArtisan = (p.artisan || 'Master Artisan Guild').replace(/\|/g, '-');
          const safeImg = p.imageUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80';
          return `[action:product-card|${p._id}|${safeName}|${p.price}|${p.state}|${safeCraft}|${safeArtisan}|${p.giTagged ? '1' : '0'}|${safeImg}|${masterpieceUrl}]`;
        }).join('\n\n');

        let budgetPrefix = '';
        if (maxPrice && minPrice) budgetPrefix = ` priced between ₹${minPrice.toLocaleString('en-IN')} and ₹${maxPrice.toLocaleString('en-IN')}`;
        else if (maxPrice) budgetPrefix = ` under ₹${maxPrice.toLocaleString('en-IN')}`;
        else if (minPrice) budgetPrefix = ` above ₹${minPrice.toLocaleString('en-IN')}`;

        const pageNotice = isPaginationQuery ? ` (Showing ${skipOffset + 1}–${skipOffset + dbProducts.length} of ${totalMatching})` : '';

        reply = `Here are certified heritage masterpieces${budgetPrefix} from our **live product catalog**${pageNotice}:\n\n${productItemsText}\n\nEvery piece guarantees a 70% direct payment to the master artisan. Click **View Piece** for 360° photos and the GI certificate, or tap **➕ Add to Bag** to collect!`;
        suggestions = [
          totalMatching > (skipOffset + dbProducts.length) ? 'Show more crafts' : `🛍️ View all ${stateName}`,
          '📦 Shipping Details',
          '🛡️ Return Policy',
          '🏺 Explore Another State'
        ];
        return res.json({ reply, suggestions });
      } else if (isPaginationQuery && totalMatching > 0 && skipOffset >= totalMatching) {
        const stateName = matchedState || ctx.state || 'this collection';
        reply = `🏺 **You have viewed all ${totalMatching} certified masterpieces from ${stateName}!**\n\nWould you like recommendations from neighboring heritage regions (e.g. **Kashmir**, **Rajasthan**, **West Bengal**) or explore our all-India catalog?`;
        suggestions = ['Kashmir Pashmina', 'Rajasthan Crafts', 'Browse All Shop', 'What is in my bag?'];
        return res.json({ reply, suggestions });
      } else if (hasCriteria && (maxPrice !== null || minPrice !== null)) {
        reply = `We couldn't find pieces matching that exact price range right now. Would you like to browse our complete collection or explore affordable GI-certified crafts?`;
        suggestions = ['Karnataka crafts under ₹3,000', 'Browse All Shop', 'Return Policy'];
        return res.json({ reply, suggestions });
      }
    } catch (dbErr) {
      console.warn('MongoDB search fallback:', dbErr.message);
    }
  }

  // ── 12. Fallback Heritage Knowledge (Strict Parampara Mitra Identity) ──
  reply = `Namaste! I am **Parampara Mitra**, your AI shopping concierge for authentic Indian heritage handicrafts.\n\nWe directly connect you with verified master artisans across India's 28 states with 100% GI provenance certification and 70% direct artisan payouts.\n\nHow can I help you today? You can ask me:\n• To find products from any state (e.g. *Karnataka*, *Kashmir*, *Rajasthan*)\n• For budget recommendations (e.g. *Crafts under ₹3,000*)\n• Check what is in your bag (e.g. *What's in my bag?*)\n• Track your order (e.g. *Track order PAR-2026-XXXX*)\n• About store policies like shipping, delivery, or returns.`;
  suggestions = ['Karnataka products', 'Crafts under ₹3,000', 'What is in my bag?', 'Track my order'];

  return res.json({ reply, suggestions });
});

module.exports = router;
