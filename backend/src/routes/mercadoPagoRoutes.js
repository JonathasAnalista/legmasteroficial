import { Router } from 'express';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { config } from '../config.js';
import { activateProByEmail, activateProLegacyUser } from '../services/proActivation.js';

const PRICE_PRO_ANNUAL = 20.0;

const router = Router();

const requireMercadoPagoToken = (res) => {
  if (!config.mpAccessToken) {
    res.status(500).json({ error: 'MP_ACCESS_TOKEN ausente no .env' });
    return false;
  }
  return true;
};

router.post('/create-preference', async (req, res) => {
  try {
    const { uid, email } = req.body || {};
    if (!uid || !email) {
      return res.status(400).json({ error: 'uid/email obrigatórios' });
    }

    if (!requireMercadoPagoToken(res)) return;

    if (!config.baseUrl || !/^https:\/\//i.test(config.baseUrl)) {
      return res.status(500).json({ error: 'BASE_URL inválida (precisa ser HTTPS público)' });
    }

    if (!config.frontendUrl || !/^https?:\/\//i.test(config.frontendUrl)) {
      return res.status(500).json({ error: 'FRONTEND_URL inválida' });
    }

    const body = {
      items: [
        {
          title: 'Legmaster PRO - 1 ano',
          description: 'Acesso PRO por 12 meses',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: PRICE_PRO_ANNUAL
        }
      ],
      payer: { email },
      metadata: { uid, email, plan: 'PRO_1Y', amount: PRICE_PRO_ANNUAL },
      statement_descriptor: 'LEGMASTER',
      payment_methods: {
        excluded_payment_types: [
          { id: 'ticket' },
          { id: 'atm' },
          { id: 'digital_currency' }
        ],
        installments: 1,
        default_installments: 1,
        default_payment_type_id: 'bank_transfer'
      },
      back_urls: {
        success: `${config.frontendUrl}/pagamento/sucesso`,
        pending: `${config.frontendUrl}/pagamento/pendente`,
        failure: `${config.frontendUrl}/pagamento/erro`
      },
      auto_return: 'approved',
      notification_url: `${config.baseUrl}/api/mp/webhook`
    };

    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      body,
      { headers: { Authorization: `Bearer ${config.mpAccessToken}` } }
    );

    return res.json({ init_point: response.data.init_point });
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error('create-preference ERROR:', status, data || error.message);
    return res.status(500).json({
      error: 'Falha ao criar preferência',
      details: { status, data }
    });
  }
});

router.post('/pix/create', async (req, res) => {
  try {
    const { uid, email, amount } = req.body || {};
    if (!uid || !email) {
      return res.status(400).json({ error: 'uid/email obrigatórios' });
    }

    if (!requireMercadoPagoToken(res)) return;

    if (!config.baseUrl || !/^https:\/\//i.test(config.baseUrl)) {
      return res.status(500).json({ error: 'BASE_URL inválida (precisa ser HTTPS público)' });
    }

    const price = Number(amount || PRICE_PRO_ANNUAL);
    const body = {
      transaction_amount: price,
      description: 'Legmaster PRO - 1 ano',
      payment_method_id: 'pix',
      payer: { email },
      metadata: { uid, email, plan: 'PRO_1Y', amount: price },
      notification_url: `${config.baseUrl}/api/mp/webhook`
    };

    const idempotencyKey = `pix-${uid}-${Date.now()}-${randomUUID()}`;

    console.log('[pix/create] body:', body);

    const response = await axios.post(
      'https://api.mercadopago.com/v1/payments',
      body,
      {
        headers: {
          Authorization: `Bearer ${config.mpAccessToken}`,
          'X-Idempotency-Key': idempotencyKey
        }
      }
    );

    const data = response.data;
    const transaction = data.point_of_interaction?.transaction_data || {};
    return res.json({
      id: data.id,
      status: data.status,
      qr_code: transaction.qr_code,
      qr_code_base64: transaction.qr_code_base64,
      ticket_url: transaction.ticket_url
    });
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error('pix/create ERROR:', status, JSON.stringify(data || error.message, null, 2));
    return res.status(500).json({ error: 'Falha ao criar PIX', details: { status, data } });
  }
});

router.get('/payment/:id', async (req, res) => {
  try {
    if (!requireMercadoPagoToken(res)) return;

    const { id } = req.params;
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${id}`,
      { headers: { Authorization: `Bearer ${config.mpAccessToken}` } }
    );
    const payment = response.data;
    return res.json({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail
    });
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error('payment/status ERROR:', status, data || error.message);
    return res.status(500).json({ error: 'Falha ao consultar pagamento', details: { status, data } });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    if (!config.mpAccessToken) {
      console.error('webhook ERROR: MP_ACCESS_TOKEN ausente no .env');
      return res.status(200).send('ok');
    }

    const topic = req.query.topic || req.body?.type;
    const paymentId = req.query.id || req.body?.data?.id;

    console.log('[webhook] topic:', topic, 'paymentId:', paymentId);

    if (topic !== 'payment' || !paymentId) {
      return res.status(200).send('ignored');
    }

    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${config.mpAccessToken}` } }
    );

    const payment = response.data;
    const metadata = payment.metadata || {};
    const isApproved = payment.status === 'approved';
    const isBRL = payment.currency_id === 'BRL';
    const amount = payment.transaction_amount;

    if (isApproved && isBRL && (metadata?.email || metadata?.uid) && amount >= (metadata.amount || 0)) {
      const purchase = {
        id: payment.id,
        amount,
        method: payment.payment_method_id,
        dateApproved: payment.date_approved
      };
      if (metadata.email) {
        await activateProByEmail(metadata.email, purchase);
      }
      await activateProLegacyUser(metadata.uid, purchase);
    } else {
      console.warn('[webhook] pagamento não aprovado/ inválido:', {
        status: payment.status,
        currency_id: payment.currency_id,
        amount,
        metadata
      });
    }

    return res.status(200).send('ok');
  } catch (error) {
    console.error('webhook ERROR:', error.response?.status, error.response?.data || error.message);
    return res.status(200).send('ok');
  }
});

export default router;
