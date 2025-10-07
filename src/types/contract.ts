
import * as z from 'zod';

export const contractorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório."),
  cpfCnpj: z.string().min(1, "CPF/CNPJ é obrigatório."),
  address: z.string().min(1, "Endereço é obrigatório."),
  email: z.string().email("E-mail inválido."),
});

export type Contractor = z.infer<typeof contractorSchema>;

export type ServiceType =
  | 'Produção de Vídeo'
  | 'Edição de Vídeo'
  | 'Website'
  | 'Drone'
  | 'Desenvolvimento de Software'
  | 'Motion Graphics';

export const serviceContractSchema = z.object({
  serviceType: z.string().min(1),
  contractTitle: z.string().min(1),
  contractors: z.array(contractorSchema).min(1, "Adicione pelo menos um contratante."),
  object: z.string().min(1, "Objeto do contrato é obrigatório."),
  totalValue: z.number().positive("Valor deve ser maior que zero."),
  paymentMethod: z.enum(['À vista', 'Sinal + Entrega', 'Outro']),
  paymentSignalPercentage: z.number().optional(),
  paymentMethodOther: z.string().optional(),
  deliveryDeadline: z.string().min(1, "Prazo de entrega é obrigatório."),
  contractorResponsibilities: z.string().min(1, "Responsabilidades da contratada são obrigatórias."),
  clientResponsibilities: z.string().min(1, "Responsabilidades do contratante são obrigatórias."),
  copyright: z.string().min(1, "Cláusula de direitos autorais é obrigatória."),
  rescissionNoticePeriod: z.number(),
  rescissionFine: z.number(),
  generalDispositions: z.string().min(1, "As disposições gerais são obrigatórias."),
  warranty: z.string().optional(),
  specifications: z.string().optional(),
  jurisdiction: z.string().min(1, "Foro é obrigatório."),
  signatureCity: z.string().min(1, "Cidade da assinatura é obrigatória."),
  signatureDate: z.string().min(1, "Data da assinatura é obrigatória."),
});

export type ServiceContractData = z.infer<typeof serviceContractSchema>;

export const authorizationTermSchema = z.object({
  authorizedName: z.string().min(1, "Nome do autorizado é obrigatório."),
  authorizedCpfCnpj: z.string().min(1, "CPF/CNPJ do autorizado é obrigatório."),
  authorizedAddress: z.string().min(1, "Endereço do autorizado é obrigatório."),
  authorizedEmail: z.string().email("E-mail inválido."),
  projectName: z.string().min(1, "Nome do projeto é obrigatório."),
  finalClient: z.string().min(1, "Cliente final é obrigatório."),
  executionDate: z.string().min(1, "Data de execução é obrigatória."),
  authorizedLinks: z.string().min(1, "Pelo menos um link é obrigatório."),
  permissionsAndProhibitions: z.string().min(1, "A cláusula de permissões é obrigatória."),
  fineValue: z.number().min(0, "O valor da multa não pode ser negativo."),
  generalDispositions: z.string().optional(),
  jurisdiction: z.string().min(1, "Foro é obrigatório."),
  signatureCity: z.string().min(1, "Cidade da assinatura é obrigatória."),
  signatureDate: z.string().min(1, "Data da assinatura é obrigatória."),
});

export type AuthorizationTermData = z.infer<typeof authorizationTermSchema>;


export const companyData = {
    name: "FastFilms",
    cnpj: "53.525.841/0001-89",
    address: "Rua Bartolomeu Bueno de Gusmao, 594 - Aeronautas, Lagoa Santa - MG, 33.236-454",
    email: "fastfilmsoficial@gmail.com"
}
