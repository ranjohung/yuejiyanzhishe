/**
 * POST /api/v1/order/create
 * 创建支付订单（V2 用，V1 先写骨架）
 *
 * 请求体：
 *   {
 *     order_type: 1|2|3,   // 1=会员购买 2=积分充值 3=效果图购买
 *     item_id: string,      // membership_id / point_pack_id / tryon_id
 *     item_name: string,
 *     amount: number,       // 元
 *     payment_method: 1|2   // 1=wechat 2=alipay
 *   }
 *
 * 响应：
 *   { order_no, status: 0, ...支付参数 }
 *
 * V1 状态：骨架 + 校验 + 生成 order_no — 不调真实支付
 *         后续接微信支付时：调 wx.unifiedOrder 下单 → 返回 timeStamp/nonceStr/package/paySign
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { responseSuccess, responseError } from '@/lib/utils'

export const runtime = 'nodejs'

function genOrderNo(): string {
  const d = new Date()
  const pad = (n: number, w = 2) => String(n).padStart(w, '0')
  const prefix = `YZ${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}${rand}`
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (!auth.ok) return NextResponse.json(auth.error!, { status: 401 })

  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json(responseError(400, '请求体不是合法 JSON'), { status: 400 }) }

  const { order_type, item_id, item_name, amount, payment_method } = body || {}

  if (!order_type || ![1, 2, 3].includes(order_type)) {
    return NextResponse.json(responseError(400, '无效的 order_type（1/2/3）'), { status: 400 })
  }
  if (!item_name) {
    return NextResponse.json(responseError(400, '缺少 item_name'), { status: 400 })
  }
  if (!amount || amount <= 0) {
    return NextResponse.json(responseError(400, '无效的 amount'), { status: 400 })
  }

  const orderNo = genOrderNo()
  const order = await prisma.order.create({
    data: {
      user: { connect: { id: auth.userId! } },
      order_no: orderNo,
      order_type,
      item_id: item_id ?? null,
      item_name,
      amount: String(amount), // Decimal 类型传 string
      payment_method: payment_method ?? 1,
      payment_status: 0,
    },
  })

  // V1 返回订单号 + status=pending，前端可展示 mock 支付按钮
  // V2 接微信支付时这里返回完整调起参数
  return NextResponse.json(responseSuccess({
    order_no: order.order_no,
    status: order.payment_status,
    order_id: order.id,
    // TODO: 真实支付接入后返回
    // wechat_params: { timeStamp, nonceStr, package, paySign }
  }))
}
