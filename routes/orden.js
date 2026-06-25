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
      const estadoKey = estado.toLowerCase();
      const esRecojo = orden.metodoEnvio === 'recojo';
      const codigo = orden.orderId || '#' + orden.id;
      const nombreCliente = orden.nombre || '';

      const items = await OrdenItem.findAll({
        where: { ordenId: orden.id },
        include: [{ model: Producto, as: 'producto', attributes: ['nombre'] }],
      });

      const itemsTable = items.length > 0 ? `
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px 12px;border:1px solid #ddd;text-align:left;">Producto</th>
              <th style="padding:8px 12px;border:1px solid #ddd;text-align:center;">Cant.</th>
              <th style="padding:8px 12px;border:1px solid #ddd;text-align:right;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(i => {
              const nombre = i.nombreProducto || i.producto?.nombre || 'Producto';
              return `<tr><td style="padding:6px 12px;border:1px solid #ddd;">${nombre}</td><td style="padding:6px 12px;border:1px solid #ddd;text-align:center;">${i.cantidad}</td><td style="padding:6px 12px;border:1px solid #ddd;text-align:right;">S/ ${parseFloat(i.precio).toFixed(2)}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      ` : '';

      const direccionEnvio = [orden.direccion, orden.distrito, orden.provincia, orden.departamento].filter(Boolean).join(', ');
      const totalHtml = orden.total ? `<p style="font-size:16px;font-weight:bold;margin:8px 0;">Total: S/ ${parseFloat(orden.total).toFixed(2)}</p>` : '';

      let subject, bodyHtml;

      // ── ENVÍO POR OLVA ──
      if (!esRecojo) {
        switch (estadoKey) {
          case 'procesando pago':
            subject = `Procesando pago - ${codigo} - SG Studio`;
            bodyHtml = `
              <h2 style="color:#000;">SG Studio</h2>
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>Estamos verificando tu pago a través de Izipay.</p>
              <p>En unos momentos recibirás la confirmación por correo.</p>
              ${itemsTable}
              ${totalHtml}
              <p style="color:#666;font-size:13px;">Si tienes alguna consulta, nuestro equipo estará disponible para ayudarte.</p>
              <hr style="border:none;border-top:1px solid #eee;" />
              <p style="color:#999;font-size:12px;">SG Studio</p>
            `;
            break;

          case 'pago aceptado':
            subject = `¡Gracias por tu compra! Pedido ${codigo} - SG Studio`;
            bodyHtml = `
              <h2 style="color:#000;">SG Studio</h2>
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>¡Gracias por elegirnos!</p>
              <p>Hemos recibido correctamente tu pedido y ya se encuentra en proceso de preparación.</p>
              <p style="font-size:18px;font-weight:bold;color:#000;">Pedido N° ${codigo}</p>
              <p>Próximamente recibirás un mensaje al número de WhatsApp registrado, con la información de envío y seguimiento de tu pedido.</p>
              <h3 style="margin-top:20px;">Resumen de tu compra</h3>
              ${itemsTable}
              ${totalHtml}
              <p>Pronto recibirás una nueva actualización con la información de envío y el seguimiento de tu pedido.</p>
              <p>Si tienes alguna consulta, nuestro equipo de atención estará disponible para ayudarte.</p>
              <p>Gracias por confiar en <strong>SG STUDIO</strong>. Estamos seguros de que te encantará tu nueva compra y que podrás armar muchos outfits.</p>
              <hr style="border:none;border-top:1px solid #eee;" />
              <p style="color:#999;font-size:12px;">SG Studio</p>
            `;
            break;

          case 'pedido enviado':
            subject = `Tu pedido ${codigo} ha sido enviado - SG Studio`;
            bodyHtml = `
              <h2 style="color:#000;">SG Studio</h2>
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>Tu pedido ha sido entregado a <strong>OLVA Courier</strong>.</p>
              <p>Te hemos enviado el número de <strong>tracking</strong> por WhatsApp para que puedas dar seguimiento a tu envío.</p>
              <div style="background:#f0f8ff;padding:12px;border-radius:6px;margin:12px 0;">
                <p style="margin:0;font-size:14px;"><strong>Método de envío:</strong> OLVA Courier</p>
                ${direccionEnvio ? `<p style="margin:4px 0 0;font-size:14px;"><strong>Dirección:</strong> ${direccionEnvio}</p>` : ''}
              </div>
              ${itemsTable}
              ${totalHtml}
              <p>Gracias por confiar en <strong>SG STUDIO</strong>.</p>
              <hr style="border:none;border-top:1px solid #eee;" />
              <p style="color:#999;font-size:12px;">SG Studio</p>
            `;
            break;

          case 'pedido entregado':
            subject = `Tu pedido ${codigo} ha sido entregado - SG Studio`;
            bodyHtml = `
              <h2 style="color:#000;">SG Studio</h2>
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>Te informamos que tu pedido <strong>${codigo}</strong> ha sido entregado correctamente.</p>
              <p>Esperamos que disfrutes cada una de las piezas seleccionadas.</p>
              <p>Si tienes alguna consulta sobre tu compra o necesitas asistencia con un cambio o devolución, nuestro equipo estará disponible para ayudarte.</p>
              <p>Gracias por confiar en nosotros.</p>
              <hr style="border:none;border-top:1px solid #eee;" />
              <p style="color:#999;font-size:12px;">SG STUDIO</p>
            `;
            break;

          default:
            subject = `Tu orden ${codigo} - SG Studio`;
            bodyHtml = `
              <h2 style="color:#000;">SG Studio</h2>
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>El estado de tu pedido <strong>${codigo}</strong> ha cambiado a: <strong>${estado}</strong>.</p>
              ${itemsTable}
              ${totalHtml}
              <p>Gracias por confiar en SG Studio.</p>
              <hr style="border:none;border-top:1px solid #eee;" />
              <p style="color:#999;font-size:12px;">SG Studio</p>
            `;
        }
      } else {
        // ── RECOJO EN TIENDA ──
        switch (estadoKey) {
          case 'procesando pago':
          case 'pagado':
            subject = `Pago confirmado - ${codigo} - SG Studio`;
            bodyHtml = `
              <h2 style="color:#000;">SG Studio</h2>
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>¡Gracias por elegirnos!</p>
              <p>Hemos recibido tu pago correctamente. Estamos preparando tu pedido para recojo en tienda.</p>
              <p>Te notificaremos cuando esté listo para que puedas recogerlo.</p>
              ${itemsTable}
              ${totalHtml}
              <p>Si tienes alguna consulta, nuestro equipo estará disponible para ayudarte.</p>
              <p>Gracias por confiar en <strong>SG STUDIO</strong>.</p>
              <hr style="border:none;border-top:1px solid #eee;" />
              <p style="color:#999;font-size:12px;">SG Studio</p>
            `;
            break;

          case 'recojo en tienda listo':
            subject = `Tu pedido ${codigo} está listo para recoger - SG Studio`;
            bodyHtml = `
              <h2 style="color:#000;">SG Studio</h2>
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>Tu pedido <strong>${codigo}</strong> ya está listo para ser recogido en tienda.</p>
              <p>Puedes acercarte a nuestra ubicación durante el horario de atención y presentar tu número de pedido al momento del recojo.</p>
              <div style="background:#f0f8ff;padding:12px;border-radius:6px;margin:12px 0;">
                <p style="margin:0;font-size:14px;"><strong>Dirección:</strong> Jr. Pizarro 818 – Gal. Plaza Pizarro || Int. 101</p>
                <p style="margin:4px 0 0;font-size:14px;"><strong>Horario:</strong> Lunes a Sábados de 11:00 am a 08:30 pm</p>
              </div>
              <p>Si otra persona recogerá el pedido en tu nombre, por favor comunícate previamente con nuestro equipo.</p>
              ${itemsTable}
              ${totalHtml}
              <p>Gracias por elegirnos y esperamos verte pronto nuevamente.</p>
              <hr style="border:none;border-top:1px solid #eee;" />
              <p style="color:#999;font-size:12px;">SG STUDIO</p>
            `;
            break;

          case 'entregado':
          case 'pedido entregado':
            subject = `Tu pedido ${codigo} ha sido entregado - SG Studio`;
            bodyHtml = `
              <h2 style="color:#000;">SG Studio</h2>
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>Te informamos que tu pedido <strong>${codigo}</strong> ha sido entregado correctamente por la modalidad de recojo en tienda.</p>
              <p>Esperamos que disfrutes cada una de las piezas seleccionadas.</p>
              <p>Si tienes alguna consulta sobre tu compra o necesitas asistencia con un cambio o devolución, nuestro equipo estará disponible para ayudarte.</p>
              <p>Gracias por confiar en nosotros.</p>
              <hr style="border:none;border-top:1px solid #eee;" />
              <p style="color:#999;font-size:12px;">SG STUDIO</p>
            `;
            break;

          default:
            subject = `Tu orden ${codigo} - SG Studio`;
            bodyHtml = `
              <h2 style="color:#000;">SG Studio</h2>
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>El estado de tu pedido <strong>${codigo}</strong> ha cambiado a: <strong>${estado}</strong>.</p>
              ${itemsTable}
              ${totalHtml}
              <p>Gracias por confiar en SG Studio.</p>
              <hr style="border:none;border-top:1px solid #eee;" />
              <p style="color:#999;font-size:12px;">SG Studio</p>
            `;
        }
      }

      try {
        await transporter.sendMail({
          from: `"SG Studio" <${process.env.SMTP_USER}>`,
          to: orden.email,
          subject,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">${bodyHtml}</div>`,
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
