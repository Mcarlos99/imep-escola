# Sistema de Pagamentos - IMEP

## Visão Geral

O sistema de pagamentos do IMEP foi integrado com o **Stripe**, permitindo que alunos façam matrículas e pagamentos diretamente pelo site. O sistema suporta múltiplos métodos de pagamento, incluindo:

- 💳 **Cartão de Crédito** (nacional e internacional)
- 🏦 **Boleto Bancário** (vencimento em 3 dias)
- 📱 **PIX** (disponível via Stripe)

---

## Arquitetura do Sistema

### 1. Banco de Dados

Duas novas tabelas foram criadas para gerenciar matrículas e pagamentos:

#### Tabela `enrollments` (Matrículas)
```sql
- id: INT (PK, AUTO_INCREMENT)
- userId: INT (FK → users.id)
- courseId: INT (FK → courses.id)
- stripeCustomerId: VARCHAR(255)
- stripePaymentIntentId: VARCHAR(255)
- stripeCheckoutSessionId: VARCHAR(255)
- status: ENUM('pending', 'active', 'completed', 'cancelled')
- enrollmentDate: TIMESTAMP
- completionDate: TIMESTAMP (nullable)
- certificateIssued: BOOLEAN
- certificateUrl: VARCHAR(500)
- notes: TEXT
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### Tabela `payments` (Pagamentos)
```sql
- id: INT (PK, AUTO_INCREMENT)
- enrollmentId: INT (FK → enrollments.id)
- userId: INT (FK → users.id)
- stripePaymentIntentId: VARCHAR(255)
- stripeChargeId: VARCHAR(255)
- amount: DECIMAL(10,2)
- currency: VARCHAR(3)
- status: ENUM('pending', 'succeeded', 'failed', 'refunded')
- paymentMethod: VARCHAR(50)
- paidAt: TIMESTAMP
- refundedAt: TIMESTAMP
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

**Princípio de Design:** Armazenamos apenas IDs do Stripe e metadados essenciais. Dados detalhados de pagamento são consultados via API do Stripe quando necessário.

---

### 2. Backend (API)

#### Rotas tRPC

**`payments.createCheckout`** (Protegida - Requer Login)
- Cria uma sessão de checkout no Stripe
- Entrada: `{ courseId: number }`
- Saída: `{ checkoutUrl: string }`
- Redireciona o usuário para o Stripe Checkout

**`payments.verifySession`** (Protegida - Requer Login)
- Verifica o status de uma sessão de checkout
- Entrada: `{ sessionId: string }`
- Saída: `{ success: boolean, enrollment?: Enrollment }`
- Cria matrícula e registro de pagamento se pagamento foi bem-sucedido

**`enrollments.list`** (Protegida - Requer Login)
- Lista matrículas do usuário logado
- Entrada: nenhuma
- Saída: `Enrollment[]`

**`enrollments.listAll`** (Admin)
- Lista todas as matrículas (com filtros)
- Entrada: `{ status?: string, limit?: number, offset?: number }`
- Saída: `Enrollment[]`

**`enrollments.updateStatus`** (Admin)
- Atualiza status de uma matrícula
- Entrada: `{ id: number, status: string, notes?: string }`
- Saída: `Enrollment`

**`enrollments.issueCertificate`** (Admin)
- Emite certificado para uma matrícula concluída
- Entrada: `{ id: number, certificateUrl: string }`
- Saída: `Enrollment`

#### Webhook do Stripe

**Endpoint:** `POST /api/stripe/webhook`

Eventos processados:
- `checkout.session.completed`: Cria matrícula quando pagamento é confirmado
- `payment_intent.succeeded`: Atualiza status do pagamento para "succeeded"
- `payment_intent.payment_failed`: Marca pagamento como falho
- `charge.refunded`: Processa reembolsos

**Segurança:** O webhook valida a assinatura do Stripe antes de processar qualquer evento.

---

### 3. Frontend

#### Página de Detalhes do Curso (`/curso/:slug`)

- Botão **"Matricular-se Agora"** substituiu o link do WhatsApp
- Ao clicar:
  1. Verifica se usuário está logado
  2. Se não, redireciona para login
  3. Se sim, cria sessão de checkout via `payments.createCheckout`
  4. Abre Stripe Checkout em nova aba

#### Página de Sucesso (`/matricula/sucesso`)

- Exibida após pagamento bem-sucedido
- Verifica sessão via `payments.verifySession`
- Mostra detalhes da matrícula
- Links para área do aluno e suporte

#### Painel Admin - Matrículas (`/admin/matriculas`)

- Lista todas as matrículas
- Filtros por status (pendente, ativa, concluída, cancelada)
- Estatísticas em tempo real
- Gerenciamento de status e observações
- Emissão de certificados

---

## Configuração do Stripe

### Variáveis de Ambiente

As seguintes variáveis são configuradas automaticamente pelo sistema:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Configuração do Webhook

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá em **Developers → Webhooks**
3. Clique em **Add endpoint**
4. URL do webhook: `https://seu-dominio.com/api/stripe/webhook`
5. Eventos para ouvir:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

### Reivindicar Sandbox do Stripe

O sistema criou um sandbox de teste do Stripe. Para ativá-lo:

1. Acesse: https://dashboard.stripe.com/claim_sandbox/YWNjdF8xU3UxNlVMT3JPVlV0YUMyLDE3NzAzMjIwNjMv100HASA4vq4
2. Prazo: até 30/03/2026
3. Após reivindicar, você terá acesso completo ao ambiente de testes

---

## Fluxo de Pagamento

### 1. Usuário Seleciona Curso

```
Página do Curso → Botão "Matricular-se Agora"
```

### 2. Checkout

```
Frontend cria sessão → Stripe Checkout abre → Usuário preenche dados
```

### 3. Processamento

```
Stripe processa pagamento → Webhook notifica sistema → Matrícula criada
```

### 4. Confirmação

```
Usuário redirecionado → Página de sucesso → E-mail enviado (futuro)
```

---

## Testes

### Cartões de Teste

Use estes cartões para testar no ambiente de desenvolvimento:

| Cartão | Número | Resultado |
|--------|--------|-----------|
| Sucesso | 4242 4242 4242 4242 | Pagamento aprovado |
| Falha | 4000 0000 0000 0002 | Cartão recusado |
| 3D Secure | 4000 0027 6000 3184 | Requer autenticação |

**CVV:** Qualquer 3 dígitos  
**Data:** Qualquer data futura  
**CEP:** Qualquer 5 dígitos

### Boleto de Teste

- Use qualquer CPF válido
- O boleto será gerado instantaneamente
- No ambiente de teste, considere o boleto como pago imediatamente

### PIX de Teste

- O QR Code será gerado
- No ambiente de teste, o pagamento é confirmado automaticamente

---

## Segurança

### Boas Práticas Implementadas

1. ✅ **Validação de Webhook**: Todas as requisições do Stripe são verificadas via assinatura
2. ✅ **Autenticação**: Apenas usuários logados podem criar checkout
3. ✅ **Autorização**: Apenas admins podem gerenciar matrículas
4. ✅ **Dados Mínimos**: Armazenamos apenas IDs do Stripe, não dados sensíveis
5. ✅ **HTTPS**: Obrigatório para webhooks e checkout

### O que NÃO armazenamos

- ❌ Números de cartão completos
- ❌ CVV
- ❌ Dados bancários
- ❌ Senhas ou PINs

---

## Monitoramento

### Logs do Stripe

Todos os eventos são registrados no Stripe Dashboard:
- **Developers → Events**: Histórico completo de eventos
- **Developers → Webhooks**: Status de entrega dos webhooks
- **Payments**: Lista de todos os pagamentos

### Logs do Sistema

Os webhooks registram eventos no console do servidor:
```
[Stripe Webhook] Received event: checkout.session.completed (evt_xxx)
[Stripe Webhook] Created enrollment 123 for user 456
```

---

## Produção

### Checklist para Go-Live

- [ ] Reivindicar sandbox do Stripe
- [ ] Completar verificação KYC no Stripe
- [ ] Obter chaves de produção (live keys)
- [ ] Atualizar variáveis de ambiente em Settings → Payment
- [ ] Configurar webhook de produção
- [ ] Testar com valor mínimo (R$ 0,50)
- [ ] Usar código promocional de 99% de desconto para testes finais

### Limites do Stripe

- **Valor mínimo:** R$ 0,50 (US$ 0,50)
- **Valor máximo:** Sem limite (após verificação KYC)
- **Taxa Stripe Brasil:** 3,99% + R$ 0,39 por transação

---

## Suporte

### Problemas Comuns

**1. Webhook não está funcionando**
- Verifique se a URL está acessível publicamente
- Confirme que o `STRIPE_WEBHOOK_SECRET` está correto
- Veja logs em Stripe Dashboard → Developers → Webhooks

**2. Pagamento aprovado mas matrícula não criada**
- Verifique logs do webhook
- Confirme que o evento `checkout.session.completed` foi recebido
- Verifique se há erros no banco de dados

**3. Erro "No procedure found on path"**
- Reinicie o servidor de desenvolvimento
- Limpe o cache: `rm -rf node_modules/.cache`
- Verifique se as rotas tRPC foram exportadas corretamente

### Contato

- **Stripe Support**: https://support.stripe.com
- **Documentação Stripe**: https://stripe.com/docs
- **Dashboard Stripe**: https://dashboard.stripe.com

---

## Roadmap Futuro

### Melhorias Planejadas

1. **E-mails Transacionais**
   - Confirmação de matrícula
   - Recibo de pagamento
   - Lembrete de vencimento de boleto

2. **Pagamentos Recorrentes**
   - Mensalidades automáticas via Stripe Subscriptions
   - Gerenciamento de inadimplência

3. **Cupons de Desconto**
   - Sistema de cupons promocionais
   - Descontos por indicação

4. **Relatórios Financeiros**
   - Dashboard de receitas
   - Exportação para Excel/PDF
   - Integração com contabilidade

5. **Área do Aluno Completa**
   - Histórico de pagamentos
   - Download de recibos
   - Renovação de matrícula

---

## Conclusão

O sistema de pagamentos está totalmente funcional e pronto para uso. Todos os componentes foram testados e seguem as melhores práticas de segurança e arquitetura.

Para dúvidas ou suporte, consulte a documentação do Stripe ou entre em contato com o suporte técnico.
