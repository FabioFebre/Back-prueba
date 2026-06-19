const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { Orden, OrdenItem, Usuario,Producto  } = require('../models');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});




// Obtener todas las órdenes
router.get('/', async (req, res) => {
  try {
    const ordenes = await Orden.findAll({
      include: [
        {
          model: OrdenItem,
          as: 'items',
          required: false,
          include: [
            {
              model: Producto,
              as: 'producto',
              attributes: ['id', 'nombre', 'imagen']
            },
            {
              model: require('../models').Variante,
              as: 'variante',
              attributes: ['id', 'talla', 'color', 'precio']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      subQuery: false
    });
    res.json(ordenes);
  } catch (error) {
    console.error('ERROR EN GET /ordenes:', error.message);
    console.error('STACK:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener órdenes',
      message: error.message,
      details: error.stack
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id, {
      include: [
        {
          model: OrdenItem,
          as: 'items',
          include: [
            {
              model: Producto,
              as: 'producto',
              attributes: ['id', 'nombre', 'imagen']
            },
            {
              model: require('../models').Variante,
              as: 'variante',
              attributes: ['id', 'talla', 'color', 'precio']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    res.json(orden);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la orden' });
  }
});


// Crear una nueva orden
// Crear una nueva orden
/*router.post('/', async (req, res) => {
  try {
    const {
      usuarioId,
      nombre,
      apellido,
      email,
      telefono,
      pais,
      departamento,
      provincia,
      distrito,
      direccion,
      referencia,
      metodoEnvio,
      subtotal,
      envio,
      total,
      cuponCodigo,
      orderId,
      currency,
      note,
      orderIdIzipay,
      transactionId,
      paymentStatus,
      paymentResponse,
      paymentDate,
      items
    } = req.body;

    console.log("📦 BODY RECIBIDO:", req.body);

    // Validaciones básicas
    if (!orderId) return res.status(400).json({ error: "orderId es obligatorio" });
    if (!subtotal || !total) return res.status(400).json({ error: "Subtotal y total son obligatorios" });

    // 1️⃣ Crear la orden
    const nuevaOrden = await Orden.create({
      usuarioId,
      nombre,
      apellido,
      email,
      telefono,
      pais,
      departamento,
      provincia,
      distrito,
      direccion,
      referencia,
      metodoEnvio,
      subtotal,
      envio,
      total,
      cuponCodigo,
      orderId,
      currency,
      note,
      orderIdIzipay,
      transactionId,
      paymentStatus,
      paymentResponse,
      paymentDate
    });

    // 2️⃣ Crear los OrdenItems
    if (items && items.length > 0) {
      for (const item of items) {
        await OrdenItem.create({
          ordenId: nuevaOrden.id,
          productoId: item.productoId,
          nombreProducto: item.nombreProducto || item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
          talla: item.talla || null
        });
      }
    }

    // 3️⃣ Devolver la orden completa con items
    const ordenCompleta = await Orden.findByPk(nuevaOrden.id, {
      include: [
        { model: OrdenItem, as: 'items' },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'email'] }
      ]
    });

    res.status(201).json({ message: "Orden creada correctamente", orden: ordenCompleta });

  } catch (error) {
    console.error("🔥 ERROR AL CREAR ORDEN:", error);
    res.status(500).json({ error: error.message });
  }
});
*/

  

// Eliminar una orden
router.delete('/:id', async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    await OrdenItem.destroy({ where: { ordenId: orden.id } });
    await orden.destroy();

    res.json({ mensaje: 'Orden eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la orden' });
  }
});

// Actualizar solo el estado de una orden
router.put('/:id', async (req, res) => {
  try {
    const { subtotal, envio, total, estado, tipoDocumento, numeroDocumento } = req.body;

    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    orden.subtotal = subtotal !== undefined ? subtotal : orden.subtotal;
    orden.envio = envio !== undefined ? envio : orden.envio;
    orden.total = total !== undefined ? total : orden.total;
    orden.estado = estado !== undefined ? estado : orden.estado;
    orden.tipoDocumento = tipoDocumento !== undefined ? tipoDocumento : orden.tipoDocumento;
    orden.numeroDocumento = numeroDocumento !== undefined ? numeroDocumento : orden.numeroDocumento;

    await orden.save();

    if (estado && orden.email) {
      const estadoLabels = {
        'pagado': 'Pagado',
        'recojo en tienda listo': 'Recojo en tienda listo',
        'entregado': 'Entregado',
        'procesando pago': 'Procesando pago',
        'pago aceptado': 'Pago aceptado',
        'pedido enviado': 'Pedido enviado',
        'pedido entregado': 'Pedido entregado',
        'cancelado': 'Cancelado',
      };

      const mensajesPorEstado = {
        'pagado': 'Tu pago ha sido confirmado. Estamos preparando tu pedido.',
        'recojo en tienda listo': 'Tu pedido ya está listo para recoger en tienda. ¡Te esperamos!',
        'entregado': 'Has recogido tu pedido. ¡Gracias por tu compra!',
        'procesando pago': 'Estamos verificando tu pago. Te notificaremos cuando sea confirmado.',
        'pago aceptado': 'Tu pago ha sido aceptado. Estamos preparando tu pedido para envío.',
        'pedido enviado': 'Tu pedido ha sido enviado. Pronto lo recibirás.',
        'pedido entregado': 'Tu pedido ha sido entregado. ¡Gracias por tu compra!',
        'cancelado': 'Tu pedido ha sido cancelado.',
      };

      const estadoKey = estado.toLowerCase();
      const label = estadoLabels[estadoKey] || estado;
      const mensajePersonalizado = mensajesPorEstado[estadoKey] || `El estado de tu orden ha cambiado a: ${label}`;
      const esRecojo = orden.metodoEnvio === 'recojo';

      const items = await OrdenItem.findAll({
        where: { ordenId: orden.id },
        include: [{ model: Producto, as: 'producto', attributes: ['nombre'] }],
      });
      let itemsHtml = '';
      if (items.length > 0) {
        itemsHtml = items.map(i => {
          const nombre = i.nombreProducto || i.producto?.nombre || 'Producto';
          return `<tr><td style="padding:6px 12px;border:1px solid #ddd;">${nombre}</td><td style="padding:6px 12px;border:1px solid #ddd;text-align:center;">${i.cantidad}</td><td style="padding:6px 12px;border:1px solid #ddd;text-align:right;">S/ ${parseFloat(i.precio).toFixed(2)}</td></tr>`;
        }).join('');
      }

      let infoEnvioHtml = '';
      if (estadoKey === 'pedido enviado' && !esRecojo) {
        infoEnvioHtml = `
          <div style="background:#f0f8ff;padding:12px;border-radius:6px;margin:12px 0;">
            <p style="margin:0;font-size:14px;"><strong>Método de envío:</strong> ${orden.metodoEnvio === 'olva' ? 'Olva' : orden.metodoEnvio || 'N/D'}</p>
            <p style="margin:4px 0 0;font-size:14px;"><strong>Dirección:</strong> ${[orden.direccion, orden.distrito, orden.provincia, orden.departamento].filter(Boolean).join(', ') || 'N/D'}</p>
          </div>
        `;
      }

      try {
        await transporter.sendMail({
          from: `"SG Studio" <${process.env.SMTP_USER}>`,
          to: orden.email,
          subject: `Tu orden ${orden.orderId || '#' + orden.id} - ${label} - SG Studio`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
              <h2 style="color:#000;">SG Studio</h2>
              <p>Hola <strong>${orden.nombre || ''}</strong>,</p>
              <p style="font-size:16px;">${mensajePersonalizado}</p>
              <p style="font-size:20px;font-weight:bold;color:#000;">${label}</p>
              ${infoEnvioHtml}
              ${items.length > 0 ? `
                <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                  <thead><tr style="background:#f5f5f5;"><th style="padding:8px 12px;border:1px solid #ddd;text-align:left;">Producto</th><th style="padding:8px 12px;border:1px solid #ddd;">Cant.</th><th style="padding:8px 12px;border:1px solid #ddd;text-align:right;">Precio</th></tr></thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
              ` : ''}
              <p style="color:#666;font-size:13px;">Gracias por confiar en SG Studio.</p>
              <hr style="border:none;border-top:1px solid #eee;" />
              <p style="color:#999;font-size:12px;">SG Studio</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Error al enviar email de estado:', emailError);
      }
    }

    res.json({ mensaje: 'Orden actualizada', orden });
  } catch (error) {
    console.error(' Error al actualizar orden:', error);
    res.status(500).json({ error: 'Error al actualizar la orden' });
  }
});


module.exports = router;
