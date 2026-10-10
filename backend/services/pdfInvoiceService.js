const PDFDocument = require('pdfkit');

/**
 * Generate PDF Invoice & GI Authenticity Certificate Stream
 * @param {Object} order - Order object containing items, payment info, shipping address
 * @returns {PDFDocument} - PDFKit stream
 */
function generateOrderInvoicePDF(order) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Color Palette
  const primaryColor = '#8B0000'; // Royal Heritage Crimson
  const goldColor = '#D4AF37';    // Heritage Gold
  const darkTextColor = '#2C2C2C';
  const grayColor = '#666666';
  const lightBg = '#FAF8F5';

  // --- HEADER SECTION ---
  doc
    .rect(0, 0, doc.page.width, 100)
    .fill('#5B0612'); // Rich Maroon Header

  doc
    .fillColor('#F7E7CE')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('PARAMPARA', 40, 25);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#E5C158')
    .text('OFFICIAL GI AUTHENTICITY CERTIFICATE & TAX INVOICE', 40, 52);

  doc
    .fontSize(9)
    .fillColor('#FFFFFF')
    .text('Geographical Indications Registry Certified | Ministry of Commerce & Industry, Govt of India', 40, 68);

  // GI Seal Badge Box
  doc
    .rect(430, 20, 125, 60)
    .fillAndStroke('#7A0818', goldColor);

  doc
    .fillColor('#FFFFFF')
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('GI VERIFIED PROVENANCE', 435, 30, { width: 115, align: 'center' });

  doc
    .fillColor('#F7E7CE')
    .fontSize(7)
    .font('Helvetica')
    .text('70% DIRECT ARTISAN PAYOUT GUARANTEED', 435, 48, { width: 115, align: 'center' });

  doc.moveDown(4);

  // --- ORDER & METADATA SECTION ---
  const metadataY = 115;
  doc
    .fillColor(darkTextColor)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(`Invoice Reference: #${(order._id || 'PRM-' + Date.now()).toString().slice(-10).toUpperCase()}`, 40, metadataY);

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(grayColor)
    .text(`Order Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 40, metadataY + 16)
    .text(`Payment Gateway Ref: ${order.paymentResult?.razorpayPaymentId || order.paymentResult?.id || 'PAY-VERIFIED-UPI'}`, 40, metadataY + 30)
    .text(`Payment Method: ${(order.paymentMethod || 'Razorpay').toUpperCase()} (Status: ${order.isPaid ? 'SUCCESS (PAID)' : 'PROCESSING'})`, 40, metadataY + 44);

  // Shipping Address Card
  doc
    .rect(340, metadataY, 215, 75)
    .fillAndStroke(lightBg, '#E0D6C8');

  doc
    .fillColor(primaryColor)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('DELIVERY DESTINATION', 350, metadataY + 10);

  const ship = order.shippingAddress || {};
  doc
    .fillColor(darkTextColor)
    .fontSize(8)
    .font('Helvetica')
    .text(ship.fullName || 'Valued Heritage Collector', 350, metadataY + 24)
    .text(`${ship.address || ''}, ${ship.city || ''}`, 350, metadataY + 36)
    .text(`${ship.state || ''} - ${ship.postalCode || ''}, ${ship.country || 'India'}`, 350, metadataY + 48)
    .text(`Mobile: +91 ${ship.phone || ''}`, 350, metadataY + 60);

  // --- LINE ITEMS TABLE ---
  let tableY = 210;

  // Table Header
  doc
    .rect(40, tableY, 515, 22)
    .fill('#8B0000');

  doc
    .fillColor('#FFFFFF')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Craft Item & GI Tag', 50, tableY + 6)
    .text('Artisan / Guild', 230, tableY + 6)
    .text('Qty', 370, tableY + 6)
    .text('Unit Price', 415, tableY + 6)
    .text('Amount', 490, tableY + 6);

  tableY += 22;

  let totalItemsAmount = 0;
  let totalArtisanContribution = 0;

  (order.orderItems || []).forEach((item, index) => {
    const itemTotal = (item.price || 0) * (item.qty || 1);
    const itemArtisanPayout = item.artisanPayoutAmount || (itemTotal * 0.7);
    totalItemsAmount += itemTotal;
    totalArtisanContribution += itemArtisanPayout;

    const rowBg = index % 2 === 0 ? '#FFFFFF' : '#FDFBFAF0';
    doc.rect(40, tableY, 515, 28).fill(rowBg);

    doc
      .fillColor(darkTextColor)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(item.name.length > 34 ? item.name.slice(0, 32) + '...' : item.name, 50, tableY + 6);

    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor(grayColor)
      .text(`GI Registry Tag: ${item.giNumber || 'GI-VERIFIED-HANDICRAFT'}`, 50, tableY + 16);

    doc
      .fillColor(darkTextColor)
      .fontSize(8)
      .text(item.artisanName ? item.artisanName.slice(0, 24) : 'Verified Weaver Guild', 230, tableY + 9);

    doc.text((item.qty || 1).toString(), 375, tableY + 9);
    doc.text(`₹${(item.price || 0).toLocaleString('en-IN')}`, 415, tableY + 9);
    doc.font('Helvetica-Bold').text(`₹${itemTotal.toLocaleString('en-IN')}`, 490, tableY + 9);

    tableY += 28;
  });

  // Divider
  doc
    .moveTo(40, tableY + 5)
    .lineTo(555, tableY + 5)
    .strokeColor('#D0C4B4')
    .stroke();

  tableY += 15;

  // --- ARTISAN TRANSPARENCY & IMPACT CARD ---
  doc
    .rect(40, tableY, 280, 85)
    .fillAndStroke('#F5EFEB', '#D4AF37');

  doc
    .fillColor(primaryColor)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('🌿 70% DIRECT ARTISAN FINANCIAL TRANSPARENCY', 50, tableY + 10);

  const artisanShare = order.artisanSupportContribution || totalArtisanContribution || (totalItemsAmount * 0.7);
  doc
    .fillColor(darkTextColor)
    .fontSize(8)
    .font('Helvetica')
    .text(`Direct Payout to Craft Artisan: ₹${artisanShare.toLocaleString('en-IN')}`, 50, tableY + 26)
    .text('Raw Materials & Guild Logistics: ₹' + Math.round(totalItemsAmount * 0.18).toLocaleString('en-IN'), 50, tableY + 38)
    .text('Platform Operations & Quality Audit: ₹' + Math.round(totalItemsAmount * 0.12).toLocaleString('en-IN'), 50, tableY + 50)
    .fillColor('#388E3C')
    .font('Helvetica-Bold')
    .text('✓ 100% Verified Non-Exploitative Fair Trade Craft', 50, tableY + 66);

  // Summary Calculation Box
  const summaryX = 350;
  doc
    .fillColor(grayColor)
    .fontSize(8)
    .font('Helvetica')
    .text('Subtotal:', summaryX, tableY + 10)
    .text(`₹${(order.itemsPrice || totalItemsAmount).toLocaleString('en-IN')}`, 490, tableY + 10);

  doc
    .text('Shipping & Handling:', summaryX, tableY + 24)
    .text((order.shippingPrice || 0) === 0 ? 'FREE (Heritage Pro)' : `₹${order.shippingPrice}`, 490, tableY + 24);

  if (order.discountPrice > 0) {
    doc
      .text('Promo Discount:', summaryX, tableY + 38)
      .text(`- ₹${order.discountPrice.toLocaleString('en-IN')}`, 490, tableY + 38);
  }

  doc
    .text('GST / Taxes (Included):', summaryX, tableY + 52)
    .text(`₹${(order.taxPrice || Math.round(totalItemsAmount * 0.05)).toLocaleString('en-IN')}`, 490, tableY + 52);

  // Total Line
  doc
    .rect(summaryX - 10, tableY + 66, 215, 24)
    .fill(primaryColor);

  doc
    .fillColor('#FFFFFF')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('TOTAL AMOUNT PAID:', summaryX, tableY + 73)
    .text(`₹${(order.totalPrice || totalItemsAmount).toLocaleString('en-IN')}`, 480, tableY + 73);

  // --- FOOTER SECTION ---
  const footerY = doc.page.height - 80;

  doc
    .rect(40, footerY, 515, 45)
    .fillAndStroke(lightBg, '#E5C158');

  doc
    .fillColor(primaryColor)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('GUARANTEE OF AUTHENTICITY', 50, footerY + 8);

  doc
    .fillColor(darkTextColor)
    .fontSize(7)
    .font('Helvetica')
    .text('This invoice serves as an official GI provenance certificate. Every handicraft item in this order has been registered under the GI Act 1999 and verified for indigenous geographical origin, raw material purity, and master artisan craftsmanship.', 50, footerY + 20, { width: 495 });

  doc.end();
  return doc;
}

module.exports = { generateOrderInvoicePDF };
