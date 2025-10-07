import * as z from 'zod';

export const contractorSchema = z.object({
  id: z.string(),
  name: z.string(),
  cpfCnpj: z.string(),
  address: z.string(),
  email: z.string().email(),
});

export type Contractor = z.infer<typeof contractorSchema>;

export type ServiceType =
  | 'Produção de Vídeo'
  | 'Edição de Vídeo'
  | 'Criação de Site'
  | 'Filmagem com Drone'
  | 'Desenvolvimento de Software'
  | 'Motion Graphics';

export const serviceContractSchema = z.object({
  serviceType: z.string(),
  contractTitle: z.string(),
  contractors: z.array(contractorSchema),
  object: z.string(),
  totalValue: z.number(),
  paymentMethod: z.enum(['À vista', 'Sinal + Entrega', 'Outro']),
  paymentSignalPercentage: z.number().optional(),
  paymentMethodOther: z.string().optional(),
  deliveryDeadline: z.string(),
  contractorResponsibilities: z.string(),
  clientResponsibilities: z.string(),
  copyright: z.string(),
  rescissionNoticePeriod: z.number(),
  rescissionFine: z.number(),
  jurisdiction: z.string(),
  signatureCity: z.string(),
  signatureDate: z.string(),
});

export type ServiceContractData = z.infer<typeof serviceContractSchema>;

export const companyData = {
    name: "FastFilms",
    cnpj: "53.525.841/0001-89",
    address: "Rua Bartolomeu Bueno de Gusmao, 594 - Aeronautas, Lagoa Santa - MG, 33.236-454",
    email: "fastfilmsoficial@gmail.com"
}
