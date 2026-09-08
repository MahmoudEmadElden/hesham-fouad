const { connectDB } = require('../_lib/db');
const { handleCors } = require('../_lib/auth-middleware');
const Order = require('../_lib/models/Order');
const Counter = require('../_lib/models/Counter');

const PRICE_MAP = {
  'hf-beast': 150,
  'hf-toscanini': 135,
  'hf-milano': 130,
  'hf-moscow': 130,
  'hf-chicago': 130,
  'hf-super-supreme': 130,
  'hf-amsterdam': 125,
  'hf-sofia': 125,
  'hf-sojouk-kiri': 120,
  'hf-mix-chicken': 120,
  'hf-mix-smoked': 120,
  'hf-super-crunchy': 115,
  'chk-ranch': 120,
  'chk-bbq': 120,
  'chk-shish': 115,
  'chk-fajita': 115,
  'chk-grilled-breast': 115,
  'chk-shawarma': 105,
  'chk-cordon-bleu': 105,
  'chk-zinger': 95,
  'chk-strips': 95,
  'chk-pane': 95,
  'chk-nuggets': 95,
  'meat-steak': 120,
  'meat-burger': 105,
  'meat-salami': 100,
  'meat-pastrami': 100,
  'meat-sojouk': 95,
  'meat-kofta': 95,
  'meat-sausage': 90,
  'meat-hotdog': 90,
  'side-mix-cheese': 80,
  'side-fries': 60,
  'swt-nutella-oreo': 105,
  'swt-nutella': 100,
  'swt-lotus': 90,
  'swt-pistachio': 90,
  'swt-kinder': 90,
  'swt-white-choc': 90,
  'swt-apple': 120,
  'swt-mango': 120,
  'swt-pineapple': 120,
  'swt-peach': 115,
  'swt-banana': 115,
  'swt-jam': 80
};

const ADDON_MAP = {
  'extra-romi': 20,
  'extra-mozzarella': 20,
  'extra-mix-cheese': 20,
  'extra-fries': 20,
  'extra-jalapeno': 20,
  'extra-crepe-bread': 25,
  'sauce-ranch': 25,
  'sauce-cheddar': 25,
  'sauce-thousand-island': 20,
  'sauce-bbq': 20,
  'sauce-sweet-chili': 20,
  'sauce-cocktail': 20,
  'sauce-big-tasty': 20,
  'sauce-harissa': 20,
  'sweet-nutella': 30,
  'sweet-kinder': 30,
  'sweet-pistachio': 30,
  'sweet-lotus': 30,
  'sweet-white-choc': 30,
  'sweet-jam': 25
};

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB();

    const { customerName, customerPhone, deliveryAddress, items, notes } = req.body;

    if (!customerName || !customerPhone || !deliveryAddress) {
      return res.status(400).json({ message: 'الاسم ورقم التليفون وعنوان التوصيل مطلوبين' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'يجب اختيار صنف واحد على الأقل' });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const basePrice = PRICE_MAP[item.itemId] || Number(item.unitPrice) || 0;
      let addonsSum = 0;

      const validatedAddons = [];
      if (Array.isArray(item.selectedAddons)) {
        for (const addon of item.selectedAddons) {
          const aPrice = ADDON_MAP[addon.id] || Number(addon.price) || 0;
          addonsSum += aPrice;
          validatedAddons.push({
            id: addon.id,
            name: addon.name,
            price: aPrice
          });
        }
      }

      const validatedSauces = [];
      if (Array.isArray(item.selectedSauces)) {
        for (const sauce of item.selectedSauces) {
          const sPrice = ADDON_MAP[sauce.id] || Number(sauce.price) || 0;
          addonsSum += sPrice;
          validatedSauces.push({
            id: sauce.id,
            name: sauce.name,
            price: sPrice
          });
        }
      }

      const unitPrice = basePrice + addonsSum;
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const totalPrice = unitPrice * qty;
      subtotal += totalPrice;

      validatedItems.push({
        itemId: item.itemId,
        name: item.name || 'كريب فاخر',
        quantity: qty,
        unitPrice,
        totalPrice,
        selectedAddons: validatedAddons,
        selectedSauces: validatedSauces,
        notes: item.notes || ''
      });
    }

    const deliveryFee = 15;
    const totalAmount = subtotal + deliveryFee;

    const orderNumber = await Counter.getNextSequence('orderNumber');

    const order = new Order({
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      items: validatedItems,
      subtotal,
      deliveryFee,
      totalAmount,
      status: 'pending',
      notes: notes ? notes.trim() : ''
    });

    await order.save();

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل الطلب بنجاح',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'حدث خطأ في تسجيل الطلب', error: error.message });
  }
};
