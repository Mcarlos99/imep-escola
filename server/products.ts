/**
 * Produtos e preços do Stripe
 * 
 * Este arquivo centraliza a configuração de produtos para o Stripe.
 * Os cursos são gerenciados dinamicamente no banco de dados, então
 * não precisamos criar produtos fixos aqui.
 * 
 * O preço de cada curso será criado dinamicamente no checkout.
 */

export interface CourseProduct {
  name: string;
  description: string;
  price: number; // em centavos (R$ 349,00 = 34900)
  currency: string;
  courseId: number;
}

/**
 * Configuração de métodos de pagamento disponíveis
 */
export const PAYMENT_METHODS = {
  card: true,
  pix: true,
  boleto: true,
} as const;

/**
 * Configuração de moeda
 */
export const CURRENCY = 'brl';

/**
 * URLs de redirecionamento após pagamento
 */
export function getSuccessUrl(origin: string, enrollmentId: number): string {
  return `${origin}/matricula/sucesso?enrollment=${enrollmentId}`;
}

export function getCancelUrl(origin: string, courseId: number): string {
  return `${origin}/cursos/${courseId}?checkout=cancelled`;
}

/**
 * Converter preço de decimal para centavos
 */
export function priceToStripeAmount(price: number): number {
  return Math.round(price * 100);
}

/**
 * Converter preço de centavos para decimal
 */
export function stripeAmountToPrice(amount: number): number {
  return amount / 100;
}
